import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'src', 'data');
    const sheetsDir = path.join(dataDir, 'sheets');
    const metaPath = path.join(dataDir, 'sheets_meta.json');

    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    const allSheets: Record<string, any> = {};

    const files = fs.readdirSync(sheetsDir);
    for (const f of files) {
      if (f.endsWith('.json')) {
        const content = JSON.parse(fs.readFileSync(path.join(sheetsDir, f), 'utf-8'));
        allSheets[content.slug] = content;
      }
    }

    const backupPayload = {
      app: 'Gramसेवा (Gram Panchayat Gohgaon Management Software)',
      export_timestamp: new Date().toISOString(),
      financial_year: meta.financial_year,
      panchayat: meta.village,
      taluka: meta.taluka,
      district: meta.district,
      total_worksheets: meta.total_sheets,
      sheets: allSheets,
    };

    return new NextResponse(JSON.stringify(backupPayload, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="gramseva_backup_${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
