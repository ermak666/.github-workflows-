import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");
const readProjectFile = (path: string) => readFileSync(resolve(projectRoot, path), "utf8");

describe("оболочка навигации", () => {
  it("сохраняет мягкий переход для экранов без системного заголовка", () => {
    const layout = readProjectFile("app/_layout.tsx");
    expect(layout).toContain('animation: "fade_from_bottom"');
    expect(layout).toContain("animationDuration: 220");
  });

  it("показывает кнопку главной только вне основных вкладок", () => {
    const container = readProjectFile("components/screen-container.tsx");
    expect(container).toContain('const PRIMARY_ROUTES = new Set(["/", "/learn", "/cheatsheet", "/progress"])');
    expect(container).toContain('accessibilityLabel="На главную"');
    expect(container).toContain('router.replace("/" as never)');
  });
});
