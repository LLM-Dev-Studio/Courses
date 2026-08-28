import fs from "node:fs/promises";
import path from "node:path";

import { headers } from "next/headers";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { markdownComponents } from "@/lib/markdown-components";
import CopyLinkButton from "./CopyLinkButton";

export const metadata = {
  title: "LLM Course-Writing Guide",
  description: "Point an LLM at this page's raw text to teach it how to write a course for this platform.",
};

async function readGuide() {
  const guidePath = path.join(process.cwd(), "src", "content", "llm-course-guide.md");
  return fs.readFile(guidePath, "utf-8");
}

async function getAbsoluteGuideUrl() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}/llms.txt`;
}

export default async function LlmGuidePage() {
  const [guide, guideUrl] = await Promise.all([readGuide(), getAbsoluteGuideUrl()]);

  return (
    <div className="min-h-screen bg-[var(--sand-50)] text-[var(--green-900)]">
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">LLM Course-Writing Guide</h1>
            <p className="mt-2 text-[var(--green-700)]">
              A self-contained spec an LLM can follow to write a valid course for this platform.
            </p>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center rounded-lg border border-[var(--sand-400)] bg-white px-4 py-2 text-sm font-semibold text-[var(--green-800)] transition hover:bg-[var(--sand-100)]"
          >
            Course Catalog
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-[var(--sand-300)] bg-white p-6 shadow-sm">
          <p className="text-sm text-[var(--green-800)]">
            Give this URL to an LLM (paste it in a prompt, or have it fetch the page) and it can
            write a course for this platform on its own:
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a
              href={guideUrl}
              className="break-all rounded-lg bg-[var(--sand-100)] px-3 py-1.5 font-mono text-sm text-[var(--green-900)] underline decoration-[var(--green-700)]/40 underline-offset-2 hover:bg-[var(--sand-200)]"
            >
              {guideUrl}
            </a>
            <CopyLinkButton url={guideUrl} />
          </div>
        </div>

        <article className="prose prose-neutral mt-8 max-w-none rounded-2xl border border-[var(--sand-300)] bg-white p-6 shadow-sm sm:p-8">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {guide}
          </ReactMarkdown>
        </article>
      </main>
    </div>
  );
}
