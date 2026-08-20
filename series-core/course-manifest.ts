import { seriesCourses } from "./app-registry";
import type { SeriesCourse } from "./course-contract";

export type CourseManifest = {
  appId: string;
  appName: string;
  theme: "dark";
  navigation: ["Главная", "Учебник", "Тренажёр", "Шпаргалка", "Прогресс"];
  learningLevels: SeriesCourse["volumes"];
  requiredModules: ["уроки", "задачи", "шпаргалки", "итоговые тесты", "повторение", "еженедельный блиц", "проекты", "аудио", "доступность"];
  practiceMode: string;
  capstone: string;
};

export function createCourseManifest(course: SeriesCourse): CourseManifest {
  return {
    appId: course.id,
    appName: course.title,
    theme: "dark",
    navigation: ["Главная", "Учебник", "Тренажёр", "Шпаргалка", "Прогресс"],
    learningLevels: course.volumes,
    requiredModules: ["уроки", "задачи", "шпаргалки", "итоговые тесты", "повторение", "еженедельный блиц", "проекты", "аудио", "доступность"],
    practiceMode: course.safePractice,
    capstone: course.capstone,
  };
}

export const courseManifests = seriesCourses.map(createCourseManifest);
