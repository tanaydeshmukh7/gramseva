/**
 * Advanced Search & Normalization Engine for Gramसेवा
 * Supports Marathi (Devanagari Unicode), English (case-insensitive),
 * and numeric property/phone normalization (stripping float .0 suffixes).
 */

export function normalizeSearchString(text: string | number | null | undefined): string {
  if (text === null || text === undefined) return '';

  let str = String(text);

  // Normalize Unicode representation (canonical composition)
  str = str.normalize('NFC');

  // Strip zero-width characters and non-breaking spaces
  str = str.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ');

  // Strip trailing float .0 from integer values (e.g. "9763944767.0" -> "9763944767", "1.0" -> "1")
  if (/^\d+\.0$/.test(str.trim())) {
    str = str.trim().slice(0, -2);
  }

  return str.trim().toLowerCase();
}

export function matchRow(
  cells: Array<{ col: number; value: any; is_formula?: boolean }>,
  query: string
): boolean {
  if (!query) return true;

  const normalizedQuery = normalizeSearchString(query);
  if (!normalizedQuery) return true;

  // Split query into terms to support multi-word search (e.g. "प्रल्हाद हाडे" or "6B ऋषिकेश")
  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

  // Collect all searchable strings for this row
  const rowStrings = cells
    .map((c) => normalizeSearchString(c.value))
    .filter(Boolean);

  // Every query term must match at least one cell in the row
  return queryTerms.every((term) =>
    rowStrings.some((cellStr) => cellStr.includes(term))
  );
}

export function searchRows<T extends { row_index: number; cells: Array<any> }>(
  rows: T[],
  query: string
): T[] {
  if (!query || !query.trim()) return rows;

  return rows.filter((row) => matchRow(row.cells, query));
}
