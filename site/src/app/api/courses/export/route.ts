import JSZip from "jszip";
import { buildCourseScaffold, scaffoldInputFromForm } from "@/lib/course-scaffold";

export async function POST(request: Request) {
  try {
    const scaffold = buildCourseScaffold(scaffoldInputFromForm(await request.formData()));
    const zip = new JSZip();
    for (const file of scaffold.files) zip.file(`${scaffold.folderName}/${file.path}`, file.content);
    const archive = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
    return new Response(Buffer.from(archive), { headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="${scaffold.courseId}.zip"`, "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to create course archive." }, { status: 400 });
  }
}
