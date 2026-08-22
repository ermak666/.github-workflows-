import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");
const readProjectFile = (path: string) => readFileSync(resolve(projectRoot, path), "utf8");

describe("аудиоуправление и результат учебного запуска", () => {
  it("создаёт один общий аудиоплеер с паузой, продолжением и остановкой", () => {
    const player = readProjectFile("lib/lesson-audio.tsx");
    expect(player).toContain("const playerRef = useRef<AudioPlayer | null>(null)");
    expect(player).toContain("dispose();");
    expect(player).toContain("const pause = useCallback");
    expect(player).toContain("const resume = useCallback");
    expect(player).toContain("const stop = useCallback");
    expect(player).toContain("Asset.fromModule(source)");
    expect(player).toContain("await asset.downloadAsync()");
    expect(player).toContain("createAudioPlayer({ uri: asset.localUri })");
    expect(player).toContain("setAudioError(");
    expect(player).not.toContain("catch {");
    expect(player).not.toContain("setIsAudioActiveAsync");
    expect(player).not.toContain("downloadFirst");
  });

  it("включает существующую записанную озвучку Algieba для каждого из 124 уроков", () => {
    const voiceovers = readProjectFile("lib/lesson-voiceovers.ts");
    const lesson = readProjectFile("app/lesson/[id].tsx");
    const baseCourse = JSON.parse(readProjectFile("shared/course-content.json")) as { volumes: Array<{ lessons: Array<{ id: string }> }> };
    const supplemental = readProjectFile("shared/supplemental-lessons.ts");
    const sources = [...voiceovers.matchAll(/require\("(\.\.\/assets\/audio\/lesson-intros\/[^\"]+\.mp3)"\)/g)].map((match) => match[1]);
    const mappedIds = [...voiceovers.matchAll(/"([^\"]+)": require\(/g)].map((match) => match[1]);
    const courseIds = baseCourse.volumes.flatMap((volume) => volume.lessons.map((item) => item.id));
    const supplementalIds = [...supplemental.matchAll(/lesson\("([^\"]+)"/g)].map((match) => match[1]);

    expect(sources).toHaveLength(124);
    for (const source of sources) {
      expect(existsSync(resolve(projectRoot, "lib", source))).toBe(true);
    }
    expect(mappedIds).toEqual(expect.arrayContaining([...courseIds, ...supplementalIds]));
    expect(lesson).toContain("lessonVoiceovers[lesson.id as LessonVoiceoverId]");
    expect(lesson).toContain("const hasLessonVoiceover = lessonAudioSource !== undefined");
    expect(lesson).toContain("hasLessonVoiceover && !isCurrentVoiceover");
    expect(lesson).not.toContain("lessonAudioSource && !isCurrentVoiceover");
    expect(lesson).not.toContain("if (!lessonAudioSource");
    expect(lesson).toContain("▶ Слушать Algieba");
    expect(lesson).toContain("{audioError ?");
  });

  it("показывает управление воспроизведением и не даёт запуск неподдерживаемым примерам", () => {
    const lesson = readProjectFile("app/lesson/[id].tsx");
    const codeCard = readProjectFile("components/code-card.tsx");
    const practice = readProjectFile("app/practice.tsx");
    expect(lesson).toContain("Ⅱ Пауза");
    expect(lesson).toContain("▶ Продолжить");
    expect(lesson).toContain("■ Стоп");
    expect(codeCard).toContain("const supportsRun = useMemo");
    expect(codeCard).toContain("{supportsRun ?");
    expect(codeCard).not.toContain("КОМАНДА НЕ ВЫПОЛНЕНА");
    expect(codeCard).not.toContain("Пока не умею выполнить");
    expect(practice).toContain("runOutput && !runError");
  });

  it("сохраняет тёмный текст на постоянных светлых карточках тренажёра", () => {
    const practice = readProjectFile("app/practice.tsx");
    expect(practice).toContain('bg-[#E9EAFE] p-5');
    expect(practice).toContain('text-[#171A33]">{challenge.title}');
    expect(practice).toContain('text-[#171A33]">ИИ-помощник по коду');
  });

  it("не имитирует запуск NumPy и Pandas, а оставляет код с разбором; базовый пример остаётся запускаемым", () => {
    const sandbox = readProjectFile("app/sandbox.tsx");
    expect(sandbox).toContain("runnable: false");
    expect(sandbox).toContain("runnable: true");
    expect(sandbox).toContain("active.runnable ?");
    expect(sandbox).not.toContain("lab === \"basic\" ? runBasicCode(code) : active.output");
  });
});
