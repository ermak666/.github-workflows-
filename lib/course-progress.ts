import AsyncStorage from "@react-native-async-storage/async-storage";

const PROGRESS_KEY = "python-bez-straha.completed-lessons.v1";
const ACTIVITY_KEY = "python-bez-straha.activity.v1";

export type ActivityProgress = {
  practiceSuccessIds: string[];
  activeDays: string[];
  completedLessonDates: Record<string, string>;
  practiceSuccessDates: Record<string, string>;
  quizResults: Record<string, boolean>;
  volumeFinals?: Record<string, boolean>;
  volumeFinalTestVersions?: Record<string, number>;
};

export const VOLUME_FINAL_TEST_VERSION = 2;

const todayKey = (date = new Date()) => date.toISOString().slice(0, 10);

const defaultActivity: ActivityProgress = { practiceSuccessIds: [], activeDays: [], completedLessonDates: {}, practiceSuccessDates: {}, quizResults: {}, volumeFinals: {}, volumeFinalTestVersions: {} };

const validDateMap = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([key, date]) => typeof key === "string" && typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)));
};

const validBooleanMap = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([key, result]) => typeof key === "string" && typeof result === "boolean"));
};

const validNumberMap = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([key, result]) => typeof key === "string" && typeof result === "number" && Number.isInteger(result) && result >= 1));
};

export async function loadActivityProgress(): Promise<ActivityProgress> {
  const value = await AsyncStorage.getItem(ACTIVITY_KEY);
  if (!value) return defaultActivity;
  try {
    const parsed = JSON.parse(value) as Partial<ActivityProgress>;
    return {
      practiceSuccessIds: Array.isArray(parsed.practiceSuccessIds) ? parsed.practiceSuccessIds.filter((item): item is string => typeof item === "string") : [],
      activeDays: Array.isArray(parsed.activeDays) ? parsed.activeDays.filter((item): item is string => /^\d{4}-\d{2}-\d{2}$/.test(item)) : [],
      completedLessonDates: validDateMap(parsed.completedLessonDates),
      practiceSuccessDates: validDateMap(parsed.practiceSuccessDates),
      quizResults: validBooleanMap(parsed.quizResults),
      volumeFinals: validBooleanMap(parsed.volumeFinals),
      volumeFinalTestVersions: validNumberMap(parsed.volumeFinalTestVersions),
    };
  } catch {
    return defaultActivity;
  }
}

async function saveActivity(progress: ActivityProgress) {
  await AsyncStorage.setItem(ACTIVITY_KEY, JSON.stringify(progress));
}

async function touchActivity() {
  const previous = await loadActivityProgress();
  const today = todayKey();
  const next = previous.activeDays.includes(today) ? previous : { ...previous, activeDays: [...previous.activeDays, today] };
  await saveActivity(next);
  return next;
}

export async function recordPracticeSuccess(challengeId: string) {
  const progress = await touchActivity();
  if (progress.practiceSuccessIds.includes(challengeId)) return progress;
  const next = { ...progress, practiceSuccessIds: [...progress.practiceSuccessIds, challengeId], practiceSuccessDates: { ...progress.practiceSuccessDates, [challengeId]: todayKey() } };
  await saveActivity(next);
  return next;
}

export async function recordQuizResult(lessonId: string, correct: boolean) {
  const activity = await touchActivity();
  const next = { ...activity, quizResults: { ...activity.quizResults, [lessonId]: correct } };
  await saveActivity(next);
  return next;
}

export async function recordVolumeFinalSuccess(volumeId: string) {
  const activity = await touchActivity();
  const next = { ...activity, volumeFinals: { ...(activity.volumeFinals ?? {}), [volumeId]: true }, volumeFinalTestVersions: { ...(activity.volumeFinalTestVersions ?? {}), [volumeId]: VOLUME_FINAL_TEST_VERSION } };
  await saveActivity(next);
  return next;
}

export type WeeklyDay = { date: string; label: string; lessons: number; practice: number };
export type WeeklyReport = { days: WeeklyDay[]; lessons: number; practice: number; activeDays: number };
export type WeekComparison = { current: WeeklyReport; previous: WeeklyReport; lessonsDelta: number; practiceDelta: number; totalDelta: number };

export function buildWeeklyReport(activity: ActivityProgress, reference = new Date()): WeeklyReport {
  const days: WeeklyDay[] = [];
  const shortDays = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const cursor = new Date(reference);
    cursor.setUTCDate(cursor.getUTCDate() - offset);
    const date = todayKey(cursor);
    days.push({
      date,
      label: shortDays[cursor.getUTCDay()],
      lessons: Object.values(activity.completedLessonDates).filter((value) => value === date).length,
      practice: Object.values(activity.practiceSuccessDates).filter((value) => value === date).length,
    });
  }
  return {
    days,
    lessons: days.reduce((sum, day) => sum + day.lessons, 0),
    practice: days.reduce((sum, day) => sum + day.practice, 0),
    activeDays: days.filter((day) => day.lessons + day.practice > 0).length,
  };
}

export function buildWeekComparison(activity: ActivityProgress, reference = new Date()): WeekComparison {
  const current = buildWeeklyReport(activity, reference);
  const previousReference = new Date(reference);
  previousReference.setUTCDate(previousReference.getUTCDate() - 7);
  const previous = buildWeeklyReport(activity, previousReference);
  return {
    current,
    previous,
    lessonsDelta: current.lessons - previous.lessons,
    practiceDelta: current.practice - previous.practice,
    totalDelta: current.lessons + current.practice - previous.lessons - previous.practice,
  };
}

export function calculateStreak(activeDays: string[], reference = new Date()) {
  const dates = new Set(activeDays);
  let streak = 0;
  const cursor = new Date(reference);
  while (dates.has(todayKey(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export async function loadCompletedLessons(): Promise<string[]> {
  const value = await AsyncStorage.getItem(PROGRESS_KEY);
  if (!value) return [];
  try {
    const data = JSON.parse(value);
    return Array.isArray(data) ? data.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export async function toggleCompletedLesson(lessonId: string): Promise<string[]> {
  const completed = await loadCompletedLessons();
  const next = completed.includes(lessonId)
    ? completed.filter((item) => item !== lessonId)
    : [...completed, lessonId];
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  const activity = await touchActivity();
  const completedLessonDates = { ...activity.completedLessonDates };
  if (completed.includes(lessonId)) delete completedLessonDates[lessonId];
  else completedLessonDates[lessonId] = todayKey();
  await saveActivity({ ...activity, completedLessonDates });
  return next;
}

export async function clearCompletedLessons() {
  await AsyncStorage.removeItem(PROGRESS_KEY);
  await AsyncStorage.removeItem(ACTIVITY_KEY);
}
