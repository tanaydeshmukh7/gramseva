import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: "लॉगआउट यशस्वी झाले.",
    });

    // Invalidate session cookie immediately
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (err: any) {
    console.error("Logout error:", err);
    return NextResponse.json(
      { error: "लॉगआउट करताना त्रुटी आली." },
      { status: 500 }
    );
  }
}
