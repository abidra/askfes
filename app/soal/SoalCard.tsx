"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { Soal } from "@/lib/soal";
import Latex from "./Latex";

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

export default function SoalCard({
  soal,
  index,
  subject,
}: {
  soal: Soal;
  index: number;
  subject: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `soal-${subject}-${index + 1}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert("Gagal membuat gambar. Coba lagi.");
    } finally {
      setDownloading(false);
    }
  }

  const answerIndex = OPTION_LABELS.indexOf(soal.answer);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
      {/* Area yang akan diubah jadi gambar */}
      <div ref={cardRef} className="rounded-xl bg-white p-6 text-zinc-900">
        <div className="mb-4 flex items-center border-b border-zinc-200 pb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ptn%20fess.png"
            alt="ptn_fess"
            className="h-9 w-auto"
            crossOrigin="anonymous"
          />
        </div>

        <div className="flex gap-2">
          <span className="font-bold text-indigo-600">{index + 1}.</span>
          <div className="text-[15px] leading-relaxed">
            <Latex text={soal.question} />
          </div>
        </div>

        <ol className="mt-4 space-y-2">
          {soal.options.map((opt, i) => {
            const isAnswer = showAnswer && i === answerIndex;
            return (
              <li
                key={i}
                className={`flex gap-2 rounded-lg px-2 py-1 text-[15px] ${
                  isAnswer ? "bg-green-100 font-medium" : ""
                }`}
              >
                <span className="font-semibold text-zinc-600">
                  {OPTION_LABELS[i]}.
                </span>
                <span>
                  <Latex text={opt} />
                </span>
              </li>
            );
          })}
        </ol>

        {showAnswer && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
            <p className="font-semibold text-green-800">
              Jawaban: {soal.answer}
            </p>
            {soal.explanation && (
              <div className="mt-1 leading-relaxed text-zinc-700">
                <span className="font-semibold">Pembahasan: </span>
                <Latex text={soal.explanation} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Kontrol (tidak ikut ke gambar) */}
      <div className="mt-3 flex items-center gap-2 px-1">
        <button
          onClick={() => setShowAnswer((v) => !v)}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
        >
          {showAnswer ? "Sembunyikan kunci" : "Lihat kunci & pembahasan"}
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {downloading ? "Memproses…" : "⬇ Download gambar"}
        </button>
      </div>
    </div>
  );
}
