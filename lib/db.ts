import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Neon HTTP driver — works well in Vercel serverless/edge functions.
export const sql = neon(process.env.DATABASE_URL);

export type Account = {
  id: number;
  name: string;
  handle: string | null;
  ifttt_webhook_key: string;
  ifttt_event_name: string;
  post_prefix: string;
  system_prompt: string;
  topics: string[];
  interval_minutes: number;
  enabled: boolean;
  last_posted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: number;
  account_id: number;
  content: string;
  topic: string | null;
  status: "success" | "failed";
  ifttt_status: number | null;
  error: string | null;
  created_at: string;
};

export async function getAccounts(): Promise<Account[]> {
  return (await sql`SELECT * FROM accounts ORDER BY id ASC`) as Account[];
}

export async function getAccount(id: number): Promise<Account | null> {
  const rows = (await sql`SELECT * FROM accounts WHERE id = ${id}`) as Account[];
  return rows[0] ?? null;
}

export type AccountInput = {
  name: string;
  handle: string | null;
  ifttt_webhook_key: string;
  ifttt_event_name: string;
  post_prefix: string;
  system_prompt: string;
  topics: string[];
  interval_minutes: number;
  enabled: boolean;
};

export async function createAccount(input: AccountInput): Promise<Account> {
  const rows = (await sql`
    INSERT INTO accounts
      (name, handle, ifttt_webhook_key, ifttt_event_name, post_prefix,
       system_prompt, topics, interval_minutes, enabled)
    VALUES
      (${input.name}, ${input.handle}, ${input.ifttt_webhook_key}, ${input.ifttt_event_name},
       ${input.post_prefix}, ${input.system_prompt}, ${JSON.stringify(input.topics)},
       ${input.interval_minutes}, ${input.enabled})
    RETURNING *`) as Account[];
  return rows[0];
}

export async function updateAccount(id: number, input: AccountInput): Promise<Account | null> {
  const rows = (await sql`
    UPDATE accounts SET
      name = ${input.name},
      handle = ${input.handle},
      ifttt_webhook_key = ${input.ifttt_webhook_key},
      ifttt_event_name = ${input.ifttt_event_name},
      post_prefix = ${input.post_prefix},
      system_prompt = ${input.system_prompt},
      topics = ${JSON.stringify(input.topics)},
      interval_minutes = ${input.interval_minutes},
      enabled = ${input.enabled},
      updated_at = now()
    WHERE id = ${id}
    RETURNING *`) as Account[];
  return rows[0] ?? null;
}

export async function deleteAccount(id: number): Promise<void> {
  await sql`DELETE FROM accounts WHERE id = ${id}`;
}

export async function markPosted(id: number): Promise<void> {
  await sql`UPDATE accounts SET last_posted_at = now() WHERE id = ${id}`;
}

export async function logPost(
  accountId: number,
  content: string,
  topic: string | null,
  status: "success" | "failed",
  iftttStatus: number | null,
  error: string | null,
): Promise<void> {
  await sql`
    INSERT INTO posts (account_id, content, topic, status, ifttt_status, error)
    VALUES (${accountId}, ${content}, ${topic}, ${status}, ${iftttStatus}, ${error})`;
}

export async function getRecentPosts(accountId: number, limit = 10): Promise<Post[]> {
  return (await sql`
    SELECT * FROM posts WHERE account_id = ${accountId}
    ORDER BY created_at DESC LIMIT ${limit}`) as Post[];
}
