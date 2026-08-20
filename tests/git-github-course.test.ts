import { describe, expect, it } from "vitest";

import { gitGithubCourse, gitGithubLessonCount } from "../series-content/git-github/course";

describe("курс «Git и GitHub без страха»", () => {
  it("проходит уровни Junior, Middle, Senior и проектный том", () => {
    expect(gitGithubCourse.map((volume) => volume.id)).toEqual(["junior", "middle", "senior", "applied"]);
    expect(gitGithubLessonCount).toBeGreaterThanOrEqual(24);
  });

  it("даёт к каждому уроку простую аналогию, команду и три разбираемые задачи", () => {
    for (const lesson of gitGithubCourse.flatMap((volume) => volume.lessons)) {
      expect(lesson.analogy.length).toBeGreaterThan(20);
      expect(lesson.command.trim().length).toBeGreaterThan(3);
      expect(lesson.tasks).toHaveLength(3);
      expect(lesson.tasks.every((task) => task.hint.length > 10 && task.solution.length > 20)).toBe(true);
    }
  });
});
