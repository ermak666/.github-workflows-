import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "python-bez-straha.weekly-lesson-goal.v1";

export type WeeklyGoal = { lessonTarget: number };

export const defaultWeeklyGoal: WeeklyGoal = { lessonTarget: 3 };

export async function loadWeeklyGoal(): Promise<WeeklyGoal> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return defaultWeeklyGoal;
  try {
    const parsed = JSON.parse(raw) as Partial<WeeklyGoal>;
    const target = parsed.lessonTarget;
    return { lessonTarget: Number.isInteger(target) && target! >= 1 && target! <= 14 ? target! : defaultWeeklyGoal.lessonTarget };
  } catch {
    return defaultWeeklyGoal;
  }
}

export async function saveWeeklyGoal(lessonTarget: number) {
  const goal = { lessonTarget: Math.max(1, Math.min(14, Math.round(lessonTarget))) };
  await AsyncStorage.setItem(KEY, JSON.stringify(goal));
  return goal;
}

export function calculateGoalProgress(completedLessons: number, lessonTarget: number) {
  const percent = Math.min(100, Math.round((completedLessons / Math.max(lessonTarget, 1)) * 100));
  return { percent, remaining: Math.max(0, lessonTarget - completedLessons), reached: completedLessons >= lessonTarget };
}
