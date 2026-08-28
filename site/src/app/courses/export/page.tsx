"use client";

import Link from "next/link";
import { useState } from "react";

export default function CourseExportPage() {
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setIsDownloading(true);
    try {
      const response = await fetch("/api/courses/export", { method: "POST", body: new FormData(event.currentTarget) });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || "Unable to create ZIP."); }
      const blob = await response.blob(); const url = URL.createObjectURL(blob); const link = document.createElement("a");
      link.href = url; link.download = `${new FormData(event.currentTarget).get("courseId") || "new-course"}.zip`; link.click(); URL.revokeObjectURL(url);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to create ZIP."); } finally { setIsDownloading(false); }
  }

  return <div className="min-h-screen bg-[var(--sand-50)] text-[var(--green-900)]"><main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8"><div className="rounded-2xl border border-[var(--sand-300)] bg-white p-6 shadow-sm sm:p-8"><p className="text-sm font-semibold uppercase tracking-wide text-[var(--green-700)]">Course Authoring</p><h1 className="mt-2 text-2xl font-bold">Download a starter course</h1><p className="mt-2 text-sm leading-6 text-[var(--green-700)]">Create a ZIP you can unpack, customize, and add to a local branch before opening a pull request.</p><form onSubmit={submit} className="mt-6 space-y-4"><Field id="title" label="Course Title" required placeholder="How to Run Better Toolbox Talks" /><Field id="subtitle" label="Subtitle (Optional)" placeholder="Practical skills for frontline supervisors" /><Field id="audience" label="Audience (Optional)" placeholder="Operations teams" /><Field id="courseId" label="Course ID (Optional)" placeholder="auto-generated from title if blank" /><div className="grid gap-4 sm:grid-cols-2"><Field id="passThreshold" label="Quiz Pass Threshold (%)" type="number" defaultValue="80" /><Field id="maxAttempts" label="Quiz Max Attempts" type="number" defaultValue="2" /></div><label className="block text-sm font-semibold text-[var(--green-800)]" htmlFor="resetScopeOnFail">On Failed Quiz Reset Scope<select id="resetScopeOnFail" name="resetScopeOnFail" defaultValue="module" className="mt-1 w-full rounded-lg border border-[var(--sand-300)] bg-white px-3 py-2 font-normal outline-none focus:border-[var(--green-600)]"><option value="module">Module reset (default)</option><option value="course">Course reset</option></select></label>{error ? <p role="alert" className="text-sm font-semibold text-red-700">{error}</p> : null}<div className="flex flex-wrap items-center justify-between gap-3 pt-2"><Link href="/" className="rounded-lg border border-[var(--sand-400)] px-4 py-2 text-sm font-semibold text-[var(--green-800)]">Cancel</Link><button disabled={isDownloading} className="rounded-lg bg-[var(--green-800)] px-4 py-2 text-sm font-semibold !text-white disabled:opacity-60">{isDownloading ? "Preparing ZIP…" : "Download Course ZIP"}</button></div></form></div></main></div>;
}

function Field({ id, label, type = "text", ...props }: { id: string; label: string; type?: string; [key: string]: string | boolean | undefined }) { return <label className="block text-sm font-semibold text-[var(--green-800)]" htmlFor={id}>{label}<input id={id} name={id} type={type} {...props} className="mt-1 w-full rounded-lg border border-[var(--sand-300)] bg-white px-3 py-2 font-normal outline-none focus:border-[var(--green-600)]" /></label>; }
