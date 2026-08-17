import type { ActivityProgress } from "../lib/course-progress";
import type { ErrorCard } from "../lib/project-learning";
import { getLesson, volumes } from "./course-data";

export type LessonRecommendation = { lessonId: string; title: string; reason: string };

export function buildLessonRecommendations(activity: ActivityProgress, errorCards: ErrorCard[], completedLessonIds: string[]): LessonRecommendation[] {
  const results: LessonRecommendation[] = [];
  const add = (lessonId: string | undefined, reason: string) => { const lesson = getLesson(lessonId); if (!lesson || results.some((item) => item.lessonId === lesson.id)) return; results.push({ lessonId: lesson.id, title: lesson.title, reason }); };
  Object.entries(activity.quizResults).filter(([, correct]) => !correct).forEach(([lessonId]) => add(lessonId, "В быстрой проверке здесь был неверный ответ."));
  errorCards.forEach((card) => { const volume = volumes.find((item) => item.id === card.tag); const lesson = volume?.lessons.find((item) => !completedLessonIds.includes(item.id)) ?? volume?.lessons[0]; add(lesson?.id, `Карточка ошибки «${card.title}» связана с этим уровнем практики.`); });
  if (!results.length) { const first = volumes.flatMap((volume) => volume.lessons).find((lesson) => !completedLessonIds.includes(lesson.id)); add(first?.id, "Следующий урок поможет сохранить спокойный ритм обучения."); }
  return results.slice(0, 5);
}
