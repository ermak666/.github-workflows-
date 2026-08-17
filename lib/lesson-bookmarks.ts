import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "python-bez-straha.lesson-bookmarks.v1";
export type BookmarkCategory = { id: string; name: string };
export type LessonBookmark = { lessonId: string; categoryId: string; addedAt: string };
export type BookmarkState = { categories: BookmarkCategory[]; bookmarks: LessonBookmark[] };
export const defaultBookmarks: BookmarkState = { categories: [{ id: "hard", name: "Сложные темы" }, { id: "repeat", name: "Повторить" }], bookmarks: [] };

export async function loadBookmarks(): Promise<BookmarkState> { const raw = await AsyncStorage.getItem(KEY); if (!raw) return defaultBookmarks; try { const parsed = JSON.parse(raw) as Partial<BookmarkState>; const categories = Array.isArray(parsed.categories) ? parsed.categories.filter((item): item is BookmarkCategory => Boolean(item && typeof item.id === "string" && typeof item.name === "string")).slice(0, 20) : defaultBookmarks.categories; const bookmarks = Array.isArray(parsed.bookmarks) ? parsed.bookmarks.filter((item): item is LessonBookmark => Boolean(item && typeof item.lessonId === "string" && typeof item.categoryId === "string" && typeof item.addedAt === "string")).slice(0, 200) : []; return { categories: categories.length ? categories : defaultBookmarks.categories, bookmarks }; } catch { return defaultBookmarks; } }
export async function saveBookmarks(next: BookmarkState) { await AsyncStorage.setItem(KEY, JSON.stringify(next)); return next; }
export async function createBookmarkCategory(name: string) { const state = await loadBookmarks(); const clean = name.trim().replace(/\s+/g, " ").slice(0, 32); if (!clean) return state; if (state.categories.some((item) => item.name.toLowerCase() === clean.toLowerCase())) return state; return saveBookmarks({ ...state, categories: [...state.categories, { id: `cat-${Date.now()}`, name: clean }] }); }
export async function toggleLessonBookmark(lessonId: string, categoryId: string) { const state = await loadBookmarks(); const existing = state.bookmarks.find((item) => item.lessonId === lessonId && item.categoryId === categoryId); const bookmarks = existing ? state.bookmarks.filter((item) => !(item.lessonId === lessonId && item.categoryId === categoryId)) : [{ lessonId, categoryId, addedAt: new Date().toISOString() }, ...state.bookmarks]; return saveBookmarks({ ...state, bookmarks }); }
