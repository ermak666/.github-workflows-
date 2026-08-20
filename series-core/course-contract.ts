export type CourseVolume = {
  id: string;
  stage: "junior" | "middle" | "senior" | "applied";
  title: string;
  outcome: string;
  lessonTarget: number;
  challengeTarget: number;
};

export type SeriesCourse = {
  id: string;
  title: string;
  track: "foundation" | "web" | "backend" | "devops" | "mobile" | "game" | "systems";
  prerequisites: string[];
  volumes: CourseVolume[];
  safePractice: string;
  capstone: string;
  darkOnly: true;
};

export const courseQualityContract = {
  minimumVolumes: 4,
  requiredStages: ["junior", "middle", "senior", "applied"] as const,
  minimumLessons: 24,
  minimumChallengesPerVolume: 100,
  requiredLessonParts: ["цель", "аналогия", "два примера", "задача 1", "задача 2", "задача 3", "подсказка", "разбор"] as const,
  requiredFeatures: ["офлайн-прогресс", "повторение после паузы", "еженедельный блиц", "шпаргалка", "итоговый тест", "задачи с подсказками", "мини-проекты", "аудио", "тёмная тема", "масштаб текста", "снижение движения"] as const,
} as const;

export function validateSeriesCourse(course: SeriesCourse) {
  const errors: string[] = [];
  if (course.darkOnly !== true) errors.push("Курс серии должен использовать только тёмную тему.");
  if (course.volumes.length < courseQualityContract.minimumVolumes) errors.push("Нужно не менее четырёх томов.");
  if (course.volumes.map((volume) => volume.stage).join(",") !== courseQualityContract.requiredStages.join(",")) errors.push("Тома должны идти как Junior, Middle, Senior и прикладной финальный уровень.");
  if (course.volumes.reduce((sum, volume) => sum + volume.lessonTarget, 0) < courseQualityContract.minimumLessons) errors.push("Нужно не менее 24 уроков.");
  if (course.volumes.some((volume) => volume.challengeTarget < courseQualityContract.minimumChallengesPerVolume)) errors.push("В каждом томе нужно не менее 100 задач.");
  if (!course.safePractice.trim()) errors.push("Нужно описать безопасный формат практики.");
  if (!course.capstone.trim()) errors.push("Нужно описать итоговый проект.");
  return errors;
}
