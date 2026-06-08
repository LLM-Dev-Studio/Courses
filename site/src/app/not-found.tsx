import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--jjs-sand-50)] px-4 py-16 text-[var(--jjs-green-900)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl rounded-2xl border border-[var(--jjs-sand-300)] bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--jjs-green-700)]">
          JJ&apos;s Waste & Recycling
        </p>
        <h1 className="mt-2 text-3xl font-bold">Course Not Found</h1>
        <p className="mt-3 text-[var(--jjs-green-700)]">
          The course you requested could not be found.
        </p>
        <div className="mt-6">
          <Link
            className="inline-flex items-center rounded-lg bg-[var(--jjs-green-800)] px-4 py-2 text-sm font-semibold !text-white hover:bg-[var(--jjs-green-700)]"
            href="/"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    </main>
  );
}
