import AsyncStorage from "@react-native-async-storage/async-storage";

import { getLesson } from "../shared/course-data";
import { getLessonQuiz, type QuizQuestion } from "../shared/lesson-quiz";

const REVIEW_KEY = "python-bez-straha.knowledge-review.v1";
const TWO_DAYS_MS = 48 * 60 * 60 * 1000;

export type ReviewMode = "recovery" | "weekly";
export type ReviewQuestion = QuizQuestion & { sourceLessonId: string; sourceLessonTitle: string };
export type KnowledgeReviewState = { lastOpenedAt?: string; recoveryPassedAt?: string; weeklyPromptWeek?: string; weeklyCompletedWeek?: string };

const defaultState: KnowledgeReviewState = {};

export const weekKey = (date = new Date()) => {
  const cursor = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = cursor.getUTCDay() || 7;
  cursor.setUTCDate(cursor.getUTCDate() - day + 1);
  return cursor.toISOString().slice(0, 10);
};

export const shouldRequireRecovery = (lastOpenedAt: string | undefined, recoveryPassedAt: string | undefined, completedCount: number, now = new Date()) => {
  if (!lastOpenedAt || completedCount === 0) return false;
  const lastOpen = new Date(lastOpenedAt).getTime();
  if (!Number.isFinite(lastOpen) || now.getTime() - lastOpen < TWO_DAYS_MS) return false;
  const recoveryPassed = recoveryPassedAt ? new Date(recoveryPassedAt).getTime() : 0;
  return !Number.isFinite(recoveryPassed) || recoveryPassed < lastOpen;
};

export const requiredCorrectAnswers = (questionCount: number) => Math.ceil(questionCount * 0.9);

export const buildReviewQuestions = (completedLessonIds: string[], count = 20): ReviewQuestion[] => {
  const source = completedLessonIds
    .map((id) => getLesson(id))
    .filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson))
    .map((lesson) => {
      const quiz = getLessonQuiz(lesson);
      return { ...quiz, id: `review-${lesson.id}-${quiz.id}`, sourceLessonId: lesson.id, sourceLessonTitle: lesson.title, question: `${quiz.question} — повторение: «${lesson.title}»` };
    });
  if (!source.length) return [];
  const questions: ReviewQuestion[] = [];
  for (let index = 0; index < count; index += 1) {
    const item = source[index % source.length];
    questions.push({ ...item, id: `${item.id}-${index + 1}` });
  }
  return questions;
};

export async function loadKnowledgeReviewState(): Promise<KnowledgeReviewState> {
  const raw = await AsyncStorage.getItem(REVIEW_KEY);
  if (!raw) return defaultState;
  try {
    const parsed = JSON.parse(raw) as KnowledgeReviewState;
    return {
      lastOpenedAt: typeof parsed.lastOpenedAt === "string" ? parsed.lastOpenedAt : undefined,
      recoveryPassedAt: typeof parsed.recoveryPassedAt === "string" ? parsed.recoveryPassedAt : undefined,
      weeklyPromptWeek: typeof parsed.weeklyPromptWeek === "string" ? parsed.weeklyPromptWeek : undefined,
      weeklyCompletedWeek: typeof parsed.weeklyCompletedWeek === "string" ? parsed.weeklyCompletedWeek : undefined,
    };
  } catch {
    return defaultState;
  }
}

async function saveState(state: KnowledgeReviewState) {
  await AsyncStorage.setItem(REVIEW_KEY, JSON.stringify(state));
}

export async function inspectKnowledgeReview(completedLessonIds: string[], now = new Date()) {
  const state = await loadKnowledgeReviewState();
  const recoveryRequired = shouldRequireRecovery(state.lastOpenedAt, state.recoveryPassedAt, completedLessonIds.length, now);
  const currentWeek = weekKey(now);
  const weeklyPromptRequired = completedLessonIds.length > 0 && !recoveryRequired && state.weeklyPromptWeek !== currentWeek;
  await saveState({ ...state, lastOpenedAt: now.toISOString() });
  return { recoveryRequired, weeklyPromptRequired };
}

export async function markRecoveryPassed(now = new Date()) {
  const state = await loadKnowledgeReviewState();
  await saveState({ ...state, recoveryPassedAt: now.toISOString(), lastOpenedAt: now.toISOString() });
}

export async function markWeeklyPromptSeen(now = new Date()) {
  const state = await loadKnowledgeReviewState();
  await saveState({ ...state, weeklyPromptWeek: weekKey(now) });
}

export async function markWeeklyCompleted(now = new Date()) {
  const state = await loadKnowledgeReviewState();
  await saveState({ ...state, weeklyPromptWeek: weekKey(now), weeklyCompletedWeek: weekKey(now) });
}
