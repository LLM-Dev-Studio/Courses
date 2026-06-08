import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

import { COURSES_ROOT, slugify } from "@/lib/course-paths";
import { normalizeTags } from "@/lib/course-filter";

const isProd = process.env.NODE_ENV === "production";

export interface ManifestLesson {
  id: string;
  file: string;
  title: string;
}

export interface ManifestModule {
  id: string;
  title: string;
  lessonCount: number;
  lessons: ManifestLesson[];
}

export interface CourseManifest {
  courseId?: string;
  title?: string;
  subtitle?: string;
  audience?: string;
  version?: number;
  totalLessons?: number;
  introFile?: string;
  indexFile?: string;
  modules?: ManifestModule[];
  tags?: string[];
}

type CourseMetadata = {
  courseId?: string;
  title?: string;
  subtitle?: string;
  audience?: string;
  introFile?: string;
  tags?: string[];
};

export interface CourseSummary {
  id: string;
  title: string;
  subtitle?: string;
  audience?: string;
  totalLessons: number;
  tags: string[];
  createdAt: number;
}

export interface CourseLesson {
  id: string;
  title: string;
  moduleId: string;
  moduleTitle: string;
  content: string;
  lessonType?: "lesson" | "quiz";
  quiz?: {
    passThreshold?: number;
    maxAttempts?: number;
    resetScopeOnFail?: "module" | "course";
    questions: Array<{
      prompt: string;
      options: string[];
      answer: string;
      explanation?: string;
    }>;
  };
}

export interface CourseData {
  id: string;
  title: string;
  subtitle?: string;
  audience?: string;
  totalLessons: number;
  intro: CourseLesson;
  modules: Array<{
    id: string;
    title: string;
    lessons: Array<Pick<CourseLesson, "id" | "title" | "moduleId" | "moduleTitle">>;
  }>;
  lessons: CourseLesson[];
}

function prettifyTitle(input: string): string {
  if (!input) return input;
  if (input !== input.toLowerCase()) return input;

  return input
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function extractLeadingHeadingTitle(markdown: string): string | null {
  const match = markdown.match(/^\s*#\s+(.+)$/m);
  if (!match) {
    return null;
  }

  return match[1].trim();
}

function parseMarkdownWithFrontmatter(rawMarkdown: string) {
  const normalizedRaw = rawMarkdown.replace(/^\uFEFF/, "");

  let parseInput = normalizedRaw;
  if (parseInput.startsWith("---")) {
    const secondDelimiterIndex = parseInput.indexOf("\n---", 3);
    if (secondDelimiterIndex > 0) {
      const frontmatterBlock = parseInput.slice(0, secondDelimiterIndex + 4);
      const normalizedFrontmatter = frontmatterBlock.replace(/\t/g, "  ");
      parseInput = normalizedFrontmatter + parseInput.slice(secondDelimiterIndex + 4);
    }
  }

  return matter(parseInput);
}

function parseLessonMarkdown(rawMarkdown: string): {
  content: string;
  lessonType: "lesson" | "quiz";
  quiz?: {
    passThreshold?: number;
    maxAttempts?: number;
    resetScopeOnFail?: "module" | "course";
    questions: Array<{
      prompt: string;
      options: string[];
      answer: string;
      explanation?: string;
    }>;
  };
} {
  const parsed = parseMarkdownWithFrontmatter(rawMarkdown);
  const content = parsed.content;
  const data = parsed.data as {
    lessonType?: unknown;
    passThreshold?: unknown;
    maxAttempts?: unknown;
    resetScopeOnFail?: unknown;
    questions?: unknown;
  };

  if (data.lessonType !== "quiz" || !Array.isArray(data.questions)) {
    return { content, lessonType: "lesson" };
  }

  const questions = data.questions
    .map((rawQuestion) => {
      const question = rawQuestion as {
        prompt?: unknown;
        options?: unknown;
        answer?: unknown;
        explanation?: unknown;
      };

      if (
        typeof question.prompt !== "string" ||
        !Array.isArray(question.options) ||
        typeof question.answer !== "string"
      ) {
        return null;
      }

      const options = question.options.filter((option): option is string => typeof option === "string");
      if (options.length < 2 || !options.includes(question.answer)) {
        return null;
      }

      return {
        prompt: question.prompt,
        options,
        answer: question.answer,
        explanation: typeof question.explanation === "string" ? question.explanation : undefined,
      };
    })
    .filter((question): question is {
      prompt: string;
      options: string[];
      answer: string;
      explanation: string | undefined;
    } => question !== null);

  if (questions.length === 0) {
    return { content, lessonType: "lesson" };
  }

  const passThreshold =
    typeof data.passThreshold === "number" &&
    Number.isFinite(data.passThreshold) &&
    data.passThreshold >= 1 &&
    data.passThreshold <= 100
      ? Math.round(data.passThreshold)
      : undefined;

  const maxAttempts =
    typeof data.maxAttempts === "number" &&
    Number.isFinite(data.maxAttempts) &&
    data.maxAttempts >= 1 &&
    data.maxAttempts <= 10
      ? Math.round(data.maxAttempts)
      : undefined;

  const resetScopeOnFail = data.resetScopeOnFail === "course" ? "course" : data.resetScopeOnFail === "module" ? "module" : undefined;

  return {
    content,
    lessonType: "quiz",
    quiz: {
      passThreshold,
      maxAttempts,
      resetScopeOnFail,
      questions,
    },
  };
}

async function readManifest(courseDirPath: string): Promise<CourseManifest | null> {
  const manifestPath = path.join(courseDirPath, "course.json");
  try {
    const raw = await fs.readFile(manifestPath, "utf-8");
    return JSON.parse(raw) as CourseManifest;
  } catch {
    return null;
  }
}

function pickString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function toCourseMetadata(manifest: CourseManifest | null): CourseMetadata {
  if (!manifest) {
    return {};
  }

  return {
    courseId: pickString(manifest.courseId),
    title: pickString(manifest.title),
    subtitle: pickString(manifest.subtitle),
    audience: pickString(manifest.audience),
    introFile: pickString(manifest.introFile),
    tags: normalizeTags(manifest.tags),
  };
}

function compareByNumberThenName(a: string, b: string): number {
  const aMatch = a.match(/^(\d+)/);
  const bMatch = b.match(/^(\d+)/);

  const aNum = aMatch ? Number.parseInt(aMatch[1], 10) : Number.NaN;
  const bNum = bMatch ? Number.parseInt(bMatch[1], 10) : Number.NaN;

  const hasANum = Number.isFinite(aNum);
  const hasBNum = Number.isFinite(bNum);

  if (hasANum && hasBNum && aNum !== bNum) {
    return aNum - bNum;
  }

  if (hasANum && !hasBNum) {
    return -1;
  }

  if (!hasANum && hasBNum) {
    return 1;
  }

  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function deriveModuleTitle(moduleId: string, firstLessonTitle?: string): string {
  if (firstLessonTitle) {
    const match = firstLessonTitle.match(/^Module\s+\d+\s+Overview\s*[:\-]\s*(.+)$/i);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return `Module ${moduleId}`;
}

function deriveLessonId(moduleId: string, fileName: string): string {
  const base = fileName.replace(/\.md$/i, "");
  return `${moduleId}-${base}`;
}

function deriveLessonTitle(fileName: string): string {
  const base = fileName.replace(/\.md$/i, "").replace(/^\d+-/, "").replace(/-/g, " ");
  return prettifyTitle(base);
}

async function discoverModules(coursePath: string): Promise<Array<{
  id: string;
  lessonFiles: string[];
}>> {
  const modulesPath = path.join(coursePath, "modules");
  try {
    const moduleEntries = await fs.readdir(modulesPath, { withFileTypes: true });

    const moduleIds = moduleEntries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort(compareByNumberThenName);

    const modules: Array<{ id: string; lessonFiles: string[] }> = [];

    for (const moduleId of moduleIds) {
      const moduleDir = path.join(modulesPath, moduleId);
      const lessonEntries = await fs.readdir(moduleDir, { withFileTypes: true });
      const lessonFiles = lessonEntries
        .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md"))
        .map((entry) => entry.name)
        .sort(compareByNumberThenName);

      modules.push({ id: moduleId, lessonFiles });
    }

    return modules;
  } catch {
    return [];
  }
}

async function countDiscoveredLessons(coursePath: string, introFile: string): Promise<number> {
  const introExists = await fs
    .access(path.join(coursePath, introFile))
    .then(() => 1)
    .catch(() => 0);
  const modules = await discoverModules(coursePath);
  const moduleLessons = modules.reduce((sum, module) => sum + module.lessonFiles.length, 0);
  return introExists + moduleLessons;
}

async function readMarkdown(filePath: string): Promise<string> {
  return fs.readFile(filePath, "utf-8");
}

async function readMarkdownOptional(filePath: string): Promise<string | null> {
  try {
    return await readMarkdown(filePath);
  } catch {
    return null;
  }
}

function toIntroFrontmatterMetadata(introRaw: string | null): CourseMetadata {
  if (!introRaw) {
    return {};
  }

  const parsed = parseMarkdownWithFrontmatter(introRaw);
  const data = parsed.data as Record<string, unknown>;

  return {
    courseId: pickString(data.courseId),
    title: pickString(data.title),
    subtitle: pickString(data.subtitle),
    audience: pickString(data.audience),
    tags: normalizeTags(data.tags),
  };
}

// Overlay `override` onto `base`, but only for keys whose value is defined.
// A plain `{ ...base, ...override }` would let an absent intro-frontmatter field
// (which arrives as `undefined`) wipe out a value supplied by the manifest.
export function mergeCourseMetadata(base: CourseMetadata, override: CourseMetadata): CourseMetadata {
  const merged: CourseMetadata = { ...base };

  for (const key of Object.keys(override) as Array<keyof CourseMetadata>) {
    const value = override[key];
    if (value !== undefined) {
      (merged as Record<string, unknown>)[key] = value;
    }
  }

  return merged;
}

let listCoursesCache: CourseSummary[] | null = null;

export async function listCourses(): Promise<CourseSummary[]> {
  if (isProd && listCoursesCache) return listCoursesCache;
  const entries = await fs.readdir(COURSES_ROOT, { withFileTypes: true });

  const summaries: CourseSummary[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const coursePath = path.join(COURSES_ROOT, entry.name);
    const manifestMetadata = toCourseMetadata(await readManifest(coursePath));
    const introFile = manifestMetadata.introFile ?? "1-intro.md";
    const introRaw = await readMarkdownOptional(path.join(coursePath, introFile));
    const introMetadata = toIntroFrontmatterMetadata(introRaw);
    const metadata = mergeCourseMetadata(manifestMetadata, introMetadata);
    const totalLessons = await countDiscoveredLessons(coursePath, introFile);
    const tags = introMetadata.tags?.length ? introMetadata.tags : manifestMetadata.tags ?? [];
    const stats = await fs.stat(coursePath);
    const createdAt = stats.birthtimeMs;

    summaries.push({
      id: metadata.courseId ?? slugify(entry.name),
      title: metadata.title ?? prettifyTitle(entry.name),
      subtitle: metadata.subtitle,
      audience: metadata.audience,
      totalLessons,
      tags,
      createdAt,
    });
  }

  if (isProd) listCoursesCache = summaries;
  return summaries;
}

const courseByIdCache = new Map<string, CourseData | null>();

export async function getCourseById(courseId: string): Promise<CourseData | null> {
  if (isProd && courseByIdCache.has(courseId)) return courseByIdCache.get(courseId)!;
  const entries = await fs.readdir(COURSES_ROOT, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const coursePath = path.join(COURSES_ROOT, entry.name);
    const manifestMetadata = toCourseMetadata(await readManifest(coursePath));
    const introFile = manifestMetadata.introFile ?? "1-intro.md";
    const introRaw = await readMarkdownOptional(path.join(coursePath, introFile));
    const introMetadata = toIntroFrontmatterMetadata(introRaw);
    const metadata = mergeCourseMetadata(manifestMetadata, introMetadata);

    const resolvedId = metadata.courseId ?? slugify(entry.name);
    if (resolvedId !== courseId) continue;

    const introLesson: CourseLesson = introRaw
      ? (() => {
          const introParsed = parseLessonMarkdown(introRaw);
          const introContent = introParsed.content;
          return {
            id: "intro",
            title: extractLeadingHeadingTitle(introContent) ?? "Course Introduction",
            moduleId: "intro",
            moduleTitle: "Getting Started",
            content: introContent,
            lessonType: introParsed.lessonType,
            quiz: introParsed.quiz,
          };
        })()
      : {
          id: "intro",
          title: "Course Introduction",
          moduleId: "intro",
          moduleTitle: "Getting Started",
          content: "# Course Introduction\n\nStart by adding an intro file (`1-intro.md`) and lessons under `modules/<module>/`.\n",
          lessonType: "lesson",
        };

    const lessons: CourseLesson[] = [introLesson];
    const discoveredModules = await discoverModules(coursePath);

    const modules = await Promise.all(
      discoveredModules.map(async (module) => {
        const discoveredLessons = await Promise.all(
          module.lessonFiles.map(async (lessonFile) => {
            const lessonPath = path.join(coursePath, "modules", module.id, lessonFile);
            const rawContent = await readMarkdown(lessonPath);
            const parsedLesson = parseLessonMarkdown(rawContent);
            const content = parsedLesson.content;
            const headingTitle = extractLeadingHeadingTitle(content);
            const lessonId = deriveLessonId(module.id, lessonFile);
            const lessonTitle = headingTitle ?? deriveLessonTitle(lessonFile);
            return {
              id: lessonId,
              title: lessonTitle,
              moduleId: module.id,
              content,
              lessonType: parsedLesson.lessonType,
              quiz: parsedLesson.quiz,
            };
          }),
        );

        const moduleTitle = deriveModuleTitle(module.id, discoveredLessons[0]?.title);
        const hydratedLessons: CourseLesson[] = discoveredLessons.map((lesson) => ({
          ...lesson,
          moduleTitle,
        }));
        lessons.push(...hydratedLessons);

        const moduleLessons = hydratedLessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          moduleId: lesson.moduleId,
          moduleTitle: lesson.moduleTitle,
        }));

        return {
          id: module.id,
          title: moduleTitle,
          lessons: moduleLessons,
        };
      }),
    );

    const totalLessons = lessons.length;

    const result: CourseData = {
      id: resolvedId,
      title: metadata.title ?? prettifyTitle(entry.name),
      subtitle: metadata.subtitle,
      audience: metadata.audience,
      totalLessons,
      intro: introLesson,
      modules,
      lessons,
    };
    if (isProd) courseByIdCache.set(courseId, result);
    return result;
  }

  if (isProd) courseByIdCache.set(courseId, null);
  return null;
}
