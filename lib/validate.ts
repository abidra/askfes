import { AccountInput } from "./db";

export function parseAccountInput(body: unknown): { ok: true; value: AccountInput } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid body" };
  }
  const b = body as Record<string, unknown>;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name) return { ok: false, error: "Name is required" };

  const ifttt_webhook_key = typeof b.ifttt_webhook_key === "string" ? b.ifttt_webhook_key.trim() : "";
  if (!ifttt_webhook_key) return { ok: false, error: "IFTTT webhook key is required" };

  const ifttt_event_name = typeof b.ifttt_event_name === "string" ? b.ifttt_event_name.trim() : "";
  if (!ifttt_event_name) return { ok: false, error: "IFTTT event name is required" };

  const system_prompt = typeof b.system_prompt === "string" ? b.system_prompt.trim() : "";
  if (!system_prompt) return { ok: false, error: "System prompt is required" };

  let topics: string[] = [];
  if (Array.isArray(b.topics)) {
    topics = b.topics.map((t) => String(t).trim()).filter(Boolean);
  } else if (typeof b.topics === "string") {
    // Accept newline- or comma-separated text from the form textarea.
    topics = b.topics.split(/[\n,]/).map((t) => t.trim()).filter(Boolean);
  }

  const interval_minutes = Math.max(1, Math.floor(Number(b.interval_minutes) || 60));

  return {
    ok: true,
    value: {
      name,
      handle: typeof b.handle === "string" && b.handle.trim() ? b.handle.trim() : null,
      ifttt_webhook_key,
      ifttt_event_name,
      post_prefix: typeof b.post_prefix === "string" ? b.post_prefix : "",
      system_prompt,
      topics,
      interval_minutes,
      enabled: b.enabled === undefined ? true : Boolean(b.enabled),
    },
  };
}
