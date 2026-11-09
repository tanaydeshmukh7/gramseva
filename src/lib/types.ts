export interface SheetMeta {
  index: number;
  name: string;
  slug: string;
  category: string;
  max_row: number;
  max_col: number;
  populated_rows_count: number;
  merged_ranges_count: number;
}

export interface SheetCell {
  col: number;
  coord: string;
  value: string | number | null;
  is_formula: boolean;
  formula: string | null;
}

export interface SheetRow {
  row_index: number;
  cells: SheetCell[];
}

export interface SheetData {
  index: number;
  name: string;
  slug: string;
  category: string;
  max_row: number;
  max_col: number;
  populated_rows_count: number;
  merged_ranges: string[];
  rows: SheetRow[];
}

export interface CommitteeMember {
  sr: number;
  name: string;
  role: string;
  mobile: string;
  signature?: string;
}

export interface AgendaItem {
  sr: number;
  subject: string;
  details: string;
  remarks: string;
}

export interface MeetingNoticeData {
  village: string;
  taluka: string;
  district: string;
  financial_year: string;
  outward_no: string;
  notice_date: string;
  meeting_date: string;
  meeting_time: string;
  venue: string;
  chairperson: string;
  agenda: AgendaItem[];
  members: CommitteeMember[];
  notes: string[];
}

export interface PropertyRecord {
  sr_no: number | string;
  street: string;
  city_survey_no: string;
  property_no: string;
  owner_name: string;
  occupant_name: string;
  property_description: string;
  construction_year_bracket: string;
  length_ft: number;
  width_ft: number;
  area_sq_ft: number;
  area_sq_m: number;
  land_rate: number;
  construction_rate: number;
  depreciation_rate: number;
  usage_weight: number;
  capital_value: number;
  tax_rate_paise: number;
  house_tax: number;
  light_tax: number;
  health_tax: number;
  water_tax: number;
  total_tax: number;
  east: string;
  west: string;
  north: string;
  south: string;
}

export interface DemandRecord {
  sr_no: number | string;
  property_no: string;
  taxpayer_name: string;
  house_tax_arrears: number;
  house_tax_current: number;
  house_tax_penalty: number;
  house_tax_total: number;
  light_tax_arrears: number;
  light_tax_current: number;
  light_tax_total: number;
  health_tax_arrears: number;
  health_tax_current: number;
  health_tax_total: number;
  water_tax_arrears: number;
  water_tax_current: number;
  water_tax_total: number;
  grand_total: number;
  receipt_info: string;
}

export interface SyncStatus {
  connected: boolean;
  spreadsheet_id: string;
  last_sync_time: string | null;
  pending_changes_count: number;
  last_status: 'success' | 'syncing' | 'error' | 'idle';
  error_message?: string;
}
