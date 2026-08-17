import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "python-bez-straha.study-toolkit.v1";

export type Snippet = { id: string; title: string; code: string; tags: string[]; createdAt: string };
export type MentorRequest = { id: string; project: string; question: string; createdAt: string; status: "draft" | "ready" };
export type ToolkitState = {
  notes: Record<string, string>;
  snippets: Snippet[];
  offlineVolumes: string[];
  personalWhy: string;
  focusMode: boolean;
  highContrast: boolean;
  flexibleGoal: { lessons: number; tasks: number; minutes: number; projects: number };
  mentorRequests: MentorRequest[];
  achievements: string[];
  diagnosticScore?: number;
};

export const defaultToolkit: ToolkitState = {
  notes: {}, snippets: [], offlineVolumes: [], personalWhy: "", focusMode: false, highContrast: false,
  flexibleGoal: { lessons: 3, tasks: 5, minutes: 60, projects: 1 }, mentorRequests: [], achievements: [],
};

export async function loadToolkit(): Promise<ToolkitState> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return defaultToolkit;
  try { return { ...defaultToolkit, ...(JSON.parse(raw) as Partial<ToolkitState>) }; } catch { return defaultToolkit; }
}

export async function saveToolkit(next: ToolkitState) { await AsyncStorage.setItem(KEY, JSON.stringify(next)); return next; }

export async function updateToolkit(patch: Partial<ToolkitState>) {
  const current = await loadToolkit();
  return saveToolkit({ ...current, ...patch });
}
