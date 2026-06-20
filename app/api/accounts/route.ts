import { NextResponse } from "next/server";
import { createAccount, getAccounts } from "@/lib/db";
import { parseAccountInput } from "@/lib/validate";

export async function GET() {
  const accounts = await getAccounts();
  return NextResponse.json({ accounts });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = parseAccountInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const account = await createAccount(parsed.value);
  return NextResponse.json({ account }, { status: 201 });
}
