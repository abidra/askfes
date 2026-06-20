import { NextResponse } from "next/server";
import { sql, Account } from "@/lib/db";
import { generateAndPost } from "@/lib/post";

// Runs on the Vercel cron schedule. Each tick, post for every enabled account
// whose interval has elapsed since last_posted_at.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Due = never posted, or (now - last_posted_at) >= interval_minutes.
  const due = (await sql`
    SELECT * FROM accounts
    WHERE enabled = true
      AND (
        last_posted_at IS NULL
        OR last_posted_at <= now() - (interval_minutes * interval '1 minute')
      )
    ORDER BY id ASC`) as Account[];

  if (due.length === 0) {
    return NextResponse.json({ success: true, posted: 0, results: [] });
  }

  // Run accounts sequentially to keep within serverless limits and avoid
  // hammering the Gemini API; volume is low (a handful of accounts).
  const results = [];
  for (const account of due) {
    results.push(await generateAndPost(account));
  }

  const posted = results.filter((r) => r.ok).length;
  return NextResponse.json({ success: true, posted, total: due.length, results });
}
