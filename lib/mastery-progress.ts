import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "python-bez-straha.mastery-progress.v1";

export type MasteryProgress = {
  activePlan: "five" | "steady" | "project";
  fiveMinuteDays: string[];
  completedProjects: Record<string, number>;
  debugSolved: string[];
  codeReadingSolved: string[];
  styleChecks: string[];
  explanations: Record<string, string>;
  selectedTrack: "pytest" | "git" | "sqlite" | "automation" | null;
  diagnosticAnswers: Record<string, number>;
  lastOpened: { id: string; title: string; openedAt: string }[];
  backupCreatedAt?: string;
};

export const defaultMasteryProgress: MasteryProgress = {
  activePlan: "steady",
  fiveMinuteDays: [],
  completedProjects: {},
  debugSolved: [],
  codeReadingSolved: [],
  styleChecks: [],
  explanations: {},
  selectedTrack: null,
  diagnosticAnswers: {},
  lastOpened: [],
};

export async function loadMasteryProgress(): Promise<MasteryProgress> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return defaultMasteryProgress;
  try {
    return { ...defaultMasteryProgress, ...(JSON.parse(raw) as Partial<MasteryProgress>) };
  } catch {
    return defaultMasteryProgress;
  }
}

export async function saveMasteryProgress(next: MasteryProgress) {
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function updateMasteryProgress(patch: Partial<MasteryProgress>) {
  const current = await loadMasteryProgress();
  return saveMasteryProgress({ ...current, ...patch });
}

export async function exportMasteryBackup() {
  const [mastery, toolkit] = await Promise.all([loadMasteryProgress(), AsyncStorage.getItem("python-bez-straha.study-toolkit.v1")]);
  return JSON.stringify({ format: "python-bez-straha-backup-v1", createdAt: new Date().toISOString(), mastery, toolkit: toolkit ? JSON.parse(toolkit) : null }, null, 2);
}

export async function importMasteryBackup(raw: string) {
  const parsed = JSON.parse(raw) as { format?: string; mastery?: MasteryProgress; toolkit?: unknown };
  if (parsed.format !== "python-bez-straha-backup-v1" || !parsed.mastery) throw new Error("Это не резервная копия «Python без страха».");
  await AsyncStorage.setItem(KEY, JSON.stringify({ ...defaultMasteryProgress, ...parsed.mastery }));
  if (parsed.toolkit) await AsyncStorage.setItem("python-bez-straha.study-toolkit.v1", JSON.stringify(parsed.toolkit));
  return loadMasteryProgress();
}
