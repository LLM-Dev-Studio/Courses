export interface CourseFilterCriteria {
  query: string;
  selectedTags: string[];
}

export function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const entry of value) {
    if (typeof entry !== "string") {
      continue;
    }
    const trimmed = entry.trim();
    if (!trimmed) {
      continue;
    }
    const key = trimmed.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

export function filterCourses<T extends { title: string; subtitle?: string; tags?: string[] }>(
  courses: T[],
  criteria: CourseFilterCriteria,
): T[] {
  const query = criteria.query.trim().toLowerCase();
  const selectedTags = criteria.selectedTags.map((tag) => tag.toLowerCase());

  return courses.filter((course) => {
    const tags = course.tags ?? [];

    const matchesQuery =
      query.length === 0 ||
      `${course.title} ${course.subtitle ?? ""} ${tags.join(" ")}`.toLowerCase().includes(query);

    const matchesTags =
      selectedTags.length === 0 ||
      tags.some((tag) => selectedTags.includes(tag.toLowerCase()));

    return matchesQuery && matchesTags;
  });
}

export function sortByTitleAsc<T extends { title: string }>(courses: T[]): T[] {
  return [...courses].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: "base" }),
  );
}

export function sortByCreatedDesc<T extends { createdAt: number }>(courses: T[]): T[] {
  return [...courses].sort((a, b) => b.createdAt - a.createdAt);
}
