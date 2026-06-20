import { NextRequest, NextResponse } from "next/server";
import { generateSoal, type Difficulty, type Subject } from "@/lib/soal";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SUBJECTS: Subject[] = ["matematika", "english"];
const DIFFICULTIES: Difficulty[] = ["mudah", "sedang", "sulit"];

export async function POST(request: NextRequest) {
  let body: {
    subject?: string;
    topic?: string;
    difficulty?: string;
    count?: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const subject = body.subject as Subject;
  const difficulty = (body.difficulty ?? "sedang") as Difficulty;
  const count = Number(body.count ?? 3);

  if (!SUBJECTS.includes(subject)) {
    return NextResponse.json(
      { error: "Mata pelajaran tidak valid." },
      { status: 400 },
    );
  }
  if (!DIFFICULTIES.includes(difficulty)) {
    return NextResponse.json(
      { error: "Tingkat kesulitan tidak valid." },
      { status: 400 },
    );
  }
  if (!Number.isFinite(count) || count < 1 || count > 10) {
    return NextResponse.json(
      { error: "Jumlah soal harus antara 1 dan 10." },
      { status: 400 },
    );
  }

  try {
    const soal = await generateSoal({
      subject,
      topic: body.topic,
      difficulty,
      count,
    });
    return NextResponse.json({ soal });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal membuat soal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
