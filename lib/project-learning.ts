import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ProjectTrackId, SkillDomain } from "@/shared/project-learning-data";

const KEY = "python-bez-straha.project-learning.v1";
export type ErrorCard = { id: string; tag: string; title: string; reason: string; correction: string; createdAt: string };
export type ProjectLearningState = { selectedTrack?: ProjectTrackId; finishedSteps: string[]; reviewChecks: string[]; portfolio: ProjectTrackId[]; errorCards: ErrorCard[]; skills: Record<SkillDomain, number> };
export const defaultProjectLearning: ProjectLearningState = { finishedSteps: [], reviewChecks: [], portfolio: [], errorCards: [], skills: { Python: 0, Git: 0, SQL: 0, "Тесты": 0, API: 0, Docker: 0 } };

export async function loadProjectLearning(): Promise<ProjectLearningState> { const raw = await AsyncStorage.getItem(KEY); if (!raw) return defaultProjectLearning; try { const saved = JSON.parse(raw) as Partial<ProjectLearningState>; return { ...defaultProjectLearning, ...saved, skills: { ...defaultProjectLearning.skills, ...(saved.skills ?? {}) } }; } catch { return defaultProjectLearning; } }
export async function saveProjectLearning(next: ProjectLearningState) { await AsyncStorage.setItem(KEY, JSON.stringify(next)); return next; }
export async function toggleProjectItem(key: "finishedSteps" | "reviewChecks", item: string) { const current = await loadProjectLearning(); const values = current[key].includes(item) ? current[key].filter((value) => value !== item) : [...current[key], item]; return saveProjectLearning({ ...current, [key]: values }); }
export async function addErrorCard(card: Omit<ErrorCard, "id" | "createdAt">) { const current = await loadProjectLearning(); const errorCards = [{ ...card, id: String(Date.now()), createdAt: new Date().toISOString() }, ...current.errorCards].slice(0, 40); return saveProjectLearning({ ...current, errorCards }); }
