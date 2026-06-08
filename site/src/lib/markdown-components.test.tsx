import { render, screen } from "@testing-library/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { markdownComponents } from "@/lib/markdown-components";

describe("markdownComponents", () => {
  it("renders a TIP callout from blockquote marker", () => {
    render(
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {"> [!TIP] This is a tip"}
      </ReactMarkdown>,
    );

    expect(screen.getByText("Tip")).toBeInTheDocument();
    expect(screen.getByText("This is a tip")).toBeInTheDocument();
  });

  it("renders a WARNING callout", () => {
    render(
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {"> [!WARNING] Watch out"}
      </ReactMarkdown>,
    );

    expect(screen.getByText("Warning")).toBeInTheDocument();
  });

  it("renders a NOTE callout", () => {
    render(
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {"> [!NOTE] Take note"}
      </ReactMarkdown>,
    );

    expect(screen.getByText("Note")).toBeInTheDocument();
  });

  it("renders a SUCCESS callout", () => {
    render(
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {"> [!SUCCESS] Well done"}
      </ReactMarkdown>,
    );

    expect(screen.getByText("Success")).toBeInTheDocument();
  });

  it("renders plain blockquote for unrecognised markers", () => {
    const { container } = render(
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {"> Just a quote"}
      </ReactMarkdown>,
    );

    expect(container.querySelector("blockquote")).toBeInTheDocument();
  });

  it("renders external links with External badge", () => {
    render(
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {"[Visit](https://example.com)"}
      </ReactMarkdown>,
    );

    expect(screen.getByText("External ↗")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Visit/i })).toHaveAttribute("target", "_blank");
  });

  it("renders internal links without External badge", () => {
    render(
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {"[About](/about)"}
      </ReactMarkdown>,
    );

    expect(screen.queryByText("External ↗")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /About/i })).not.toHaveAttribute("target");
  });
});
