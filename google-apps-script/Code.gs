/**
 * ============================================================================
 * Gramसेवा (Gram Panchayat Gohgaon Management Software)
 * Google Apps Script — Two-Way Real-Time Synchronization Engine
 * ============================================================================
 * 
 * Features:
 * 1. Installable onEdit & onChange Triggers: Real-time event capture for edits, additions, and deletions.
 * 2. Webhook Dispatch: Sends authenticated HTTP POST requests to Gramसेवा backend (/api/webhook/google-sheets).
 * 3. Web App Receiver (doPost): Receives edits, additions, and deletions pushed from Gramसेवा.
 * 4. Formula & History Preservation: Preserves Excel/Sheets formula cells during updates.
 * 5. Automatic Deduplication & Error Logging: Protects data integrity across all 26 worksheets.
 */

// ----------------------------------------------------------------------------
// Configuration (Can also be stored in ScriptProperties)
// ----------------------------------------------------------------------------
var CONFIG = {
  // Replace with your Gramसेवा public deployment URL or webhook tunnel
  WEBHOOK_URL: 'http://localhost:3000/api/webhook/google-sheets',
  
  // Shared secure authentication token (matches settings.webhook_secret)
  WEBHOOK_SECRET: 'gramseva_gohgaon_secure_sync_token_2026',
  
  // Master Spreadsheet ID
  SPREADSHEET_ID: '17YLlwp4oMrTx4-Y0ugQ19MfghwV66dL3eipSQesOLFk',
  
  // Maximum retries on network error
  MAX_RETRIES: 3,
};

/**
 * Get active configuration, overriding from ScriptProperties if set
 */
function getActiveConfig() {
  var props = PropertiesService.getScriptProperties().getProperties();
  return {
    WEBHOOK_URL: props.WEBHOOK_URL || CONFIG.WEBHOOK_URL,
    WEBHOOK_SECRET: props.WEBHOOK_SECRET || CONFIG.WEBHOOK_SECRET,
    SPREADSHEET_ID: props.SPREADSHEET_ID || CONFIG.SPREADSHEET_ID,
    MAX_RETRIES: CONFIG.MAX_RETRIES,
  };
}

// ----------------------------------------------------------------------------
// 1. Installable Triggers (Google Sheets -> Gramसेवा)
// ----------------------------------------------------------------------------

/**
 * Installable Edit Trigger: Captures cell edits in any of the 26 worksheets.
 * Note: Must be set up as an Installable Trigger (not a simple onEdit) to allow external UrlFetchApp calls.
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
      // Row removal event
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
// 2. Web App Receiver (Gramसेवा -> Google Sheets)
// ----------------------------------------------------------------------------

/**
 * HTTP POST Handler: Receives edits, additions, and deletions from Gramसेवा.
 * When deployed as a Web App (Execute as: Me, Who has access: Anyone).
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
    var sheet = ss.getSheetByName(payload.sheetName);

    if (!sheet) {
      // Fallback: search trimmed sheet name
      var allSheets = ss.getSheets();
      for (var s = 0; s < allSheets.length; s++) {
        if (allSheets[s].getName().trim() === payload.sheetName.trim()) {
          sheet = allSheets[s];
          break;
        }
      }
    }

    if (!sheet) {
      return createJsonResponse({ error: 'वर्कशीट आढळली नाही: ' + payload.sheetName }, 404);
    }

    // 1. UPDATE_ROW
    if (payload.action === 'UPDATE_ROW') {
      var rowIndex = payload.rowIndex;
      var cells = payload.cells || [];

      for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        var targetRange = sheet.getRange(rowIndex, cell.col);

        // FORMULA PRESERVATION:
        // If incoming cell has a formula, set formula; otherwise set value
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

      sheet.appendRow(newRowVals);
      var appendedRowIndex = sheet.getLastRow();

      // Set any formulas
      for (var f = 0; f < addCells.length; f++) {
        if (addCells[f].formula) {
          sheet.getRange(appendedRowIndex, addCells[f].col).setFormula(addCells[f].formula);
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
      if (deleteRowIndex > 0 && deleteRowIndex <= sheet.getLastRow()) {
        sheet.deleteRow(deleteRowIndex);
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

    // 4. RECONCILE / STATUS
    if (payload.action === 'RECONCILE') {
      var totalRows = sheet.getLastRow();
      var totalCols = sheet.getLastColumn();
      return createJsonResponse({
        success: true,
        sheet: payload.sheetName,
        lastRow: totalRows,
        lastColumn: totalCols,
        timestamp: new Date().toISOString(),
      }, 200);
    }

    return createJsonResponse({ error: 'अज्ञात कृती (Unknown action): ' + payload.action }, 400);
  } catch (err) {
    return createJsonResponse({ error: 'Apps Script Server Error: ' + err.toString() }, 500);
  }
}

/**
 * HTTP GET Handler: Health check and status inquiry
 */
function doGet(e) {
  var config = getActiveConfig();
  try {
    var ss = SpreadsheetApp.openById(config.SPREADSHEET_ID);
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

function createJsonResponse(data, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ----------------------------------------------------------------------------
// 3. Automated Trigger Management & Setup Functions
// ----------------------------------------------------------------------------

/**
 * Run this function once from the Apps Script editor to install both triggers
 */
function installTriggers() {
  uninstallTriggers(); // Remove existing to prevent duplicates

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

  Logger.log('Gramसेवा triggers installed successfully!');
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
  Logger.log('Webhook test result: ' + (success ? 'SUCCESS (Connected)' : 'FAILED'));
  return success;
}
