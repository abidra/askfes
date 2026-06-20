"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Account } from "@/lib/db";

type Props = { account?: Account };

const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-indigo-500";
const labelClass = "block text-sm font-medium text-zinc-300";

export default function AccountForm({ account }: Props) {
  const router = useRouter();
  const editing = !!account;

  const [form, setForm] = useState({
    name: account?.name ?? "",
    handle: account?.handle ?? "",
    ifttt_webhook_key: account?.ifttt_webhook_key ?? "",
    ifttt_event_name: account?.ifttt_event_name ?? "",
    post_prefix: account?.post_prefix ?? "",
    interval_minutes: account?.interval_minutes ?? 60,
    enabled: account?.enabled ?? true,
    system_prompt: account?.system_prompt ?? "",
    topics: (account?.topics ?? []).join("\n"),
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(editing ? `/api/accounts/${account!.id}` : "/api/accounts", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        topics: form.topics, // server splits on newlines/commas
      }),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Save failed");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Account name</label>
          <input className={`mt-1 ${inputClass}`} value={form.name}
            onChange={(e) => set("name", e.target.value)} placeholder="askfes" required />
        </div>
        <div>
          <label className={labelClass}>Handle (optional)</label>
          <input className={`mt-1 ${inputClass}`} value={form.handle}
            onChange={(e) => set("handle", e.target.value)} placeholder="@askfes" />
        </div>
        <div>
          <label className={labelClass}>IFTTT webhook key</label>
          <input className={`mt-1 ${inputClass}`} value={form.ifttt_webhook_key}
            onChange={(e) => set("ifttt_webhook_key", e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>IFTTT event name</label>
          <input className={`mt-1 ${inputClass}`} value={form.ifttt_event_name}
            onChange={(e) => set("ifttt_event_name", e.target.value)} placeholder="askfes_tweet" required />
        </div>
        <div>
          <label className={labelClass}>Post prefix</label>
          <input className={`mt-1 ${inputClass}`} value={form.post_prefix}
            onChange={(e) => set("post_prefix", e.target.value)} placeholder="ask! " />
          <p className="mt-1 text-xs text-zinc-500">Prepended to every tweet. Leave blank for none.</p>
        </div>
        <div>
          <label className={labelClass}>Interval (minutes)</label>
          <input type="number" min={1} className={`mt-1 ${inputClass}`} value={form.interval_minutes}
            onChange={(e) => set("interval_minutes", Number(e.target.value))} required />
          <p className="mt-1 text-xs text-zinc-500">How often this account posts.</p>
        </div>
      </div>

      <div>
        <label className={labelClass}>System prompt</label>
        <textarea className={`mt-1 ${inputClass} min-h-40 font-mono`} value={form.system_prompt}
          onChange={(e) => set("system_prompt", e.target.value)} required />
        <p className="mt-1 text-xs text-zinc-500">The persona / instructions sent to Gemini.</p>
      </div>

      <div>
        <label className={labelClass}>Topics</label>
        <textarea className={`mt-1 ${inputClass} min-h-32`} value={form.topics}
          onChange={(e) => set("topics", e.target.value)}
          placeholder={"one topic per line\nor comma-separated"} />
        <p className="mt-1 text-xs text-zinc-500">A random topic is picked each post. One per line.</p>
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input type="checkbox" checked={form.enabled}
          onChange={(e) => set("enabled", e.target.checked)} className="h-4 w-4 accent-indigo-500" />
        Enabled (included in cron posting)
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
          {saving ? "Saving…" : editing ? "Save changes" : "Create account"}
        </button>
        <button type="button" onClick={() => router.push("/dashboard")}
          className="rounded-lg border border-zinc-700 px-5 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
          Cancel
        </button>
      </div>
    </form>
  );
}
