import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';

// Supabase environment variables
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  '';

let cachedClient: SupabaseClient | null = null;

/**
 * Returns true if Supabase URL and Key are provided in the environment.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY && SUPABASE_URL.startsWith('http'));
}

/**
 * Returns a cached Supabase client or null if not configured.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!cachedClient) {
    cachedClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return cachedClient;
}

/**
 * Safely writes JSON to disk if the filesystem is writable.
 * Never throws EROFS in serverless environments (/var/task or Vercel/Lambda).
 */
export function safeWriteJson(filePath: string, data: any): boolean {
  // Detect serverless read-only environment
  const isServerless =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    filePath.startsWith('/var/task') ||
    filePath.startsWith('/var/runtime');

  if (isServerless) {
    // In serverless, filesystem is strictly read-only.
    // Return false without attempting write to avoid EROFS.
    return false;
  }

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err: any) {
    if (err?.code === 'EROFS' || err?.message?.includes('read-only file system')) {
      // Caught read-only filesystem gracefully
      return false;
    }
    console.warn(`[SafeWrite] Could not write to ${filePath}:`, err?.message);
    return false;
  }
}

/**
 * Load a setting document from Supabase
 */
export async function getSettingFromSupabase<T>(key: string): Promise<T | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('gramseva_settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.warn(`[Supabase] Error reading setting "${key}":`, error.message);
      return null;
    }

    return (data?.value as T) ?? null;
  } catch (err: any) {
    console.warn(`[Supabase] Network/query failure reading setting "${key}":`, err?.message);
    return null;
  }
}

/**
 * Save a setting document to Supabase with strict write confirmation.
 * Returns { success, data, error }.
 */
export async function saveSettingToSupabase<T>(
  key: string,
  value: T
): Promise<{ success: boolean; data?: T; error?: string }> {
  const client = getSupabase();
  if (!client) {
    return {
      success: false,
      error: 'Supabase credentials not configured (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY missing).',
    };
  }

  try {
    const { data, error } = await client
      .from('gramseva_settings')
      .upsert(
        {
          key,
          value: value as any,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      )
      .select('value')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data?.value as T };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unknown database write error' };
  }
}

/**
 * Load sync audit logs from Supabase
 */
export async function getSyncLogsFromSupabase(limit = 100): Promise<any[] | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('gramseva_sync_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('[Supabase] Error fetching sync logs:', error.message);
      return null;
    }

    return data || [];
  } catch (err: any) {
    console.warn('[Supabase] Network failure fetching sync logs:', err?.message);
    return null;
  }
}

/**
 * Record a new sync audit log entry in Supabase
 */
export async function addSyncLogToSupabase(entry: {
  source: string;
  action: string;
  sheet: string;
  records_processed: number;
  status: 'SUCCESS' | 'ERROR' | 'WARNING' | 'PENDING';
  details?: string;
}): Promise<any | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('gramseva_sync_logs')
      .insert([
        {
          source: entry.source,
          action: entry.action,
          sheet: entry.sheet,
          records_processed: entry.records_processed,
          status: entry.status,
          details: entry.details || '',
          timestamp: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.warn('[Supabase] Error writing sync log:', error.message);
      return null;
    }

    return data;
  } catch (err: any) {
    console.warn('[Supabase] Network failure writing sync log:', err?.message);
    return null;
  }
}

/**
 * Record sheet mutation in Supabase (serverless audit / mutation log)
 */
export async function recordSheetMutationInSupabase(
  sheetSlug: string,
  rowIndex: number,
  action: 'INSERT' | 'UPDATE' | 'DELETE',
  rowData: any
): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client.from('gramseva_sheet_mutations').insert([
      {
        sheet_slug: sheetSlug,
        row_index: rowIndex,
        action,
        row_data: rowData,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.warn('[Supabase] Error recording sheet mutation:', error.message);
      return false;
    }

    return true;
  } catch (err: any) {
    console.warn('[Supabase] Network failure recording mutation:', err?.message);
    return false;
  }
}
