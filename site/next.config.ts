import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // The app reads course content from a sibling "Courses" directory outside
  // this Next.js project (see src/lib/course-paths.ts). Next's file tracer
  // can't follow that dynamic fs path on its own, so on Vercel the content
  // would silently be excluded from the deployed function. Force it in.
  outputFileTracingRoot: path.join(__dirname, ".."),
  outputFileTracingIncludes: {
    "/": ["../Courses/**/*"],
    "/courses": ["../Courses/**/*"],
    "/courses/[courseId]": ["../Courses/**/*"],
    "/courses/[courseId]/assets/[...path]": ["../Courses/**/*"],
    "/courses/new": ["../Courses/**/*"],
  },
};

export default nextConfig;
