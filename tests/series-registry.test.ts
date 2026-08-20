import { describe, expect, it } from "vitest";

import { seriesCourses } from "../series-core/app-registry";
import { courseQualityContract, validateSeriesCourse } from "../series-core/course-contract";
import { courseManifests } from "../series-core/course-manifest";

describe("реестр серии «Разработка без страха»", () => {
  it("содержит отдельные приложения для всех согласованных направлений", () => {
    expect(seriesCourses).toHaveLength(18);
    expect(seriesCourses.map((course) => course.id)).toContain("game-modding");
    expect(seriesCourses.map((course) => course.id)).toContain("react");
    expect(seriesCourses.map((course) => course.id)).toContain("angular");
  });

  it("сохраняет единый учебный контракт для каждого приложения", () => {
    for (const course of seriesCourses) {
      expect(course.volumes).toHaveLength(courseQualityContract.minimumVolumes);
      expect(course.volumes.map((volume) => volume.stage)).toEqual(courseQualityContract.requiredStages);
      expect(course.darkOnly).toBe(true);
      expect(validateSeriesCourse(course)).toEqual([]);
    }
  });

  it("создаёт отдельный тёмный манифест с одинаковыми учебными модулями для каждого приложения", () => {
    expect(courseManifests).toHaveLength(seriesCourses.length);
    for (const manifest of courseManifests) {
      expect(manifest.theme).toBe("dark");
      expect(manifest.learningLevels.map((level) => level.stage)).toEqual(courseQualityContract.requiredStages);
      expect(manifest.requiredModules).toContain("итоговые тесты");
      expect(manifest.requiredModules).toContain("проекты");
      expect(manifest.requiredModules).toContain("аудио");
      expect(manifest.requiredModules).toContain("еженедельный блиц");
    }
  });
});
