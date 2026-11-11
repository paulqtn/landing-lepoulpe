import { NextResponse } from "next/server";
import { ADMIN_COOKIE, checkCode, makeRepToken, makeSession, REP_COOKIE } from "@/lib/admin/auth";

export async function POST(req: Request) {
  let body: { code?: string; rep?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (typeof body.code !== "string" || !checkCode(body.code)) {
    return NextResponse.json({ ok: false, error: "code invalide" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, makeSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 12 * 3600,
  });
  if (typeof body.rep === "string" && body.rep.trim().length > 0 && body.rep.trim().length <= 40) {
    res.cookies.set(REP_COOKIE, makeRepToken(body.rep.trim()), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 12 * 3600,
    });
  }
  return res;
}
