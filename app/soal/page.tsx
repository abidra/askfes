import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import SoalGenerator from "./SoalGenerator";

export const metadata: Metadata = {
  title: "Generator Soal UTBK/SNBT — askfes",
  description:
    "Buat soal latihan UTBK/SNBT (Matematika & Bahasa Inggris) lengkap dengan rumus LaTeX dan unduh tiap soal sebagai gambar.",
};

export default function SoalPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold">Generator Soal UTBK/SNBT</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Latihan Matematika & Bahasa Inggris. Setiap soal bisa diunduh
            sebagai gambar untuk dibagikan.
          </p>
        </header>
        <SoalGenerator />
      </div>
    </div>
  );
}
