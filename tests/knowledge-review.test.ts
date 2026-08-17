import { describe, expect, it } from "vitest";

import { volumes } from "../shared/course-data";
import { buildReviewQuestions, requiredCorrectAnswers, shouldRequireRecovery, weekKey } from "../lib/knowledge-review";

describe("повторение знаний после паузы", () => {
  const now = new Date("2026-08-17T12:00:00.000Z");

  it("требует обязательный тест после двух дней отсутствия при пройденных уроках", () => {
    expect(shouldRequireRecovery("2026-08-15T11:59:00.000Z", undefined, 3, now)).toBe(true);
    expect(shouldRequireRecovery("2026-08-15T12:01:00.000Z", undefined, 3, now)).toBe(false);
    expect(shouldRequireRecovery("2026-08-10T12:00:00.000Z", "2026-08-11T12:00:00.000Z", 3, now)).toBe(false);
    expect(shouldRequireRecovery("2026-08-10T12:00:00.000Z", undefined, 0, now)).toBe(false);
  });

  it("создаёт минимум двадцать вопросов только на основе пройденных уроков", () => {
    const completed = volumes.flatMap((volume) => volume.lessons).slice(0, 3).map((lesson) => lesson.id);
    const questions = buildReviewQuestions(completed, 20);
    expect(questions).toHaveLength(20);
    expect(questions.every((question) => completed.includes(question.sourceLessonId))).toBe(true);
  });

  it("оставляет максимум две ошибки в тесте из двадцати", () => {
    expect(requiredCorrectAnswers(20)).toBe(18);
    expect(weekKey(now)).toBe("2026-08-17");
  });
});
