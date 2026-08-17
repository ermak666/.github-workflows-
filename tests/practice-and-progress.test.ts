import { describe, expect, it, vi } from "vitest";

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

import { calculateStreak } from "../lib/course-progress";
import { evaluatePractice, practiceChallenges } from "../shared/practice-challenges";

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
});
