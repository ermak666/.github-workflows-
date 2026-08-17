import { describe, expect, it } from "vitest";

import { cheatItems } from "../shared/cheat-sheets";
import { practiceChallenges } from "../shared/practice-challenges";
import { runLearningPython } from "../lib/learning-python";

describe("полнота учебного контура", () => {
  it("содержит широкую шпаргалку по ключевым темам", () => {
    expect(cheatItems.length).toBeGreaterThanOrEqual(80);
    expect(new Set(cheatItems.map((item) => item.group)).size).toBeGreaterThanOrEqual(15);
  });

  it("содержит минимум 100 задач на каждый том и несколько форматов практики", () => {
    expect(practiceChallenges.length).toBeGreaterThanOrEqual(400);
    for (const volume of ["junior", "middle", "senior", "web"] as const) {
      const tasks = practiceChallenges.filter((item) => item.volume === volume);
      expect(tasks.length).toBeGreaterThanOrEqual(100);
      expect(new Set(tasks.map((item) => item.format ?? "Базовая задача")).size).toBeGreaterThanOrEqual(4);
    }
  });
});

describe("учебный запуск Python", () => {
  it("показывает результат print и f-строки", () => {
    const result = runLearningPython('name = "Аня"\nprint(f"Привет, {name}!")');
    expect(result.error).toBeUndefined();
    expect(result.output).toEqual(["Привет, Аня!"]);
  });

  it("обрабатывает input, условие и увеличение счётчика", () => {
    const result = runLearningPython('score = 0\nanswer = input("2 + 2")\nif answer == "4":\n    score += 1\nprint(f"Очки: {score}")', "4");
    expect(result.output).toEqual(["Очки: 1"]);
  });

  it("записывает и читает настоящий кэш по строковому ключу", () => {
    const result = runLearningPython('cache = {}\nurl = "https://example.com"\ncache[url] = "сохранённый ответ"\nprint(cache[url])');
    expect(result.error).toBeUndefined();
    expect(result.output).toEqual(["сохранённый ответ"]);
    expect(result.variables.cache).toMatchObject({ "https://example.com": "сохранённый ответ" });
  });

  it("поддерживает списки, append и проверку значения через in", () => {
    const result = runLearningPython('items = []\nitems.append("готово")\nif "готово" in items:\n    print("Список работает")');
    expect(result.error).toBeUndefined();
    expect(result.output).toEqual(["Список работает"]);
    expect(result.variables.items).toEqual(["готово"]);
  });

  it("не выполняет опасные операции", () => {
    expect(runLearningPython('import os\nprint(os.listdir())').error).toContain("безопасные основы");
  });
});
