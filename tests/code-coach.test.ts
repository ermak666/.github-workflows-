import { describe, expect, it } from "vitest";

import { fallbackCodeFeedback, normalizeCoachFeedback } from "../shared/code-coach";

describe("безопасный ИИ-помощник", () => {
  it("не принимает в разбор код с похожим на секрет значением", () => {
    const result = fallbackCodeFeedback('api_key = "real-secret"');
    expect(result.status).toBe("caution");
    expect(result.headline).toContain("секрет");
  });

  it("объясняет базовую ошибку с двоеточием простыми словами", () => {
    const result = fallbackCodeFeedback("if age > 10\n    print(age)");
    expect(result.status).toBe("needs_fix");
    expect(result.hint).toContain("if");
  });

  it("ограничивает непроверенные поля внешнего ответа", () => {
    const backup = fallbackCodeFeedback("print(2 + 2)");
    const result = normalizeCoachFeedback({ status: "looks_good", headline: "Всё хорошо", issues: ["короткая заметка"], hint: "Проверьте вывод", nextStep: "Решите следующую задачу" }, backup);
    expect(result).toEqual({ status: "looks_good", headline: "Всё хорошо", issues: ["короткая заметка"], hint: "Проверьте вывод", nextStep: "Решите следующую задачу" });
  });
});
