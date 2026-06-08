import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--sand-50)] px-4 py-16 text-[var(--green-900)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl rounded-2xl border border-[var(--sand-300)] bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--green-700)]">
          AI Dev Studio
        </p>
        <h1 className="mt-2 text-3xl font-bold">Course Not Found</h1>
        <p className="mt-3 text-[var(--green-700)]">
          The course you requested could not be found.
        </p>
        <div className="mt-6">
          <Link
            className="inline-flex items-center rounded-lg bg-[var(--green-800)] px-4 py-2 text-sm font-semibold !text-white hover:bg-[var(--green-700)]"
            href="/"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    </main>
  );
}
