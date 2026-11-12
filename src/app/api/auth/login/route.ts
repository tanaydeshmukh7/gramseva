import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyCredentials,
  createSessionToken,
  SESSION_COOKIE_NAME,
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulLogin,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { username, password, rememberMe } = body;

    // Determine client identifier for rate limiting (IP or forwarded address)
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    const rateLimitKey = `${clientIp}_${(username || "admin").toLowerCase().trim()}`;

    // 1. Check Rate Limiter
    const rateCheck = checkRateLimit(rateLimitKey);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `अनेक अयशस्वी प्रयत्नांमुळे लॉगिन तात्पुरते ब्लॉक केले आहे. कृपया ${rateCheck.remainingSeconds} सेकंदांनंतर पुन्हा प्रयत्न करा.`,
          lockedOut: true,
          remainingSeconds: rateCheck.remainingSeconds,
        },
        { status: 429 }
      );
    }

    // 2. Validate input presence
    if (!username || !password) {
      return NextResponse.json(
        { error: "कृपया वापरकर्तानाव आणि पासवर्ड दोन्ही प्रविष्ट करा." },
        { status: 400 }
      );
    }

    // 3. Verify credentials on the server
    const isValid = await verifyCredentials(username, password);

    if (!isValid) {
      const record = recordFailedAttempt(rateLimitKey);
      if (record.lockedOut) {
        return NextResponse.json(
          {
            error: `अनेक चुकीचे प्रयत्न! सुरक्षा कारणास्तव खाते १५ मिनिटांसाठी तात्पुरते ब्लॉक केले आहे.`,
            lockedOut: true,
            remainingSeconds: record.remainingSeconds,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: `अवैध वापरकर्तानाव किंवा पासवर्ड. शिल्लक प्रयत्न: ${record.attemptsLeft}`,
          attemptsLeft: record.attemptsLeft,
        },
        { status: 401 }
      );
    }

    // 4. Successful Login
    recordSuccessfulLogin(rateLimitKey);
    const { token, maxAge } = await createSessionToken(username.trim(), Boolean(rememberMe));

    const response = NextResponse.json({
      success: true,
      message: "लॉगिन यशस्वी झाले.",
      username: username.trim(),
    });

    // Set secure, HTTP-only cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch (err: any) {
    console.error("Login route error:", err);
    return NextResponse.json(
      { error: "लॉगिन प्रक्रियेत सर्व्हर त्रुटी आली. कृपया पुन्हा प्रयत्न करा." },
      { status: 500 }
    );
  }
}
