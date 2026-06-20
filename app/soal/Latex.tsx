"use client";

import { useMemo } from "react";
import katex from "katex";

// Render teks yang mengandung LaTeX di antara $...$ (inline) dan $$...$$ (display).
// Bagian non-matematika ditampilkan apa adanya, mempertahankan baris baru.

type Segment =
  | { type: "text"; value: string }
  | { type: "math"; value: string; display: boolean };

function tokenize(input: string): Segment[] {
  const segments: Segment[] = [];
  const regex = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > last) {
      segments.push({ type: "text", value: input.slice(last, match.index) });
    }
    if (match[1] !== undefined) {
      segments.push({ type: "math", value: match[1], display: true });
    } else {
      segments.push({ type: "math", value: match[2], display: false });
    }
    last = regex.lastIndex;
  }
  if (last < input.length) {
    segments.push({ type: "text", value: input.slice(last) });
  }
  return segments;
}

function renderMath(value: string, display: boolean): string {
  try {
    return katex.renderToString(value, {
      displayMode: display,
      throwOnError: false,
      output: "html",
    });
  } catch {
    return value;
  }
}

export default function Latex({ text }: { text: string }) {
  const segments = useMemo(() => tokenize(text), [text]);

  return (
    <span className="whitespace-pre-wrap">
      {segments.map((seg, i) => {
        if (seg.type === "text") {
          return <span key={i}>{seg.value}</span>;
        }
        return (
          <span
            key={i}
            className={seg.display ? "block my-2" : "inline-block"}
            dangerouslySetInnerHTML={{
              __html: renderMath(seg.value, seg.display),
            }}
          />
        );
      })}
    </span>
  );
}
