import fs from "node:fs/promises";
import path from "node:path";

import { getCourseFolderPath } from "@/lib/courses";

const CONTENT_TYPES: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

type RouteParams = { courseId: string; path: string[] };

export async function GET(_request: Request, context: { params: Promise<RouteParams> }) {
  const { courseId, path: pathSegments } = await context.params;

  const coursePath = await getCourseFolderPath(courseId);
  if (!coursePath) {
    return new Response("Not found", { status: 404 });
  }

  const requestedPath = path.resolve(coursePath, ...pathSegments);
  const courseRoot = path.resolve(coursePath) + path.sep;
  if (!requestedPath.startsWith(courseRoot)) {
    return new Response("Not found", { status: 404 });
  }

  const contentType = CONTENT_TYPES[path.extname(requestedPath).toLowerCase()];
  if (!contentType) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const file = await fs.readFile(requestedPath);
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
