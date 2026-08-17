import { describe, expect, it } from "vitest";

import { defaultBookmarks } from "../lib/lesson-bookmarks";
import { buildWeekComparison } from "../lib/course-progress";

describe("закладки и недельная динамика", () => {
  it("создаёт понятные стартовые категории для сложных тем", () => {
    expect(defaultBookmarks.categories.map((item) => item.id)).toEqual(["hard", "repeat"]);
    expect(defaultBookmarks.bookmarks).toEqual([]);
  });

  it("отделяет текущую неделю от предыдущей при сравнении", () => {
    const comparison = buildWeekComparison({ practiceSuccessIds: ["task-current", "task-previous"], activeDays: [], completedLessonDates: { "lesson-current": "2026-08-17", "lesson-previous": "2026-08-10" }, practiceSuccessDates: { "task-current": "2026-08-16", "task-previous": "2026-08-09" }, quizResults: {} }, new Date("2026-08-17T12:00:00Z"));
    expect(comparison.current.lessons).toBe(1);
    expect(comparison.current.practice).toBe(1);
    expect(comparison.previous.lessons).toBe(1);
    expect(comparison.previous.practice).toBe(1);
    expect(comparison.totalDelta).toBe(0);
  });
});
