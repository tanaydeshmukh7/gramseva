import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'src', 'data', 'settings.json');

const DEFAULT_SETTINGS = {
  panchayat_name: 'ग्रामपंचायत गोहगाव',
  taluka: 'रिसोड',
  district: 'वाशिम',
  financial_year: '२०२६ - २०२७',
  contact_no: '07251-XXXXXX',
  notice_template:
    'मा. सदस्य, ग्रामपंचायत गोहगावची मासिक सभा दि. {date} रोजी दुपारी {time} वाजता आयोजित केली आहे. सभेचा अजेंडा व नोटीस सोबत जोडली आहे. कृपया उपस्थित राहावे.',
  whatsapp_template:
    'मा. सदस्य, ग्रामपंचायत गोहगावची मासिक सभा दि. {date} रोजी {time} वाजता {venue} येथे आयोजित केली आहे. तरी उपस्थित राहावे ही नम्र विनंती. - ग्रामसेवक/सरपंच, ग्रा.पं. गोहगाव.',
};

export async function GET() {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
      return NextResponse.json(DEFAULT_SETTINGS);
    }
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let current = DEFAULT_SETTINGS;
    if (fs.existsSync(SETTINGS_FILE)) {
      current = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    }

    const updated = {
      ...current,
      ...body,
      updated_at: new Date().toISOString(),
    };

    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
