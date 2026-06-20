import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export type Subject = "matematika" | "english";
export type Difficulty = "mudah" | "sedang" | "sulit";

export type Soal = {
  question: string; // boleh mengandung LaTeX inline $...$ atau display $$...$$
  options: string[]; // 5 opsi (A-E), boleh mengandung LaTeX
  answer: string; // huruf opsi benar: "A".."E"
  explanation: string; // pembahasan, boleh mengandung LaTeX
};

export type GenerateSoalInput = {
  subject: Subject;
  topic?: string;
  difficulty: Difficulty;
  count: number;
};

const SUBJECT_LABEL: Record<Subject, string> = {
  matematika: "Matematika (Penalaran Matematika UTBK/SNBT)",
  english: "Bahasa Inggris (Literasi dalam Bahasa Inggris UTBK/SNBT)",
};

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  mudah: "mudah (level dasar)",
  sedang: "sedang (level menengah, mirip soal UTBK asli)",
  sulit: "sulit (HOTS, menantang, level atas UTBK)",
};

function buildSystemPrompt(subject: Subject): string {
  const common = `Kamu adalah penyusun soal profesional untuk persiapan UTBK/SNBT di Indonesia.
Tugasmu membuat soal pilihan ganda yang berkualitas, akurat, dan setara dengan soal UTBK/SNBT asli.

ATURAN PENULISAN:
- Setiap soal WAJIB punya tepat 5 opsi jawaban.
- Field "options" berisi HANYA teks opsi tanpa label "A.", "B.", dst. Label akan ditambahkan otomatis.
- Field "answer" berisi SATU huruf saja: "A", "B", "C", "D", atau "E" sesuai urutan opsi yang benar.
- Field "explanation" berisi pembahasan langkah demi langkah yang jelas.
- Pastikan jawaban benar-benar tepat dan pembahasan konsisten dengan opsi yang dipilih.`;

  if (subject === "matematika") {
    return `${common}

ATURAN MATEMATIKA (PENTING):
- Tulis SEMUA notasi & ekspresi matematika dalam LaTeX.
- Gunakan $...$ untuk rumus inline dan $$...$$ untuk rumus yang berdiri sendiri.
- Contoh: "Nilai $x$ yang memenuhi $2x + 3 = 11$ adalah", opsi seperti "$x = 4$".
- Gunakan \\frac, \\sqrt, \\times, \\div, \\geq, \\leq, ^, _ , dll dengan benar.
- JANGAN gunakan tanda kurung Unicode untuk pecahan; selalu pakai \\frac{}{}.
- Soal dan pembahasan dalam Bahasa Indonesia.`;
  }

  return `${common}

ATURAN BAHASA INGGRIS (PENTING):
- Soal, opsi, dan pertanyaan ditulis dalam Bahasa INGGRIS.
- Untuk soal reading comprehension, sertakan teks bacaan singkat di awal field "question" (1-2 paragraf), lalu pertanyaannya.
- Variasikan jenis soal: main idea, inference, vocabulary in context, reference, dan structure/grammar.
- Pembahasan (explanation) ditulis dalam Bahasa Indonesia agar mudah dipahami siswa, boleh mengutip bagian teks Inggris.
- Tidak perlu LaTeX untuk subjek ini.`;
}

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    soal: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          question: { type: SchemaType.STRING },
          options: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
          answer: { type: SchemaType.STRING },
          explanation: { type: SchemaType.STRING },
        },
        required: ["question", "options", "answer", "explanation"],
      },
    },
  },
  required: ["soal"],
};

export async function generateSoal(input: GenerateSoalInput): Promise<Soal[]> {
  const count = Math.min(Math.max(input.count, 1), 10);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: buildSystemPrompt(input.subject),
    generationConfig: {
      temperature: 1.0,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      responseSchema: responseSchema as any,
    },
  });

  const topicLine = input.topic?.trim()
    ? `Topik/materi: "${input.topic.trim()}".`
    : "Topik bebas namun relevan untuk UTBK/SNBT.";

  const userPrompt = `Buat ${count} soal pilihan ganda.
Mata pelajaran: ${SUBJECT_LABEL[input.subject]}.
Tingkat kesulitan: ${DIFFICULTY_LABEL[input.difficulty]}.
${topicLine}
Pastikan setiap soal unik dan tidak mengulang konsep yang sama persis.`;

  const result = await model.generateContent(userPrompt);
  const raw = result.response.text();

  let parsed: { soal?: Soal[] };
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Gagal membaca hasil dari AI. Coba lagi.");
  }

  const soal = (parsed.soal ?? [])
    .filter(
      (s) =>
        s &&
        typeof s.question === "string" &&
        Array.isArray(s.options) &&
        s.options.length >= 2,
    )
    .map((s) => ({
      question: s.question.trim(),
      options: s.options.map((o) => String(o).trim()),
      answer: String(s.answer ?? "A").trim().toUpperCase().slice(0, 1),
      explanation: String(s.explanation ?? "").trim(),
    }));

  if (soal.length === 0) {
    throw new Error("AI tidak menghasilkan soal yang valid. Coba lagi.");
  }

  return soal;
}
