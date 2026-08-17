import AsyncStorage from "@react-native-async-storage/async-storage";

const PROGRESS_KEY = "python-bez-straha.completed-lessons.v1";
const ACTIVITY_KEY = "python-bez-straha.activity.v1";

export type ActivityProgress = {
  practiceSuccessIds: string[];
  activeDays: string[];
};

const todayKey = (date = new Date()) => date.toISOString().slice(0, 10);

const defaultActivity: ActivityProgress = { practiceSuccessIds: [], activeDays: [] };

export async function loadActivityProgress(): Promise<ActivityProgress> {
  const value = await AsyncStorage.getItem(ACTIVITY_KEY);
  if (!value) return defaultActivity;
  try {
    const parsed = JSON.parse(value) as Partial<ActivityProgress>;
    return {
      practiceSuccessIds: Array.isArray(parsed.practiceSuccessIds) ? parsed.practiceSuccessIds.filter((item): item is string => typeof item === "string") : [],
      activeDays: Array.isArray(parsed.activeDays) ? parsed.activeDays.filter((item): item is string => /^\d{4}-\d{2}-\d{2}$/.test(item)) : [],
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
  const next = { ...progress, practiceSuccessIds: [...progress.practiceSuccessIds, challengeId] };
  await saveActivity(next);
  return next;
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
  if (!completed.includes(lessonId)) await touchActivity();
  return next;
}

export async function clearCompletedLessons() {
  await AsyncStorage.removeItem(PROGRESS_KEY);
  await AsyncStorage.removeItem(ACTIVITY_KEY);
}
