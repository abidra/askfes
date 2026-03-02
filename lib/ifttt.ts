const IFTTT_BASE_URL = "https://maker.ifttt.com/trigger";

export async function postToIFTTT(tweet: string): Promise<{ ok: boolean; status: number; body: string }> {
  const key = process.env.IFTTT_WEBHOOK_KEY;
  const event = process.env.IFTTT_EVENT_NAME;

  if (!key || !event) {
    throw new Error("Missing IFTTT_WEBHOOK_KEY or IFTTT_EVENT_NAME env vars");
  }

  const url = `${IFTTT_BASE_URL}/${event}/with/key/${key}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value1: tweet }),
  });

  const body = await response.text();

  return {
    ok: response.ok,
    status: response.status,
    body,
  };
}
