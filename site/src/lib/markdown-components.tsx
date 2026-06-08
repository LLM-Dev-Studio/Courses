import { Children, isValidElement } from "react";

function getNodeText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map((item) => getNodeText(item)).join("");
  }

  if (isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    return getNodeText(props.children);
  }

  return "";
}

type CalloutKind = "tip" | "warning" | "note" | "success" | "information" | "important";

const CALLOUT_LABELS: Record<CalloutKind, string> = {
  tip: "Tip",
  warning: "Warning",
  note: "Note",
  success: "Success",
  information: "Information",
  important: "Important",
};

const CALLOUT_ICONS: Record<CalloutKind, string> = {
  tip: "💡",
  warning: "⚠️",
  note: "📋",
  success: "✅",
  information: "ℹ️",
  important: "❗",
};

const CALLOUT_CLASSES: Record<CalloutKind, { aside: string; label: string }> = {
  tip: {
    aside: "border-[var(--green-600)] bg-[#eaf4ed]",
    label: "text-[var(--green-700)]",
  },
  warning: {
    aside: "border-[#b86b37] bg-[#fbefe5]",
    label: "text-[#9a5328]",
  },
  note: {
    aside: "border-[#4c6b96] bg-[#ecf3fc]",
    label: "text-[#35547b]",
  },
  success: {
    aside: "border-[#2e7c52] bg-[#e7f6ee]",
    label: "text-[#256341]",
  },
  information: {
    aside: "border-[#2b7a8c] bg-[#e5f5f8]",
    label: "text-[#1e6070]",
  },
  important: {
    aside: "border-[#c0392b] bg-[#fdf0ef]",
    label: "text-[#a93226]",
  },
};

function CalloutBlock({
  kind,
  inlineContent,
  children,
}: {
  kind: CalloutKind;
  inlineContent: string;
  children: React.ReactNode;
}) {
  const classes = CALLOUT_CLASSES[kind];
  return (
    <aside className={`mb-4 rounded-xl border px-4 py-1.5 ${classes.aside}`}>
      <p className={`mb-1 text-base font-bold uppercase tracking-wide ${classes.label}`}>
        <span className="mr-1 not-italic normal-case">{CALLOUT_ICONS[kind]}</span>
        {CALLOUT_LABELS[kind]}
      </p>
      <div className="text-[var(--green-900)]">
        {inlineContent.length > 0 ? (
          <p key="inline-callout-copy" className="mb-1">
            {inlineContent}
          </p>
        ) : null}
        {children}
      </div>
    </aside>
  );
}

const MARKER_TO_KIND: Record<string, CalloutKind> = {
  "[!TIP]": "tip",
  "[!WARNING]": "warning",
  "[!NOTE]": "note",
  "[!SUCCESS]": "success",
  "[!INFORMATION]": "information",
  "[!IMPORTANT]": "important",
};

export const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="mb-4 mt-1 font-[var(--font-heading-serif)] text-3xl font-black text-[var(--green-900)]">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mb-3 mt-6 font-[var(--font-heading-serif)] text-2xl font-extrabold text-[var(--green-900)]">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mb-2 mt-5 font-[var(--font-heading-serif)] text-xl font-bold text-[var(--green-900)]">
      {children}
    </h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-4 leading-8 text-[var(--green-900)]">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-4 list-disc space-y-2 pl-6 text-[var(--green-900)]">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-4 list-decimal space-y-2 pl-6 text-[var(--green-900)]">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => <li className="leading-7">{children}</li>,
  blockquote: ({ children }: { children?: React.ReactNode }) => {
    const childNodes = Children.toArray(children);
    const firstMeaningfulIndex = childNodes.findIndex(
      (node) => getNodeText(node).trim().length > 0,
    );
    const firstNode = firstMeaningfulIndex >= 0 ? childNodes[firstMeaningfulIndex] : undefined;
    const firstNodeText = getNodeText(firstNode).trim();
    const markerMatch = firstNodeText.match(/^\[!(TIP|WARNING|NOTE|SUCCESS|INFORMATION|IMPORTANT)\]\s*(.*)$/i);
    const marker = markerMatch ? `[!${markerMatch[1].toUpperCase()}]` : null;
    const kind = marker ? MARKER_TO_KIND[marker] : undefined;

    if (!kind) {
      return (
        <blockquote className="mb-4 border-l-4 border-[var(--earth-500)] bg-[var(--sand-100)] px-4 py-2 italic text-[var(--green-800)]">
          {children}
        </blockquote>
      );
    }

    const inlineContent = markerMatch?.[2]?.trim() ?? "";
    const remainingNodes =
      firstMeaningfulIndex >= 0 ? childNodes.slice(firstMeaningfulIndex + 1) : childNodes;

    return (
      <CalloutBlock kind={kind} inlineContent={inlineContent}>
        {remainingNodes}
      </CalloutBlock>
    );
  },
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded bg-[var(--sand-100)] px-1.5 py-0.5 font-mono text-[0.92em]">
      {children}
    </code>
  ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="mb-4 overflow-x-auto rounded-lg bg-[var(--sand-100)] p-4">{children}</pre>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => {
    const isExternal = Boolean(href && /^https?:\/\//i.test(href));

    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer noopener" : undefined}
        className="inline-flex items-center gap-1 font-medium text-[var(--green-700)] underline decoration-[var(--earth-500)] underline-offset-2"
      >
        <span>{children}</span>
        {isExternal ? (
          <span className="rounded bg-[var(--sand-100)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--green-700)]">
            External ↗
          </span>
        ) : null}
      </a>
    );
  },
  hr: () => <hr className="my-6 border-[var(--sand-300)]" />,
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="border border-[var(--sand-300)] bg-[var(--sand-100)] px-3 py-2 font-semibold text-[var(--green-900)]">
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="border border-[var(--sand-300)] px-3 py-2 text-[var(--green-900)]">{children}</td>
  ),
};
