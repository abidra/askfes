// Seeds the existing single-account config into the accounts table as account #1.
// Safe to run once; skips if an account named 'askfes' already exists.
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
try {
  const env = readFileSync(join(root, ".env.local"), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const sql = neon(process.env.DATABASE_URL);

const SYSTEM_PROMPT = `Kamu adalah akun X/Twitter @askfes yang terkenal karena pertanyaan-pertanyaan receh tapi bikin mikir.

ATURAN:
- Tulis SATU pertanyaan dalam Bahasa Indonesia kasual/gaul
- Target audiens: anak muda Indonesia (Gen Z & Milenial)
- Pertanyaan harus relatable, bikin mikir, dan orang pengen jawab/retweet
- Pakai bahasa sehari-hari, boleh pakai kata gaul (sih, gak, emang, nggak, anjir, dll)
- Maksimal 280 karakter (termasuk prefix di depan)
- Variasi tone: lucu, filosofis, kontroversial tapi aman, nostalgia, absurd, random
- JANGAN pakai hashtag
- JANGAN pakai emoji kecuali sangat natural (maksimal 1)
- Buat pertanyaan yang bikin orang pengen quote tweet atau reply`;

const topics = [
  "kehidupan sehari-hari", "hubungan dan percintaan", "persahabatan", "karir dan pekerjaan",
  "kuliah dan sekolah", "makanan dan kuliner Indonesia", "kebiasaan unik orang Indonesia",
  "media sosial dan internet", "teknologi dan gadget", "uang dan keuangan", "self-improvement",
  "mental health", "keluarga", "masa kecil dan nostalgia", "musik dan film",
  "budaya pop Indonesia", "K-pop dan K-drama", "gaming", "traveling dan liburan",
  "Jakarta vs daerah", "kost-kostan dan anak rantau", "overthinking dan insecurities",
  "toxic traits dan red flags", "hot takes dan unpopular opinions", "dilema moral",
  "would you rather", "mitos dan kepercayaan", "jajan dan street food", "olahraga",
  "hewan peliharaan", "quarter life crisis", "impian dan cita-cita",
  "kebiasaan buruk yang susah dihilangkan", "hal-hal receh tapi bikin kesel",
  "pengalaman memalukan", "fenomena sosial di Indonesia", "bahasa gaul dan slang",
  "generasi milenial vs gen Z", "drama kantor dan teman kerja", "belanja online dan e-commerce",
];

const existing = await sql`SELECT id FROM accounts WHERE name = 'askfes' LIMIT 1`;
if (existing.length > 0) {
  console.log(`Account 'askfes' already exists (id ${existing[0].id}). Skipping.`);
  process.exit(0);
}

const rows = await sql`
  INSERT INTO accounts
    (name, handle, ifttt_webhook_key, ifttt_event_name, post_prefix, system_prompt, topics, interval_minutes, enabled)
  VALUES
    (${"askfes"}, ${"@askfes"}, ${process.env.IFTTT_WEBHOOK_KEY ?? ""},
     ${process.env.IFTTT_EVENT_NAME ?? "askfes_tweet"}, ${"ask! "}, ${SYSTEM_PROMPT},
     ${JSON.stringify(topics)}, ${20}, ${true})
  RETURNING id`;

console.log(`Seeded account 'askfes' with id ${rows[0].id}.`);
