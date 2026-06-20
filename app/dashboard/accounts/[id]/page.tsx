import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccount, getRecentPosts } from "@/lib/db";
import AccountForm from "../../AccountForm";

export const dynamic = "force-dynamic";

export default async function EditAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const account = await getAccount(id);
  if (!account) notFound();

  const posts = await getRecentPosts(id, 15);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-200">← Back</Link>
        <h1 className="mt-3 text-2xl font-semibold">Edit {account.name}</h1>
        <div className="mt-8">
          <AccountForm account={account} />
        </div>

        <section className="mt-12">
          <h2 className="text-lg font-semibold">Recent posts</h2>
          {posts.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">No posts yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {posts.map((p) => (
                <li key={p.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-xs font-medium ${p.status === "success" ? "text-emerald-400" : "text-red-400"}`}>
                      {p.status}{p.ifttt_status ? ` · ${p.ifttt_status}` : ""}
                    </span>
                    <span className="text-xs text-zinc-500">{new Date(p.created_at).toLocaleString()}</span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-200">{p.content || <em className="text-zinc-500">(no content)</em>}</p>
                  {p.error && <p className="mt-1 text-xs text-red-400">{p.error}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
