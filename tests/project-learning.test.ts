import { describe, expect, it } from "vitest";

import { summarizeCsv } from "../shared/csv-utils";
import { apiProjectTemplates, projectTracks, reviewChecklist, skillDomains } from "../shared/project-learning-data";

describe("проектный учебный контур", () => {
  it("содержит четыре проектных направления и обязательный чек-лист качества", () => {
    expect(projectTracks.map((track) => track.id)).toEqual(["bot", "data", "api", "automation"]);
    expect(reviewChecklist.length).toBeGreaterThanOrEqual(5);
    expect(skillDomains).toEqual(["Python", "Git", "SQL", "Тесты", "API", "Docker"]);
  });

  it("содержит учебные шаблоны для API-проектов", () => {
    expect(apiProjectTemplates).toHaveLength(3);
    expect(apiProjectTemplates.map((template) => template.title)).toContain("FastAPI: один маршрут");
  });

  it("безопасно считает числовые показатели в небольшой CSV-таблице", () => {
    const summary = summarizeCsv("day,revenue\nMonday,240\nTuesday,330\nWednesday,180");
    expect(summary.rowCount).toBe(3);
    expect(summary.headers).toEqual(["day", "revenue"]);
    expect(summary.numeric).toEqual([{ column: "revenue", count: 3, sum: 750, mean: 250 }]);
  });
});
