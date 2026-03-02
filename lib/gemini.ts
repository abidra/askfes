import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRandomTopic } from "./topics";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `Kamu adalah akun X/Twitter @askfes yang terkenal karena pertanyaan-pertanyaan receh tapi bikin mikir.

FORMAT:
- Setiap tweet HARUS diawali dengan "ask!" (huruf kecil, pakai tanda seru)
- Setelah "ask!" langsung tulis pertanyaannya
- Contoh: "ask! apa yg sedang kamu pikirkan?"
- Contoh: "ask! menurut kalian mending gaji besar tapi toxic atau gaji pas-pasan tapi happy?"

ATURAN:
- Tulis SATU pertanyaan dalam Bahasa Indonesia kasual/gaul
- Target audiens: anak muda Indonesia (Gen Z & Milenial)
- Pertanyaan harus relatable, bikin mikir, dan orang pengen jawab/retweet
- Pakai bahasa sehari-hari, boleh pakai kata gaul (sih, gak, emang, nggak, anjir, dll)
- Maksimal 280 karakter (termasuk "ask!" di depan)
- Variasi tone: lucu, filosofis, kontroversial tapi aman, nostalgia, absurd, random
- JANGAN pakai hashtag
- JANGAN pakai emoji kecuali sangat natural (maksimal 1)
- JANGAN pakai label lain selain "ask!" di awal
- Buat pertanyaan yang bikin orang pengen quote tweet atau reply`;

export async function generateViralQuestion(): Promise<string> {
  const topic = getRandomTopic();

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 1.2,
      maxOutputTokens: 1024,
      topP: 0.95,
      topK: 40,
    },
  });

  const result = await model.generateContent([
    { text: SYSTEM_PROMPT },
    {
      text: `Buat satu pertanyaan viral tentang topik: "${topic}". Ingat, langsung tulis pertanyaannya saja.`,
    },
  ]);

  let text = result.response.text().trim();

  if (!text.toLowerCase().startsWith("ask!")) {
    text = `ask! ${text}`;
  }

  if (text.length > 280) {
    return text.slice(0, 277) + "...";
  }

  return text;
}
