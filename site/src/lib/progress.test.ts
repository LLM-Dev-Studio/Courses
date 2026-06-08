import {
  clearCourseOutcome,
  getQuizAnswersKey,
  parseProgressSnapshot,
  readCourseOutcome,
  readQuizScore,
  saveCourseOutcome,
  saveProgress,
  readProgress,
} from "@/lib/progress";

describe("progress helpers", () => {
  const courseId = "unit-test-course";

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("parses valid progress snapshots", () => {
    const parsed = parseProgressSnapshot('{"completedLessonIds":["intro"],"lastLessonId":"intro"}');
    expect(parsed.completedLessonIds).toEqual(["intro"]);
    expect(parsed.lastLessonId).toBe("intro");
  });

  it("returns safe defaults for malformed snapshots", () => {
    const parsed = parseProgressSnapshot("not-json");
    expect(parsed.completedLessonIds).toEqual([]);
    expect(parsed.lastLessonId).toBeUndefined();
  });

  it("persists and reads progress from localStorage", () => {
    saveProgress(courseId, {
      completedLessonIds: ["intro", "01-1", "01-1"],
      lastLessonId: "01-1",
    });

    const progress = readProgress(courseId);
    expect(progress.completedLessonIds).toEqual(["intro", "01-1"]);
    expect(progress.lastLessonId).toBe("01-1");
  });

  describe("readQuizScore", () => {
    it("returns null when no quiz data is stored", () => {
      expect(readQuizScore(courseId, "01-quiz", 4)).toBeNull();
    });

    it("returns null when questionCount is zero", () => {
      window.localStorage.setItem(
        getQuizAnswersKey(courseId, "01-quiz"),
        JSON.stringify({ answeredCorrectly: [true, false] }),
      );
      expect(readQuizScore(courseId, "01-quiz", 0)).toBeNull();
    });

    it("computes score from answeredCorrectly array", () => {
      window.localStorage.setItem(
        getQuizAnswersKey(courseId, "01-quiz"),
        JSON.stringify({ answeredCorrectly: [true, true, false, true] }),
      );
      expect(readQuizScore(courseId, "01-quiz", 4)).toBe(75);
    });

    it("returns passThreshold when thresholdPassed is true and answeredCorrectly yields 0", () => {
      window.localStorage.setItem(
        getQuizAnswersKey(courseId, "01-quiz"),
        JSON.stringify({ answeredCorrectly: [false, false], thresholdPassed: true }),
      );
      expect(readQuizScore(courseId, "01-quiz", 2, 80)).toBe(80);
    });

    it("returns 0 when thresholdPassed is true but no passThreshold is provided", () => {
      window.localStorage.setItem(
        getQuizAnswersKey(courseId, "01-quiz"),
        JSON.stringify({ answeredCorrectly: [false, false], thresholdPassed: true }),
      );
      expect(readQuizScore(courseId, "01-quiz", 2)).toBe(0);
    });

    it("returns null for malformed JSON", () => {
      window.localStorage.setItem(getQuizAnswersKey(courseId, "01-quiz"), "not-json");
      expect(readQuizScore(courseId, "01-quiz", 4)).toBeNull();
    });

    it("clamps score to 0–100", () => {
      window.localStorage.setItem(
        getQuizAnswersKey(courseId, "01-quiz"),
        JSON.stringify({ answeredCorrectly: [true, true, true, true, true] }),
      );
      expect(readQuizScore(courseId, "01-quiz", 4)).toBe(100);
    });
  });

  it("persists and clears course outcomes", () => {
    saveCourseOutcome(courseId, {
      closedAt: new Date().toISOString(),
      scorePercent: 100,
      rewardTier: "platinum",
      completedLessons: 5,
      totalLessons: 5,
    });

    const outcome = readCourseOutcome(courseId);
    expect(outcome?.scorePercent).toBe(100);
    expect(outcome?.rewardTier).toBe("platinum");

    clearCourseOutcome(courseId);
    expect(readCourseOutcome(courseId)).toBeNull();
  });
});
