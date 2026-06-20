import Link from "next/link";
import { getAccounts } from "@/lib/db";
import AccountCard from "./AccountCard";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const accounts = await getAccounts();
  const enabled = accounts.filter((a) => a.enabled).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Accounts</h1>
            <p className="mt-1 text-sm text-zinc-400">
              {accounts.length} account{accounts.length !== 1 ? "s" : ""} · {enabled} enabled
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/soal"
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800">
              Generator Soal
            </Link>
            <Link href="/dashboard/accounts/new"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
              + New account
            </Link>
            <LogoutButton />
          </div>
        </header>

        {accounts.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
            <p className="text-zinc-400">No accounts yet.</p>
            <Link href="/dashboard/accounts/new"
              className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
              Create your first account
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
