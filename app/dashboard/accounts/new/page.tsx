import Link from "next/link";
import AccountForm from "../../AccountForm";

export default function NewAccountPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-200">← Back</Link>
        <h1 className="mt-3 text-2xl font-semibold">New account</h1>
        <p className="mt-1 text-sm text-zinc-400">Add an X account to automate via IFTTT.</p>
        <div className="mt-8">
          <AccountForm />
        </div>
      </div>
    </div>
  );
}
