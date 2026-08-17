import { describe, expect, it, vi } from "vitest";

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

import { buildWeeklyReport, calculateStreak } from "../lib/course-progress";
import { evaluatePractice, practiceChallenges, type PracticeVolume } from "../shared/practice-challenges";

describe("мини-тренажёр Python", () => {
  it("принимает корректное решение и даёт понятную обратную связь", () => {
    const challenge = practiceChallenges.find((item) => item.id === "function");
    expect(challenge).toBeDefined();
    const result = evaluatePractice(challenge!, "def double(number):\n    return number * 2");
    expect(result.correct).toBe(true);
    expect(result.message).toContain("Верно");
  });

  it("не принимает неполное решение и предлагает повторить попытку", () => {
    const challenge = practiceChallenges.find((item) => item.id === "condition");
    const result = evaluatePractice(challenge!, "score = 5");
    expect(result.correct).toBe(false);
    expect(result.message).toContain("Пока не совпало");
  });

  it("даёт не менее семи задач для каждого из четырёх томов", () => {
    const volumes: PracticeVolume[] = ["junior", "middle", "senior", "web"];
    for (const volume of volumes) {
      expect(practiceChallenges.filter((challenge) => challenge.volume === volume).length).toBeGreaterThanOrEqual(7);
    }
  });
});

describe("серия занятий", () => {
  it("считает подряд идущие активные дни от текущей даты", () => {
    const today = new Date("2026-08-17T12:00:00.000Z");
    expect(calculateStreak(["2026-08-15", "2026-08-16", "2026-08-17"], today)).toBe(3);
  });

  it("останавливает серию при пропущенном дне", () => {
    const today = new Date("2026-08-17T12:00:00.000Z");
    expect(calculateStreak(["2026-08-15", "2026-08-17"], today)).toBe(1);
  });

  it("суммирует уроки и задачи только за последние семь дней", () => {
    const report = buildWeeklyReport({
      practiceSuccessIds: ["hello", "json-save"],
      activeDays: ["2026-08-11", "2026-08-15", "2026-08-17"],
      completedLessonDates: { lesson1: "2026-08-11", lesson2: "2026-08-15", old: "2026-08-10" },
      practiceSuccessDates: { hello: "2026-08-15", "json-save": "2026-08-17" },
    }, new Date("2026-08-17T12:00:00.000Z"));
    expect(report.lessons).toBe(2);
    expect(report.practice).toBe(2);
    expect(report.activeDays).toBe(3);
    expect(report.days).toHaveLength(7);
  });
});
