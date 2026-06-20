"use client";

import { useState } from "react";
import type { Soal } from "@/lib/soal";
import SoalCard from "./SoalCard";

type Subject = "matematika" | "english";
type Difficulty = "mudah" | "sedang" | "sulit";

const SUBJECTS: { value: Subject; label: string }[] = [
  { value: "matematika", label: "Matematika" },
  { value: "english", label: "Bahasa Inggris" },
];

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "mudah", label: "Mudah" },
  { value: "sedang", label: "Sedang" },
  { value: "sulit", label: "Sulit" },
];

const TOPIC_SUGGESTIONS: Record<Subject, string[]> = {
  matematika: [
    "Aljabar",
    "Fungsi & Persamaan",
    "Geometri",
    "Trigonometri",
    "Statistika",
    "Peluang",
    "Barisan & Deret",
  ],
  english: [
    "Reading Comprehension",
    "Main Idea",
    "Inference",
    "Vocabulary in Context",
    "Grammar / Structure",
  ],
};

export default function SoalGenerator() {
  const [subject, setSubject] = useState<Subject>("matematika");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("sedang");
  const [count, setCount] = useState(3);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [soal, setSoal] = useState<Soal[]>([]);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setSoal([]);
    try {
      const res = await fetch("/api/soal/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topic, difficulty, count }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal membuat soal.");
      setSoal(data.soal as Soal[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
      {/* Panel kontrol */}
      <div className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900 p-5 lg:sticky lg:top-6">
        <h2 className="text-sm font-semibold text-zinc-300">Buat soal</h2>

        <label className="mt-4 block text-xs font-medium text-zinc-400">
          Mata pelajaran
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {SUBJECTS.map((s) => (
            <button
              key={s.value}
              onClick={() => {
                setSubject(s.value);
                setTopic("");
              }}
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                subject === s.value
                  ? "border-indigo-500 bg-indigo-600/20 text-indigo-300"
                  : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-xs font-medium text-zinc-400">
          Topik / materi (opsional)
        </label>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="mis. Trigonometri"
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {TOPIC_SUGGESTIONS[subject].map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400 hover:bg-zinc-800"
            >
              {t}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-xs font-medium text-zinc-400">
          Tingkat kesulitan
        </label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              onClick={() => setDifficulty(d.value)}
              className={`rounded-lg border px-2 py-2 text-sm font-medium ${
                difficulty === d.value
                  ? "border-indigo-500 bg-indigo-600/20 text-indigo-300"
                  : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-xs font-medium text-zinc-400">
          Jumlah soal: <span className="text-zinc-200">{count}</span>
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="mt-2 w-full accent-indigo-500"
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "Membuat soal…" : "Generate soal"}
        </button>

        {error && (
          <p className="mt-3 rounded-lg bg-red-950 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        )}
      </div>

      {/* Hasil */}
      <div>
        {soal.length === 0 && !loading && (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-zinc-800 text-center text-sm text-zinc-500">
            Atur pilihan di samping, lalu klik “Generate soal”.
          </div>
        )}

        {loading && (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-zinc-800 text-sm text-zinc-500">
            Sedang menyusun soal…
          </div>
        )}

        <div className="space-y-5">
          {soal.map((s, i) => (
            <SoalCard key={i} soal={s} index={i} subject={subject} />
          ))}
        </div>
      </div>
    </div>
  );
}
