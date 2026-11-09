import fs from 'fs';
import path from 'path';
import { SheetData, SheetMeta, MeetingNoticeData, CommitteeMember, AgendaItem } from './types';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const SHEETS_DIR = path.join(DATA_DIR, 'sheets');
const META_FILE = path.join(DATA_DIR, 'sheets_meta.json');

export function getSheetsMeta(): { village: string; taluka: string; district: string; financial_year: string; total_sheets: number; sheets: SheetMeta[] } {
  if (!fs.existsSync(META_FILE)) {
    throw new Error('Metadata file not found');
  }
  const raw = fs.readFileSync(META_FILE, 'utf-8');
  return JSON.parse(raw);
}

export function getSheetBySlug(slug: string): SheetData | null {
  const filePath = path.join(SHEETS_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

export function saveSheetData(slug: string, sheetData: SheetData): boolean {
  try {
    const filePath = path.join(SHEETS_DIR, `${slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(sheetData, null, 2), 'utf-8');
    
    // Update metadata populated rows
    const meta = getSheetsMeta();
    const target = meta.sheets.find((s) => s.slug === slug);
    if (target) {
      target.populated_rows_count = sheetData.rows.length;
      target.max_row = Math.max(target.max_row, sheetData.rows.length);
      fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2), 'utf-8');
    }
    return true;
  } catch (err) {
    console.error('Error saving sheet data:', err);
    return false;
  }
}

export function getMeetingNoticeData(): MeetingNoticeData {
  const sheet = getSheetBySlug('masik-sabha-notice');
  if (!sheet) {
    throw new Error('मासिक सभा नोटीस शीट उपलब्ध नाही.');
  }

  // Parse Notice details from rows
  const outwardRow = sheet.rows.find((r) => r.row_index === 6);
  const outwardNo = outwardRow?.cells.find((c) => c.col === 2)?.value?.toString() || 'ग्रा.पं.गोह/सभा/२०२६-२७/२८';
  const noticeDate = outwardRow?.cells.find((c) => c.col === 4)?.value?.toString() || '०९/११/२०२६';

  const dtRow = sheet.rows.find((r) => r.row_index === 11);
  const meetingDate = dtRow?.cells.find((c) => c.col === 2)?.value?.toString()?.replace('📅 सभेचा दिनांक : ', '').trim() || '१५/११/२०२६';
  const meetingTime = dtRow?.cells.find((c) => c.col === 4)?.value?.toString()?.replace('⏰ सभेची वेळ : ', '').trim() || 'दुपारी ०२:०० वाजता';

  const venueRow = sheet.rows.find((r) => r.row_index === 12);
  const venue = venueRow?.cells.find((c) => c.col === 2)?.value?.toString()?.replace('📍 सभेचे ठिकाण : ', '').trim() || 'ग्रामपंचायत कार्यालय, गोहगाव';
  const chairperson = venueRow?.cells.find((c) => c.col === 4)?.value?.toString()?.replace('👤 सभेचे अध्यक्ष : ', '').trim() || 'मा. सरपंच, ग्रा.पं. गोहगाव';

  // Agenda items: rows 16 to 22
  const agenda: AgendaItem[] = [];
  for (let r = 16; r <= 22; r++) {
    const row = sheet.rows.find((ro) => ro.row_index === r);
    if (row) {
      agenda.push({
        sr: r - 15,
        subject: row.cells.find((c) => c.col === 3)?.value?.toString() || '',
        details: row.cells.find((c) => c.col === 4)?.value?.toString() || '',
        remarks: row.cells.find((c) => c.col === 6)?.value?.toString() || '',
      });
    }
  }

  // Committee members: rows 26 to 34
  const members: CommitteeMember[] = [];
  for (let r = 26; r <= 34; r++) {
    const row = sheet.rows.find((ro) => ro.row_index === r);
    if (row) {
      const name = row.cells.find((c) => c.col === 3)?.value?.toString() || '';
      const role = row.cells.find((c) => c.col === 4)?.value?.toString() || '';
      const mob = row.cells.find((c) => c.col === 5)?.value?.toString() || '';
      if (name) {
        members.push({
          sr: r - 25,
          name,
          role,
          mobile: mob,
        });
      }
    }
  }

  return {
    village: 'गोहगाव',
    taluka: 'रिसोड',
    district: 'वाशिम',
    financial_year: '२०२६ - २०२७',
    outward_no: outwardNo,
    notice_date: noticeDate,
    meeting_date: meetingDate,
    meeting_time: meetingTime,
    venue,
    chairperson,
    agenda,
    members,
    notes: [
      '१. ठरलेल्या वेळेत गणपूर्ती (कोरम) न झाल्यास सभा नियमानुसार तहकूब राहील व त्यानंतर त्याच ठिकाणी होईल.',
      '२. सर्व सदस्यांनी वेळेवर उपस्थित राहणे बंधनकारक आहे.',
    ],
  };
}
