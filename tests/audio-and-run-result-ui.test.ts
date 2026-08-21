import { readFileSync } from "node:fs";
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
  });

  it("подготавливает встроенный MP3 и освобождает общий плеер для production APK", () => {
    const player = readProjectFile("lib/lesson-audio.tsx");
    expect(player).toContain("setIsAudioActiveAsync(true)");
    expect(player).toContain("downloadFirst: true");
    expect(player).toContain('interruptionModeAndroid: "duckOthers"');
    expect(player).toContain("useEffect(() => {");
    expect(player).toContain("Playback initialization failed");
  });

  it("показывает управление воспроизведением и не выводит успех поверх ошибки", () => {
    const lesson = readProjectFile("app/lesson/[id].tsx");
    const codeCard = readProjectFile("components/code-card.tsx");
    const practice = readProjectFile("app/practice.tsx");
    expect(lesson).toContain("Ⅱ Пауза");
    expect(lesson).toContain("▶ Продолжить");
    expect(lesson).toContain("■ Стоп");
    expect(codeCard).toContain("runOutput && !runError");
    expect(codeCard).toContain("КОМАНДА НЕ ВЫПОЛНЕНА");
    expect(practice).toContain("runOutput && !runError");
  });

  it("сохраняет тёмный текст на постоянных светлых карточках тренажёра", () => {
    const practice = readProjectFile("app/practice.tsx");
    expect(practice).toContain('bg-[#E9EAFE] p-5');
    expect(practice).toContain('text-[#171A33]">{challenge.title}');
    expect(practice).toContain('text-[#171A33]">ИИ-помощник по коду');
  });
});
