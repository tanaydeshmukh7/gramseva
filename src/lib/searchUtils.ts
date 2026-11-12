/**
 * Advanced Search & Normalization Engine for Gramसेवा
 * Supports:
 * - Marathi (Devanagari Unicode NFC, Devanagari numerals ०-९ to 0-9, vowel harmonization)
 * - English (case-insensitive, whitespace trimmed, punctuation tolerant)
 * - Alphanumeric property numbers (e.g. "7A", "7a", "15A", "15a", "6B", "6b", "5A", "5a", "7 A", "7-A")
 * - Numeric property/phone normalization (stripping float .0 suffixes e.g. "9763944767.0" -> "9763944767")
 * - Multi-word & multi-cell cross-matching
 */

export function normalizeSearchString(text: string | number | null | undefined): string {
  if (text === null || text === undefined) return '';

  let str = String(text);

  // Normalize Unicode representation (canonical composition)
  str = str.normalize('NFC');

  // Strip zero-width characters and non-breaking spaces
  str = str.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ');

  // Convert Devanagari numerals (०-९) to standard ASCII numerals (0-9)
  str = str.replace(/[०-९]/g, (d) => String('०१२३४५६७८९'.indexOf(d)));

  // Normalize all line breaks and multiple spaces to a single space
  str = str.replace(/[\r\n\t]+/g, ' ');
  str = str.replace(/\s+/g, ' ');

  // Strip float .0 inside alphanumeric or numeric strings (e.g. "9763944767.0" -> "9763944767", "7.0A" -> "7A", "1.0" -> "1")
  str = str.replace(/(\d+)\.0+([a-zA-Z])/g, '$1$2');
  str = str.replace(/([a-zA-Z])\.0+(\d*)/g, '$1$2');
  str = str.replace(/(\b\d+)\.0+(\b)/g, '$1');

  return str.trim().toLowerCase();
}

/**
 * Strips punctuation, spaces, and dividers for tolerant code/property matching (e.g. "7-A" -> "7a", "15/A" -> "15a")
 */
export function stripPunctuation(s: string): string {
  return s.replace(/[\s\-_/\\,.:;()]+/g, '');
}

/**
 * Harmonizes common Marathi vowel variants (ह्रस्व / दीर्घ) for phonetic tolerance
 */
export function harmonizeMarathiVowels(s: string): string {
  return s
    .replace(/ी/g, 'ि')
    .replace(/ू/g, 'ु')
    .replace(/ॅ/g, 'े')
    .replace(/ॉ/g, 'ो');
}

/**
 * Determines whether a cell value matches a single search token
 */
export function matchCellWithToken(cellNormalized: string, tokenNormalized: string): boolean {
  if (!cellNormalized || !tokenNormalized) return false;

  // 1. Direct substring match (case-insensitive & Devanagari normalized)
  if (cellNormalized.includes(tokenNormalized)) return true;

  // 2. Punctuation/divider stripped match (e.g. "7-a" matches "7a", "15 a" matches "15a")
  const strippedCell = stripPunctuation(cellNormalized);
  const strippedToken = stripPunctuation(tokenNormalized);
  if (strippedToken && strippedCell.includes(strippedToken)) return true;

  // 3. Marathi vowel-tolerant matching (e.g. "ऋषीकेश" matches "ऋषिकेश")
  const vCell = harmonizeMarathiVowels(cellNormalized);
  const vToken = harmonizeMarathiVowels(tokenNormalized);
  if (vCell.includes(vToken)) return true;

  return false;
}

export function matchRow(
  cells: Array<{ col: number; value: any; is_formula?: boolean }>,
  query: string
): boolean {
  if (!query || !query.trim()) return true;

  const normalizedQuery = normalizeSearchString(query);
  if (!normalizedQuery) return true;

  // Split query into terms to support multi-word search (e.g. "प्रल्हाद हाडे" or "6B ऋषिकेश" or "7A भास्कर")
  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);

  // Collect all searchable strings for this row
  const rowStrings = cells
    .map((c) => normalizeSearchString(c.value))
    .filter(Boolean);

  if (rowStrings.length === 0) return false;

  const combinedRowStr = rowStrings.join(' ');
  const compactCombinedRowStr = stripPunctuation(combinedRowStr);

  // Every query term must match at least one cell or the combined row text
  return queryTerms.every((term) => {
    const strippedTerm = stripPunctuation(term);

    // Check individual cells
    const cellMatch = rowStrings.some((cellStr) => matchCellWithToken(cellStr, term));
    if (cellMatch) return true;

    // Check combined row string
    if (combinedRowStr.includes(term)) return true;
    if (strippedTerm && compactCombinedRowStr.includes(strippedTerm)) return true;

    // Check vowel-harmonized combined row
    const vCombined = harmonizeMarathiVowels(combinedRowStr);
    const vTerm = harmonizeMarathiVowels(term);
    if (vCombined.includes(vTerm)) return true;

    return false;
  });
}

export function searchRows<T extends { row_index: number; cells: Array<any> }>(
  rows: T[],
  query: string
): T[] {
  if (!query || !query.trim()) return rows;

  return rows.filter((row) => matchRow(row.cells, query));
}
