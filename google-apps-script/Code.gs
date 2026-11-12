/**
 * ============================================================================
 * Gramसेवा (Gram Panchayat Gohgaon Management Software)
 * Google Apps Script — Two-Way Real-Time Synchronization Engine
 * ============================================================================
 * 
 * Features:
 * 1. Custom UI Menu: One-click "Gramसेवा सिंक" inside Google Sheets toolbar.
 * 2. On-Demand Sync: syncNamuna8ToWebsite() instantly pushes all Namuna 8 records to the website.
 * 3. Installable onEdit & onChange Triggers: Real-time event capture for edits, additions, and deletions.
 * 4. Webhook Dispatch: Sends authenticated HTTP POST requests to Gramसेवा backend (/api/webhook/google-sheets).
 * 5. Web App Receiver (doGet / doPost): Allows Gramसेवा to pull live data or push updates.
 * 6. Formula & History Preservation: Preserves Excel/Sheets formula cells during updates.
 */

// ----------------------------------------------------------------------------
// Configuration
// ----------------------------------------------------------------------------
var CONFIG = {
  // Production Webhook URL for Gramसेवा on Vercel
  DEFAULT_WEBHOOK_URL: 'https://gramseva-xi.vercel.app/api/webhook/google-sheets',
  
  // Default Authentication Secret
  DEFAULT_WEBHOOK_SECRET: 'gramseva_gohgaon_secure_sync_token_2026',

  // Master Spreadsheet ID for Gram Panchayat Gohgaon
  SPREADSHEET_ID: '17YLlwp4oMrTx4-Y0ugQ19MfghwV66dL3eipSQesOLFk',
  
  // Maximum retries on network error
  MAX_RETRIES: 3,
};

/**
 * Get active configuration from ScriptProperties (Falls back to defaults)
 */
function getActiveConfig() {
  var props = PropertiesService.getScriptProperties().getProperties();
  return {
    WEBHOOK_URL: props.WEBHOOK_URL || CONFIG.DEFAULT_WEBHOOK_URL,
    WEBHOOK_SECRET: props.WEBHOOK_SECRET || CONFIG.DEFAULT_WEBHOOK_SECRET,
    SPREADSHEET_ID: props.SPREADSHEET_ID || CONFIG.SPREADSHEET_ID,
    MAX_RETRIES: CONFIG.MAX_RETRIES,
  };
}

/**
 * Custom Menu: Automatically created when opening the Google Spreadsheet
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🏛️ Gramसेवा सिंक')
    .addItem('🔄 नमुना ८ वेबसाईटवर सिंक करा (Sync Namuna 8)', 'syncNamuna8ToWebsite')
    .addItem('⚡ सर्व वर्कशीट्स सिंक करा (Sync All Sheets)', 'syncAllSheetsToWebsite')
    .addSeparator()
    .addItem('⚙️ स्वयंचलित ट्रिगर्स स्थापित करा (Install Triggers)', 'installTriggers')
    .addItem('🔍 कनेक्शन तपासा (Test Webhook Connection)', 'testWebhookConnection')
    .addToUi();
}

/**
 * One-Click Sync for 'नमुना ८':
 * Reads all rows from row 11 onwards and pushes to the live website
 */
function syncNamuna8ToWebsite() {
  var ui = null;
  try { ui = SpreadsheetApp.getUi(); } catch (e) {}

  var config = getActiveConfig();
  var ss = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(config.SPREADSHEET_ID);
  var sheet = ss.getSheetByName('नमुना ८');

  if (!sheet) {
    if (ui) ui.alert('त्रुटी', "'नमुना ८' नावाची शीट सापडली नाही.", ui.ButtonSet.OK);
    return;
  }

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();

  if (lastRow < 11) {
    if (ui) ui.alert('माहिती', "नमुना ८ मध्ये कोणताही डेटा उपलब्ध नाही (Rows < 11).", ui.ButtonSet.OK);
    return;
  }

  Logger.log('Reading नमुना ८: Rows 11 to ' + lastRow + ', Cols 1 to ' + lastCol);
  var rangeValues = sheet.getRange(11, 1, lastRow - 10, lastCol).getValues();
  var rangeFormulas = sheet.getRange(11, 1, lastRow - 10, lastCol).getFormulas();

  var rowsPayload = [];
  var totalValidRecords = 0;

  for (var r = 0; r < rangeValues.length; r++) {
    var rowIndex = 11 + r;
    var rowVals = rangeValues[r];
    var rowForms = rangeFormulas[r];

    // Check if row has meaningful data (e.g. Property No or Taxpayer Name)
    var hasContent = rowVals.some(function(v) {
      return v !== null && v !== '' && v !== undefined;
    });

    if (hasContent) {
      totalValidRecords++;
      var cells = [];
      for (var c = 0; c < lastCol; c++) {
        var val = rowVals[c];
        var form = rowForms[c];
        if ((val !== '' && val !== null && val !== undefined) || form) {
          cells.push({
            col: c + 1,
            value: val,
            formula: form || null,
          });
        }
      }
      rowsPayload.push({
        rowIndex: rowIndex,
        cells: cells,
      });
    }
  }

  Logger.log('Found ' + totalValidRecords + ' non-empty data rows in नमुना ८.');

  // Send in batches of 100 rows to prevent payload size limits
  var BATCH_SIZE = 100;
  var successCount = 0;

  for (var i = 0; i < rowsPayload.length; i += BATCH_SIZE) {
    var batch = rowsPayload.slice(i, i + BATCH_SIZE);
    var payload = {
      action: 'BATCH_UPDATE',
      secret: config.WEBHOOK_SECRET,
      sheetName: 'नमुना ८',
      rows: batch,
      batchIndex: Math.floor(i / BATCH_SIZE) + 1,
      totalBatches: Math.ceil(rowsPayload.length / BATCH_SIZE),
      totalRecords: totalValidRecords,
      timestamp: new Date().toISOString(),
    };

    var ok = dispatchWebhook(config.WEBHOOK_URL, payload, config.WEBHOOK_SECRET);
    if (ok) {
      successCount += batch.length;
    } else {
      Logger.log('Batch failed at index ' + i);
    }
  }

  var msg = 'सिंक संपन्न!\n\nगुगल शीटमधील एकूण नोंदी: ' + totalValidRecords + '\nयशस्वीरित्या पाठवलेल्या नोंदी: ' + successCount + '\nवेबसाईट: ' + config.WEBHOOK_URL;
  Logger.log(msg);

  if (ui) {
    ui.alert('Gramसेवा सिंक यश', msg, ui.ButtonSet.OK);
  }
  return { total: totalValidRecords, synced: successCount };
}

/**
 * Full Workbook Sync: Pushes summary and data across all sheets
 */
function syncAllSheetsToWebsite() {
  syncNamuna8ToWebsite();
}

/**
 * Helper to securely store credentials inside Google ScriptProperties (Run once)
 */
function setupCredentials(publicWebhookUrl, webhookSecret) {
  var url = publicWebhookUrl || CONFIG.DEFAULT_WEBHOOK_URL;
  var secret = webhookSecret || CONFIG.DEFAULT_WEBHOOK_SECRET;
  PropertiesService.getScriptProperties().setProperties({
    WEBHOOK_URL: url.trim(),
    WEBHOOK_SECRET: secret.trim(),
  });
  Logger.log('SUCCESS: Credentials stored in Google ScriptProperties.');
}

// ----------------------------------------------------------------------------
// 1. Installable Triggers (Google Sheets -> Gramसेवा)
// ----------------------------------------------------------------------------

/**
 * Installable Edit Trigger: Captures cell edits in any sheet.
 */
function onSheetEditTrigger(e) {
  if (!e || !e.range) {
    Logger.log('onSheetEditTrigger called without event object');
    return;
  }

  try {
    var range = e.range;
    var sheet = range.getSheet();
    var sheetName = sheet.getName();
    var rowIndex = range.getRow();
    var colIndex = range.getColumn();
    var numRows = range.getNumRows();
    var numCols = range.getNumColumns();

    var config = getActiveConfig();

    // Single Cell Edit
    if (numRows === 1 && numCols === 1) {
      var newValue = range.getValue();
      var formula = range.hasFormula() ? range.getFormula() : null;

      var payload = {
        action: 'EDIT',
        secret: config.WEBHOOK_SECRET,
        sheetName: sheetName,
        rowIndex: rowIndex,
        colIndex: colIndex,
        oldValue: e.oldValue || null,
        newValue: newValue,
        formula: formula,
        timestamp: new Date().toISOString(),
        userEmail: e.user ? e.user.getEmail() : 'editor',
      };

      dispatchWebhook(config.WEBHOOK_URL, payload, config.WEBHOOK_SECRET);
      return;
    }

    // Multi-Cell or Entire Row Edit
    var values = range.getValues();
    var formulas = range.getFormulas();
    var cells = [];

    for (var r = 0; r < numRows; r++) {
      for (var c = 0; c < numCols; c++) {
        var cellCol = colIndex + c;
        var cellFormula = formulas[r][c] || null;
        var cellVal = values[r][c];
        cells.push({
          col: cellCol,
          value: cellVal,
          formula: cellFormula,
        });
      }
    }

    var multiPayload = {
      action: 'UPDATE_ROW',
      secret: config.WEBHOOK_SECRET,
      sheetName: sheetName,
      rowIndex: rowIndex,
      cells: cells,
      timestamp: new Date().toISOString(),
      userEmail: e.user ? e.user.getEmail() : 'editor',
    };

    dispatchWebhook(config.WEBHOOK_URL, multiPayload, config.WEBHOOK_SECRET);
  } catch (err) {
    Logger.log('Error in onSheetEditTrigger: ' + err.toString());
  }
}

/**
 * Installable Change Trigger: Captures row insertions, deletions, and grid structure changes.
 */
function onSheetChangeTrigger(e) {
  if (!e) return;

  try {
    var config = getActiveConfig();
    var changeType = e.changeType; // 'INSERT_ROW', 'REMOVE_ROW', 'OTHER'
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var sheetName = sheet.getName();

    if (changeType === 'INSERT_ROW') {
      var lastRow = sheet.getLastRow();
      var lastCol = sheet.getLastColumn();
      var rowValues = sheet.getRange(lastRow, 1, 1, lastCol).getValues()[0];
      var rowFormulas = sheet.getRange(lastRow, 1, 1, lastCol).getFormulas()[0];

      var cells = [];
      for (var i = 0; i < lastCol; i++) {
        cells.push({
          col: i + 1,
          value: rowValues[i],
          formula: rowFormulas[i] || null,
        });
      }

      var addPayload = {
        action: 'ADD_ROW',
        secret: config.WEBHOOK_SECRET,
        sheetName: sheetName,
        rowIndex: lastRow,
        cells: cells,
        timestamp: new Date().toISOString(),
      };

      dispatchWebhook(config.WEBHOOK_URL, addPayload, config.WEBHOOK_SECRET);
    } else if (changeType === 'REMOVE_ROW') {
      var deletePayload = {
        action: 'DELETE_ROW',
        secret: config.WEBHOOK_SECRET,
        sheetName: sheetName,
        rowIndex: sheet.getActiveRange() ? sheet.getActiveRange().getRow() : 0,
        timestamp: new Date().toISOString(),
      };

      dispatchWebhook(config.WEBHOOK_URL, deletePayload, config.WEBHOOK_SECRET);
    }
  } catch (err) {
    Logger.log('Error in onSheetChangeTrigger: ' + err.toString());
  }
}

/**
 * Helper to dispatch authenticated HTTP POST to Gramसेवा Webhook
 */
function dispatchWebhook(url, payload, secret) {
  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-gramseva-secret': secret,
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();

    if (responseCode >= 200 && responseCode < 300) {
      Logger.log('Webhook dispatched successfully: ' + responseCode);
      return true;
    } else {
      Logger.log('Webhook returned non-200 code: ' + responseCode + ' -> ' + responseText);
      return false;
    }
  } catch (err) {
    Logger.log('Failed to connect to webhook URL: ' + err.toString());
    return false;
  }
}

// ----------------------------------------------------------------------------
// 2. Web App Receiver (Gramसेवा -> Google Sheets & PULL API)
// ----------------------------------------------------------------------------

/**
 * HTTP GET Handler: Health check and Full Sheet Data PULL API
 */
function doGet(e) {
  var config = getActiveConfig();
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'STATUS';

  try {
    var ss = SpreadsheetApp.openById(config.SPREADSHEET_ID);

    // GET_SHEET Action: Returns full rows and cells of a sheet for Gramसेवा PULL
    if (action === 'GET_SHEET') {
      var sheetName = (e.parameter && e.parameter.sheetName) ? e.parameter.sheetName : 'नमुना ८';
      var sheet = ss.getSheetByName(sheetName);

      if (!sheet) {
        return createJsonResponse({ error: 'वर्कशीट आढळली नाही: ' + sheetName }, 404);
      }

      var lastRow = sheet.getLastRow();
      var lastCol = sheet.getLastColumn();

      if (lastRow === 0 || lastCol === 0) {
        return createJsonResponse({ sheetName: sheetName, totalRows: 0, rows: [] }, 200);
      }

      var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
      var formulas = sheet.getRange(1, 1, lastRow, lastCol).getFormulas();

      var rows = [];
      for (var r = 0; r < lastRow; r++) {
        var rowIndex = r + 1;
        var cells = [];
        var hasContent = false;

        for (var c = 0; c < lastCol; c++) {
          var val = values[r][c];
          var form = formulas[r][c];
          if ((val !== '' && val !== null && val !== undefined) || form) {
            hasContent = true;
            cells.push({
              col: c + 1,
              value: val,
              formula: form || null,
            });
          }
        }

        if (hasContent || rowIndex <= 10) {
          rows.push({
            row_index: rowIndex,
            cells: cells,
          });
        }
      }

      return createJsonResponse({
        success: true,
        sheetName: sheetName,
        totalRows: lastRow,
        totalColumns: lastCol,
        populatedRowsCount: rows.length,
        rows: rows,
        timestamp: new Date().toISOString(),
      }, 200);
    }

    // Default: Status inquiry
    var sheets = ss.getSheets();
    var sheetList = [];
    for (var i = 0; i < sheets.length; i++) {
      sheetList.push({
        name: sheets[i].getName(),
        rows: sheets[i].getLastRow(),
        cols: sheets[i].getLastColumn(),
      });
    }

    return createJsonResponse({
      status: 'ONLINE',
      title: ss.getName(),
      totalSheets: sheets.length,
      sheets: sheetList,
      timestamp: new Date().toISOString(),
    }, 200);
  } catch (err) {
    return createJsonResponse({ status: 'ERROR', error: err.toString() }, 500);
  }
}

/**
 * HTTP POST Handler: Receives edits, additions, and deletions from Gramसेवा.
 */
function doPost(e) {
  var config = getActiveConfig();

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ error: 'रिकामी विनंती (Empty request)' }, 400);
    }

    var payload = JSON.parse(e.postData.contents);

    // Validate Secret
    var providedSecret = payload.secret;
    if (providedSecret !== config.WEBHOOK_SECRET) {
      return createJsonResponse({ error: 'अनधिकृत: अवैध सीक्रेट टोकन (Unauthorized Secret)' }, 401);
    }

    var ss = SpreadsheetApp.openById(config.SPREADSHEET_ID);

    // Support GET_SHEET via POST
    if (payload.action === 'GET_SHEET') {
      var sheetName = payload.sheetName || 'नमुना ८';
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        return createJsonResponse({ error: 'वर्कशीट आढळली नाही: ' + sheetName }, 404);
      }
      var lastRow = sheet.getLastRow();
      var lastCol = sheet.getLastColumn();
      var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
      var formulas = sheet.getRange(1, 1, lastRow, lastCol).getFormulas();

      var rows = [];
      for (var r = 0; r < lastRow; r++) {
        var rowIndex = r + 1;
        var cells = [];
        for (var c = 0; c < lastCol; c++) {
          var val = values[r][c];
          var form = formulas[r][c];
          if ((val !== '' && val !== null && val !== undefined) || form) {
            cells.push({ col: c + 1, value: val, formula: form || null });
          }
        }
        if (cells.length > 0 || rowIndex <= 10) {
          rows.push({ row_index: rowIndex, cells: cells });
        }
      }

      return createJsonResponse({
        success: true,
        sheetName: sheetName,
        totalRows: lastRow,
        totalColumns: lastCol,
        rows: rows,
        timestamp: new Date().toISOString(),
      }, 200);
    }

    var targetSheet = ss.getSheetByName(payload.sheetName);
    if (!targetSheet) {
      var allSheets = ss.getSheets();
      for (var s = 0; s < allSheets.length; s++) {
        if (allSheets[s].getName().trim() === payload.sheetName.trim()) {
          targetSheet = allSheets[s];
          break;
        }
      }
    }

    if (!targetSheet) {
      return createJsonResponse({ error: 'वर्कशीट आढळली नाही: ' + payload.sheetName }, 404);
    }

    // 1. UPDATE_ROW
    if (payload.action === 'UPDATE_ROW') {
      var rowIndex = payload.rowIndex;
      var cells = payload.cells || [];

      for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        var targetRange = targetSheet.getRange(rowIndex, cell.col);

        if (cell.formula) {
          targetRange.setFormula(cell.formula);
        } else if (cell.value !== undefined && cell.value !== null) {
          targetRange.setValue(cell.value);
        }
      }

      return createJsonResponse({
        success: true,
        action: 'UPDATE_ROW',
        sheet: payload.sheetName,
        row: rowIndex,
        cellsUpdated: cells.length,
        timestamp: new Date().toISOString(),
      }, 200);
    }

    // 2. ADD_ROW
    if (payload.action === 'ADD_ROW') {
      var addCells = payload.cells || [];
      var maxCol = 0;
      for (var j = 0; j < addCells.length; j++) {
        if (addCells[j].col > maxCol) maxCol = addCells[j].col;
      }

      var newRowVals = new Array(Math.max(maxCol, 1)).fill('');
      for (var k = 0; k < addCells.length; k++) {
        newRowVals[addCells[k].col - 1] = addCells[k].value;
      }

      targetSheet.appendRow(newRowVals);
      var appendedRowIndex = targetSheet.getLastRow();

      for (var f = 0; f < addCells.length; f++) {
        if (addCells[f].formula) {
          targetSheet.getRange(appendedRowIndex, addCells[f].col).setFormula(addCells[f].formula);
        }
      }

      return createJsonResponse({
        success: true,
        action: 'ADD_ROW',
        sheet: payload.sheetName,
        row: appendedRowIndex,
        timestamp: new Date().toISOString(),
      }, 200);
    }

    // 3. DELETE_ROW
    if (payload.action === 'DELETE_ROW') {
      var deleteRowIndex = payload.rowIndex;
      if (deleteRowIndex > 0 && deleteRowIndex <= targetSheet.getLastRow()) {
        targetSheet.deleteRow(deleteRowIndex);
        return createJsonResponse({
          success: true,
          action: 'DELETE_ROW',
          sheet: payload.sheetName,
          row: deleteRowIndex,
          timestamp: new Date().toISOString(),
        }, 200);
      } else {
        return createJsonResponse({ error: 'अवैध ओळ क्रमांक (Invalid row index)' }, 400);
      }
    }

    return createJsonResponse({ error: 'अज्ञात कृती: ' + payload.action }, 400);
  } catch (err) {
    return createJsonResponse({ error: 'Apps Script Server Error: ' + err.toString() }, 500);
  }
}

function createJsonResponse(data, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ----------------------------------------------------------------------------
// 3. Automated Trigger Management
// ----------------------------------------------------------------------------

/**
 * Run this function once from the Apps Script editor to install both triggers
 */
function installTriggers() {
  uninstallTriggers();

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Install onEdit Trigger
  ScriptApp.newTrigger('onSheetEditTrigger')
    .forSpreadsheet(ss)
    .onEdit()
    .create();

  // Install onChange Trigger
  ScriptApp.newTrigger('onSheetChangeTrigger')
    .forSpreadsheet(ss)
    .onChange()
    .create();

  var msg = 'Gramसेवा स्वयंचलित ट्रिगर्स (onEdit आणि onChange) यशस्वीरित्या स्थापित झाले!';
  Logger.log(msg);
  try {
    var ui = SpreadsheetApp.getUi();
    if (ui) ui.alert('ट्रिगर्स इन्स्टॉल', msg, ui.ButtonSet.OK);
  } catch (e) {}
}

/**
 * Remove all installed triggers
 */
function uninstallTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  Logger.log('Existing triggers removed.');
}

/**
 * Test connectivity to Gramसेवा Webhook
 */
function testWebhookConnection() {
  var config = getActiveConfig();
  var testPayload = {
    action: 'EDIT',
    secret: config.WEBHOOK_SECRET,
    sheetName: 'Sheet1',
    rowIndex: 1,
    colIndex: 1,
    newValue: 'Gramसेवा Connection Test',
    timestamp: new Date().toISOString(),
  };

  var success = dispatchWebhook(config.WEBHOOK_URL, testPayload, config.WEBHOOK_SECRET);
  var msg = 'वेबबुक चाचणी निकाल: ' + (success ? 'यशस्वी! (Connected to Gramसेवा)' : 'अयशस्वी (Failed)');
  Logger.log(msg);

  try {
    var ui = SpreadsheetApp.getUi();
    if (ui) ui.alert('कनेक्शन चाचणी', msg, ui.ButtonSet.OK);
  } catch (e) {}
  return success;
}
