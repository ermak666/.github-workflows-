import { describe, expect, it } from "vitest";

import { defaultToolkit } from "../lib/study-toolkit";
import { clubChallenges, codeAssembly, codeExplanation, commonErrors, dailyChallenges, glossary, knowledgeMap, miniProjects, versionGuide } from "../shared/study-lab-data";

describe("полный набор учебных улучшений", () => {
  it("содержит ежедневные задания, новые форматы практики и проекты для всех направлений", () => {
    expect(dailyChallenges).toHaveLength(7);
    expect(codeAssembly.lines).toHaveLength(2);
    expect(codeExplanation.options).toHaveLength(3);
    expect(miniProjects.map((project) => project.level)).toEqual(["Junior", "Middle", "Senior", "Веб и боты"]);
  });

  it("содержит карту знаний и справочные материалы", () => {
    expect(knowledgeMap).toHaveLength(4);
    expect(glossary.length).toBeGreaterThanOrEqual(5);
    expect(commonErrors.length).toBeGreaterThanOrEqual(5);
    expect(versionGuide.length).toBeGreaterThanOrEqual(3);
    expect(clubChallenges.length).toBeGreaterThanOrEqual(4);
  });

  it("создаёт безопасную локальную модель заметок, целей и заявок наставнику", () => {
    expect(defaultToolkit.flexibleGoal).toEqual({ lessons: 3, tasks: 5, minutes: 60, projects: 1 });
    expect(defaultToolkit.notes).toEqual({});
    expect(defaultToolkit.mentorRequests).toEqual([]);
  });
});
