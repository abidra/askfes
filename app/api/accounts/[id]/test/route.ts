import { NextResponse } from "next/server";
import { getAccount } from "@/lib/db";
import { generateAndPost } from "@/lib/post";

// Manually generate + post one tweet for this account right now (the dashboard
// "Test now" button). Also updates last_posted_at on success.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const account = await getAccount(id);
  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const outcome = await generateAndPost(account);
  return NextResponse.json(outcome, { status: outcome.ok ? 200 : 502 });
}
