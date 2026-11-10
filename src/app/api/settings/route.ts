import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
  isSupabaseConfigured,
  getSettingFromSupabase,
  saveSettingToSupabase,
  safeWriteJson,
} from '@/lib/supabaseClient';

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
    // 1. If Supabase is configured, load from Supabase persistent store
    if (isSupabaseConfigured()) {
      const dbSettings = await getSettingFromSupabase<typeof DEFAULT_SETTINGS>('general');
      if (dbSettings) {
        return NextResponse.json({ ...DEFAULT_SETTINGS, ...dbSettings });
      }
    }

    // 2. Read-only fallback from static JSON seed file
    if (fs.existsSync(SETTINGS_FILE)) {
      try {
        const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
        return NextResponse.json({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
      } catch (readErr) {
        // Fall back to default if corrupt or unreadable
      }
    }

    // 3. Fallback to default settings without attempting filesystem writes
    return NextResponse.json(DEFAULT_SETTINGS);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Fetch existing general settings
    let current = DEFAULT_SETTINGS;
    if (isSupabaseConfigured()) {
      const dbSettings = await getSettingFromSupabase<typeof DEFAULT_SETTINGS>('general');
      if (dbSettings) {
        current = { ...DEFAULT_SETTINGS, ...dbSettings };
      }
    } else if (fs.existsSync(SETTINGS_FILE)) {
      try {
        const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
        current = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      } catch (e) {}
    }

    const updated = {
      ...current,
      ...body,
      updated_at: new Date().toISOString(),
    };

    // 1. Persist to Supabase if configured
    if (isSupabaseConfigured()) {
      const saveRes = await saveSettingToSupabase('general', updated);
      if (!saveRes.success) {
        return NextResponse.json(
          { error: `Supabase जतन त्रुटी: ${saveRes.error}` },
          { status: 500 }
        );
      }
    }

    // 2. Safely attempt local filesystem update (no-op on serverless / EROFS)
    safeWriteJson(SETTINGS_FILE, updated);

    return NextResponse.json({
      success: true,
      message: 'सर्वसाधारण सेटिंग्ज यशस्वीरित्या जतन केल्या.',
      settings: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
