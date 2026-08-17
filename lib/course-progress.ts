import AsyncStorage from "@react-native-async-storage/async-storage";

const PROGRESS_KEY = "python-bez-straha.completed-lessons.v1";

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
  return next;
}

export async function clearCompletedLessons() {
  await AsyncStorage.removeItem(PROGRESS_KEY);
}
