"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Account } from "@/lib/db";

function nextPostLabel(account: Account): string {
  if (!account.enabled) return "Disabled";
  if (!account.last_posted_at) return "Due now";
  const next = new Date(account.last_posted_at).getTime() + account.interval_minutes * 60_000;
  const diffMin = Math.round((next - Date.now()) / 60_000);
  if (diffMin <= 0) return "Due now";
  if (diffMin < 60) return `Next in ~${diffMin}m`;
  return `Next in ~${Math.round(diffMin / 60)}h`;
}

export default function AccountCard({ account }: { account: Account }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function testNow() {
    setBusy(true);
    setMsg(null);
    const res = await fetch(`/api/accounts/${account.id}/test`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok && data.ok) {
      setMsg({ ok: true, text: `Posted: ${data.tweet}` });
    } else {
      setMsg({ ok: false, text: data.error || data.tweet || "Failed to post" });
    }
    router.refresh();
  }

  async function toggleEnabled() {
    setBusy(true);
    await fetch(`/api/accounts/${account.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...account, enabled: !account.enabled }),
    });
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm(`Delete account "${account.name}"? This removes its post history too.`)) return;
    setBusy(true);
    await fetch(`/api/accounts/${account.id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-zinc-50">{account.name}</h3>
            <span className={`inline-block h-2 w-2 rounded-full ${account.enabled ? "bg-emerald-500" : "bg-zinc-600"}`} />
          </div>
          {account.handle && <p className="text-sm text-zinc-500">{account.handle}</p>}
        </div>
        <span className="text-xs text-zinc-400">{nextPostLabel(account)}</span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-zinc-400">
        <div><dt className="text-zinc-500">Event</dt><dd className="text-zinc-300">{account.ifttt_event_name}</dd></div>
        <div><dt className="text-zinc-500">Interval</dt><dd className="text-zinc-300">{account.interval_minutes}m</dd></div>
        <div><dt className="text-zinc-500">Topics</dt><dd className="text-zinc-300">{account.topics.length}</dd></div>
        <div><dt className="text-zinc-500">Last post</dt><dd className="text-zinc-300">
          {account.last_posted_at ? new Date(account.last_posted_at).toLocaleString() : "never"}
        </dd></div>
      </dl>

      {msg && (
        <p className={`mt-3 rounded-lg px-3 py-2 text-xs ${msg.ok ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>
          {msg.text}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={testNow} disabled={busy}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
          {busy ? "…" : "Test now"}
        </button>
        <button onClick={toggleEnabled} disabled={busy}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-50">
          {account.enabled ? "Disable" : "Enable"}
        </button>
        <Link href={`/dashboard/accounts/${account.id}`}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800">
          Edit
        </Link>
        <button onClick={remove} disabled={busy}
          className="rounded-lg border border-red-900 px-3 py-1.5 text-xs text-red-400 hover:bg-red-950 disabled:opacity-50">
          Delete
        </button>
      </div>
    </div>
  );
}
