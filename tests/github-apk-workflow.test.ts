import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(import.meta.dirname, "..");
const readProjectFile = (path: string) => readFileSync(resolve(projectRoot, path), "utf8");

describe("автоматическая APK-сборка", () => {
  it("содержит профиль Expo, который создаёт устанавливаемый APK", () => {
    const easConfig = JSON.parse(readProjectFile("eas.json"));
    expect(easConfig.build.apk.android.buildType).toBe("apk");
    expect(easConfig.build.apk.distribution).toBe("internal");
  });

  it("запускает облачную APK-сборку вручную и по тегу без утечки токена", () => {
    const workflow = readProjectFile(".github/workflows/android-apk.yml");
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain('"v*"');
    expect(workflow).toContain("secrets.EXPO_TOKEN");
    expect(workflow).toContain("--platform android --profile apk --non-interactive --no-wait");
    expect(workflow).not.toMatch(/EXPO_TOKEN:\s*[^${\s]/);
  });
});
