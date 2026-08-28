import fs from "node:fs/promises";
import path from "node:path";

export async function GET() {
  const guidePath = path.join(process.cwd(), "src", "content", "llm-course-guide.md");
  const content = await fs.readFile(guidePath, "utf-8");

  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
