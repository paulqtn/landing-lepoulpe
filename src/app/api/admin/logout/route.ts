import { NextResponse } from "next/server";
import { ADMIN_COOKIE, destroySession, tokenFromRequest } from "@/lib/admin/auth";

export async function POST(req: Request) {
  await destroySession(tokenFromRequest(req));
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
