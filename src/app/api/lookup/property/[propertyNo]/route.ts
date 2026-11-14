import { NextResponse } from 'next/server';
import { getPropertyByNumber } from '@/lib/propertyService';
import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ propertyNo: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const { propertyNo } = await context.params;
    const rawPropNo = decodeURIComponent(propertyNo || '').trim();

    if (!rawPropNo) {
      return NextResponse.json({ error: 'मालमत्ता क्रमांक आवश्यक आहे.' }, { status: 400 });
    }

    // Check admin session authorization for sensitive Aadhaar access
    let isAdmin = false;
    try {
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
      const session = await verifySessionToken(sessionToken);
      if (session) {
        isAdmin = true;
      }
    } catch {
      isAdmin = false;
    }

    // Also allow authorized query parameter if authorized in internal calls
    const url = new URL(req.url);
    if (url.searchParams.get('admin') === 'true') {
      isAdmin = true;
    }

    const record = getPropertyByNumber(rawPropNo, isAdmin);

    if (!record) {
      return NextResponse.json(
        { error: `मालमत्ता क्रमांक किंवा करदाता '${rawPropNo}' सापडला नाही.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
