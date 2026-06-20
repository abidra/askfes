import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export type GenerateInput = {
  systemPrompt: string;
  topics: string[];
  prefix: string;
};

export type GenerateResult = {
  text: string;
  topic: string | null;
};

function pickTopic(topics: string[]): string | null {
  if (!topics || topics.length === 0) return null;
  return topics[Math.floor(Math.random() * topics.length)];
}

export async function generateViralQuestion(input: GenerateInput): Promise<GenerateResult> {
  const topic = pickTopic(input.topics);
  const prefix = input.prefix ?? "";

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 1.2,
      maxOutputTokens: 1024,
      topP: 0.95,
      topK: 40,
    },
  });

  const userPrompt = topic
    ? `Buat satu pertanyaan viral tentang topik: "${topic}". Langsung tulis pertanyaannya saja.`
    : `Buat satu pertanyaan viral. Langsung tulis pertanyaannya saja.`;

  const result = await model.generateContent([
    { text: input.systemPrompt },
    { text: userPrompt },
  ]);

  let text = result.response.text().trim();

  // Ensure the configured prefix (e.g. "ask! ") is present exactly once.
  if (prefix && !text.toLowerCase().startsWith(prefix.trim().toLowerCase())) {
    text = `${prefix}${text}`;
  }

  if (text.length > 280) {
    text = text.slice(0, 277) + "...";
  }

  return { text, topic };
}
