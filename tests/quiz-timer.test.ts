import { describe, expect, it } from "vitest";

import { formatElapsedTime } from "../lib/quiz-timer";

describe("таймер итогового теста", () => {
  it("показывает затраченное время в формате минут и секунд", () => {
    expect(formatElapsedTime(0)).toBe("00:00");
    expect(formatElapsedTime(9)).toBe("00:09");
    expect(formatElapsedTime(65)).toBe("01:05");
    expect(formatElapsedTime(3601)).toBe("60:01");
  });
});
