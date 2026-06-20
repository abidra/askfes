import { NextResponse } from "next/server";
import { SESSION_COOKIE, createSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({ password: "" }));

  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: "DASHBOARD_PASSWORD not configured" }, { status: 500 });
  }
  if (password !== expected) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
