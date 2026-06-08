import path from "node:path";

export const COURSES_ROOT = path.join(process.cwd(), "..", "courses");

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
