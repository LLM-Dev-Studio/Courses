import { mergeCourseMetadata } from "@/lib/courses";

describe("mergeCourseMetadata", () => {
  it("keeps manifest values when the intro override is undefined", () => {
    const manifest = {
      title: "AI for Business",
      subtitle: "Practical AI",
      audience: "Staff",
    };
    const intro = {
      title: undefined,
      subtitle: undefined,
      audience: undefined,
    };

    expect(mergeCourseMetadata(manifest, intro)).toEqual(manifest);
  });

  it("lets defined intro values override the manifest", () => {
    const manifest = { title: "Folder Title", subtitle: "Manifest subtitle" };
    const intro = { title: "Intro Title" };

    expect(mergeCourseMetadata(manifest, intro)).toEqual({
      title: "Intro Title",
      subtitle: "Manifest subtitle",
    });
  });

  it("does not mutate either input", () => {
    const manifest = { title: "Base" };
    const intro = { title: "Override" };

    mergeCourseMetadata(manifest, intro);

    expect(manifest).toEqual({ title: "Base" });
    expect(intro).toEqual({ title: "Override" });
  });
});
