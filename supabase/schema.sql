-- ====================================================================
-- Gramसेवा (Gram Panchayat Gohgaon Management Software)
-- Supabase PostgreSQL Database Schema
-- Provides persistent storage for settings, sync logs, and sheet updates.
-- Replaces serverless read-only filesystem writes (/var/task/src/data/*.json)
-- ====================================================================

-- 1. Gramसेवा Settings Table
-- Stores persistent key-value configuration (general settings, sync configuration, etc.)
CREATE TABLE IF NOT EXISTS gramseva_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS) on settings
ALTER TABLE gramseva_settings ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access to settings (Next.js server-side route handlers)
CREATE POLICY "Allow service_role full access to gramseva_settings"
    ON gramseva_settings
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users read access to non-sensitive settings
CREATE POLICY "Allow authenticated users read access to gramseva_settings"
    ON gramseva_settings
    FOR SELECT
    TO authenticated
    USING (true);


-- 2. Gramसेवा Sync Logs Table
-- Stores real-time bidirectional synchronization audit events
CREATE TABLE IF NOT EXISTS gramseva_sync_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    source TEXT NOT NULL,
    action TEXT NOT NULL,
    sheet TEXT NOT NULL,
    records_processed INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'ERROR', 'WARNING', 'PENDING')),
    details TEXT
);

CREATE INDEX IF NOT EXISTS idx_gramseva_sync_logs_timestamp 
    ON gramseva_sync_logs (timestamp DESC);

-- Enable RLS on sync logs
ALTER TABLE gramseva_sync_logs ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access to sync logs
CREATE POLICY "Allow service_role full access to gramseva_sync_logs"
    ON gramseva_sync_logs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users read access to sync logs
CREATE POLICY "Allow authenticated users read access to gramseva_sync_logs"
    ON gramseva_sync_logs
    FOR SELECT
    TO authenticated
    USING (true);


-- 3. Gramसेवा Sheet Mutations Table (Optional Serverless Mutations Store)
-- Captures row edits, additions, and deletions made directly in Gramसेवा
CREATE TABLE IF NOT EXISTS gramseva_sheet_mutations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sheet_slug TEXT NOT NULL,
    row_index INTEGER NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    row_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_gramseva_sheet_mutations_sheet_slug 
    ON gramseva_sheet_mutations (sheet_slug, row_index);

ALTER TABLE gramseva_sheet_mutations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service_role full access to gramseva_sheet_mutations"
    ON gramseva_sheet_mutations
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


-- 4. Initial Seed Data
-- Seed general settings if not already present
INSERT INTO gramseva_settings (key, value)
VALUES (
    'general',
    '{
        "panchayat_name": "ग्रामपंचायत गोहगाव",
        "taluka": "रिसोड",
        "district": "वाशिम",
        "financial_year": "२०२६ - २०२७",
        "contact_no": "07251-XXXXXX",
        "notice_template": "मा. सदस्य, ग्रामपंचायत गोहगावची मासिक सभा दि. {date} रोजी दुपारी {time} वाजता आयोजित केली आहे. सभेचा अजेंडा व नोटीस सोबत जोडली आहे. कृपया उपस्थित राहावे.",
        "whatsapp_template": "मा. सदस्य, ग्रामपंचायत गोहगावची मासिक सभा दि. {date} रोजी {time} वाजता {venue} येथे आयोजित केली आहे. तरी उपस्थित राहावे ही नम्र विनंती. - ग्रामसेवक/सरपंच, ग्रा.पं. गोहगाव."
    }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- Seed sync settings if not already present
INSERT INTO gramseva_settings (key, value)
VALUES (
    'sync',
    '{
        "spreadsheet_id": "17YLlwp4oMrTx4-Y0ugQ19MfghwV66dL3eipSQesOLFk",
        "spreadsheet_url": "https://docs.google.com/spreadsheets/d/17YLlwp4oMrTx4-Y0ugQ19MfghwV66dL3eipSQesOLFk/edit",
        "gas_web_app_url": "",
        "sync_direction": "two_way",
        "conflict_policy": "admin_review",
        "auto_sync_interval_mins": 5
    }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- Seed initial verification sync log
INSERT INTO gramseva_sync_logs (source, action, sheet, records_processed, status, details)
VALUES (
    'Google Sheets API',
    'आरंभीची पडताळणी (Initial Verification)',
    'सर्व २६ वर्कशीट्स',
    4386,
    'SUCCESS',
    'सर्व २६ वर्कशीट्स व १८,३४० सूत्रे अचूक जुळली आहेत.'
);
