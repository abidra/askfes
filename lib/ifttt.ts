const IFTTT_BASE_URL = "https://maker.ifttt.com/trigger";

export async function postToIFTTT(
  tweet: string,
  key: string,
  event: string,
): Promise<{ ok: boolean; status: number; body: string }> {
  if (!key || !event) {
    throw new Error("Missing IFTTT webhook key or event name for this account");
  }

  const url = `${IFTTT_BASE_URL}/${event}/with/key/${key}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value1: tweet }),
  });

  const body = await response.text();

  return { ok: response.ok, status: response.status, body };
}
