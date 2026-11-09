import { NextResponse } from 'next/server';
import { processIncomingWebhook, getSyncSettings, getSyncLogs } from '@/lib/googleSheetsSync';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('x-gramseva-secret') || req.headers.get('authorization')?.replace('Bearer ', '');
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: 'रिकामी विनंती (Empty Request Payload).' }, { status: 400 });
    }

    const result = await processIncomingWebhook(body, authHeader || undefined);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: `सर्व्हर त्रुटी: ${err.message}` }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const settings = getSyncSettings();
    const logs = getSyncLogs();

    return NextResponse.json({
      status: 'WEBHOOK_READY',
      service: 'Gramसेवा Google Sheets Webhook Listener',
      spreadsheet_id: settings.spreadsheet_id,
      spreadsheet_url: settings.spreadsheet_url,
      sync_direction: settings.sync_direction,
      conflict_policy: settings.conflict_policy,
      total_logs_recorded: logs.length,
      last_sync_timestamp: settings.last_sync_timestamp || logs[0]?.timestamp || null,
      instruction:
        'Google Apps Script installable trigger onEdit(e) should POST to this endpoint with x-gramseva-secret header.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
