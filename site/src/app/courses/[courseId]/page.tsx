import { notFound } from "next/navigation";

import CoursePlayer from "@/components/CoursePlayer";
import { getCourseById } from "@/lib/courses";

type PageProps = {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ lesson?: string }>;
};

export default async function CoursePage({ params, searchParams }: PageProps) {
  const { courseId } = await params;
  const { lesson } = await searchParams;

  const course = await getCourseById(courseId);
  if (!course) {
    notFound();
  }

  const selectedLessonId = lesson && course.lessons.some((item) => item.id === lesson)
    ? lesson
    : "intro";

  return (
    <CoursePlayer
      key={course.id}
      courseId={course.id}
      title={course.title}
      subtitle={course.subtitle}
      audience={course.audience}
      totalLessons={course.totalLessons}
      selectedLessonId={selectedLessonId}
      modules={course.modules}
      lessons={course.lessons}
    />
  );
}
