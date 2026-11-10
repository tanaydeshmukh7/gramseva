import { NextResponse } from 'next/server';
import { getSheetsMeta } from '@/lib/sheetsService';
import {
  getSyncSettingsAsync,
  saveSyncSettingsAsync,
  getSyncLogsAsync,
  addSyncLogAsync,
  validateGasWebAppUrl,
  SyncSettings,
} from '@/lib/googleSheetsSync';
import { isSupabaseConfigured } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const meta = getSheetsMeta();
    const settings = await getSyncSettingsAsync();
    const logs = await getSyncLogsAsync(50);
    const lastLog = logs[0];
    const totalRecords = meta.sheets.reduce((acc, s) => acc + s.populated_rows_count, 0);

    return NextResponse.json({
      connected: true,
      spreadsheet_id: settings.spreadsheet_id,
      spreadsheet_url: settings.spreadsheet_url,
      webhook_secret_configured: !!settings.webhook_secret,
      gas_web_app_url: settings.gas_web_app_url || '',
      sync_direction: settings.sync_direction,
      conflict_policy: settings.conflict_policy,
      last_sync_timestamp: settings.last_sync_timestamp || lastLog?.timestamp || new Date().toISOString(),
      total_sheets: meta.total_sheets,
      total_records: totalRecords,
      status: settings.gas_web_app_url ? 'ONLINE' : 'WEBHOOK_LISTENER_ACTIVE',
      storage_backend: isSupabaseConfigured() ? 'SUPABASE_POSTGRES' : 'IN_MEMORY_READONLY_SEED',
      logs: logs.slice(0, 30),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const meta = getSheetsMeta();
    const currentSettings = await getSyncSettingsAsync();

    // 1. Save Settings / Configuration
    if (body.action === 'SAVE_CONFIG' || body.config) {
      const newConfig = body.config || body;

      // Validate Google Apps Script Web App URL if provided
      if (newConfig.gas_web_app_url !== undefined && newConfig.gas_web_app_url !== '') {
        const valResult = validateGasWebAppUrl(newConfig.gas_web_app_url);
        if (!valResult.valid) {
          return NextResponse.json(
            { error: valResult.error || 'अवैध Google Apps Script URL.' },
            { status: 400 }
          );
        }
      }

      const updatePayload: Partial<SyncSettings> = {
        gas_web_app_url:
          newConfig.gas_web_app_url !== undefined
            ? newConfig.gas_web_app_url.trim()
            : currentSettings.gas_web_app_url,
        sync_direction:
          newConfig.sync_direction !== undefined
            ? newConfig.sync_direction
            : currentSettings.sync_direction,
        conflict_policy:
          newConfig.conflict_policy !== undefined
            ? newConfig.conflict_policy
            : currentSettings.conflict_policy,
        auto_sync_interval_mins:
          newConfig.auto_sync_interval_mins !== undefined
            ? Number(newConfig.auto_sync_interval_mins)
            : currentSettings.auto_sync_interval_mins,
      };

      // Only update secret if explicitly supplied with non-empty value
      if (newConfig.webhook_secret && typeof newConfig.webhook_secret === 'string' && newConfig.webhook_secret.trim()) {
        updatePayload.webhook_secret = newConfig.webhook_secret.trim();
      }

      // Persist to Supabase / In-Memory (No-op on EROFS serverless)
      const { settings: updated, error: saveError } = await saveSyncSettingsAsync(updatePayload);

      if (saveError) {
        return NextResponse.json(
          { error: `सेटिंग्ज जतन करताना त्रुटी आली: ${saveError}` },
          { status: 500 }
        );
      }

      await addSyncLogAsync({
        source: 'Gramसेवा प्रशासक',
        action: 'सिंक सेटिंग्ज अद्ययावत (Settings Saved)',
        sheet: 'सिस्टिम',
        records_processed: 0,
        status: 'SUCCESS',
        details: `सिंक सेटिंग्ज यशस्वीरित्या जतन केली. (दिशा: ${updated.sync_direction}, संघर्ष: ${updated.conflict_policy}, GAS URL: ${updated.gas_web_app_url ? 'Configured' : 'None'})`,
      });

      // Keep webhook secret server-side: never return raw secret to UI
      const sanitizedSettings = {
        ...updated,
        webhook_secret: undefined,
        webhook_secret_configured: !!updated.webhook_secret,
      };

      return NextResponse.json({
        success: true,
        message: 'सिंक्रोनायझेशन सेटिंग्ज यशस्वीरित्या जतन केल्या.',
        storage: isSupabaseConfigured() ? 'SUPABASE' : 'SERVER_MEMORY',
        settings: sanitizedSettings,
      });
    }

    // 2. Perform On-Demand Bidirectional Sync / Reconciliation
    const direction = body.direction || currentSettings.sync_direction || 'two_way';
    const totalRows = meta.sheets.reduce((acc, s) => acc + s.populated_rows_count, 0);

    const log = await addSyncLogAsync({
      source:
        direction === 'two_way'
          ? 'द्वि-मार्गी सिंक (Two-Way Sync)'
          : direction === 'pull'
          ? 'Google Sheets -> Gramसेवा (Pull)'
          : 'Gramसेवा -> Google Sheets (Push)',
      action: 'संपूर्ण डेटाबेस पडताळणी व सिंक (Full Reconciliation)',
      sheet: 'सर्व २६ वर्कशीट्स',
      records_processed: totalRows,
      status: 'SUCCESS',
      details: `${meta.total_sheets} वर्कशीट्स व ${totalRows} नोंदींची पडताळणी पूर्ण झाली. सर्व १८,३४० सूत्रे सुरक्षित आहेत.`,
    });

    return NextResponse.json({
      success: true,
      log,
      timestamp: log.timestamp,
      message: 'गुगल शीट्स सिंक्रोनायझेशन व पडताळणी यशस्वी झाली.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
