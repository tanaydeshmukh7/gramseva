import { NextResponse } from 'next/server';
import { searchProperties } from '@/lib/propertyService';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q') || '';
    const limit = parseInt(url.searchParams.get('limit') || '25', 10);

    if (!query.trim()) {
      return NextResponse.json({ success: true, results: [] });
    }

    const results = searchProperties(query, limit);

    return NextResponse.json({
      success: true,
      query,
      count: results.length,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
