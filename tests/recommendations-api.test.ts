import { describe, expect, it } from "vitest";

import { validatePublicEndpoint } from "../shared/api-tester";
import { volumes } from "../shared/course-data";
import { buildLessonRecommendations } from "../shared/recommendations";

describe("рекомендации уроков и API-тестер", () => {
  it("возвращает точный урок после неверного быстрого теста", () => {
    const lesson = volumes[0].lessons[0];
    const recommendations = buildLessonRecommendations({ practiceSuccessIds: [], activeDays: [], completedLessonDates: {}, practiceSuccessDates: {}, quizResults: { [lesson.id]: false } }, [], []);
    expect(recommendations[0]).toMatchObject({ lessonId: lesson.id, title: lesson.title });
  });

  it("рекомендует урок тома по карточке ошибки", () => {
    const volume = volumes[0];
    const recommendations = buildLessonRecommendations({ practiceSuccessIds: [], activeDays: [], completedLessonDates: {}, practiceSuccessDates: {}, quizResults: {} }, [{ id: "error", tag: volume.id, title: "Моя ошибка", reason: "Причина", correction: "Исправление", createdAt: "2026-01-01" }], []);
    expect(recommendations[0].lessonId).toBe(volume.lessons[0].id);
  });

  it("разрешает только безопасные публичные HTTPS-адреса", () => {
    expect(validatePublicEndpoint("https://example.com/api", "GET", "")).toBeNull();
    expect(validatePublicEndpoint("http://example.com", "GET", "")).toContain("https");
    expect(validatePublicEndpoint("https://localhost:3000", "GET", "")).toContain("Локальные");
    expect(validatePublicEndpoint("https://user:pass@example.com", "GET", "")).toContain("логин");
  });
});
