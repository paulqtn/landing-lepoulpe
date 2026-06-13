import { NextResponse } from "next/server";

/**
 * Lead capture endpoint.
 *
 * The generator posts the captured lead here. For now it validates the
 * payload and acknowledges it — this is the single place to plug in a CRM,
 * an email notification, Google Sheets, a webhook, etc. (stratégie rappel).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const { name, email, phone } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof phone !== "string" ||
    name.trim().length < 2 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 422 });
  }

  // TODO: forward to CRM / email / webhook here.
  console.log("[lead] nouveau lead capturé:", { name, email, phone });

  return NextResponse.json({ ok: true });
}
