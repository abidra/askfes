import { Account, logPost, markPosted } from "./db";
import { generateViralQuestion } from "./gemini";
import { postToIFTTT } from "./ifttt";

export type PostOutcome = {
  accountId: number;
  accountName: string;
  ok: boolean;
  tweet: string;
  topic: string | null;
  iftttStatus: number | null;
  error: string | null;
};

// Generates a tweet for one account, posts it via IFTTT, and records the result.
// Used by both the cron loop and the manual "test now" endpoint.
export async function generateAndPost(account: Account): Promise<PostOutcome> {
  let tweet = "";
  let topic: string | null = null;
  try {
    const generated = await generateViralQuestion({
      systemPrompt: account.system_prompt,
      topics: account.topics,
      prefix: account.post_prefix,
    });
    tweet = generated.text;
    topic = generated.topic;

    const ifttt = await postToIFTTT(tweet, account.ifttt_webhook_key, account.ifttt_event_name);

    if (!ifttt.ok) {
      await logPost(account.id, tweet, topic, "failed", ifttt.status, ifttt.body.slice(0, 500));
      return {
        accountId: account.id,
        accountName: account.name,
        ok: false,
        tweet,
        topic,
        iftttStatus: ifttt.status,
        error: `IFTTT returned ${ifttt.status}`,
      };
    }

    await logPost(account.id, tweet, topic, "success", ifttt.status, null);
    await markPosted(account.id);
    return {
      accountId: account.id,
      accountName: account.name,
      ok: true,
      tweet,
      topic,
      iftttStatus: ifttt.status,
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await logPost(account.id, tweet, topic, "failed", null, message.slice(0, 500));
    return {
      accountId: account.id,
      accountName: account.name,
      ok: false,
      tweet,
      topic,
      iftttStatus: null,
      error: message,
    };
  }
}
