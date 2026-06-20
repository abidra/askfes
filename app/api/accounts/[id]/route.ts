import { NextResponse } from "next/server";
import { deleteAccount, getAccount, getRecentPosts, updateAccount } from "@/lib/db";
import { parseAccountInput } from "@/lib/validate";

function parseId(idStr: string): number | null {
  const id = Number(idStr);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const account = await getAccount(id);
  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const posts = await getRecentPosts(id, 15);
  return NextResponse.json({ account, posts });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await request.json().catch(() => null);
  const parsed = parseAccountInput(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const account = await updateAccount(id, parsed.value);
  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ account });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await deleteAccount(id);
  return NextResponse.json({ ok: true });
}
