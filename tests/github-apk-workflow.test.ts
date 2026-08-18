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

  it("содержит независимую Gradle-сборку тестового APK с загрузкой артефакта", () => {
    const workflow = readProjectFile(".github/workflows/android-direct-apk.yml");
    const guide = readProjectFile("docs/GITHUB_DIRECT_APK.md");
    expect(workflow).toContain("npx expo prebuild --platform android --no-install");
    expect(workflow).toContain("./gradlew app:assembleDebug --no-daemon");
    expect(workflow).toContain("actions/upload-artifact@v4");
    expect(workflow).toContain("if-no-files-found: error");
    expect(workflow).not.toContain("EXPO_TOKEN");
    expect(guide).toContain("app-debug.apk");
    expect(guide).toContain("не для публикации в Google Play");
  });

  it("содержит подписанный Android-релиз с AAB и GitHub Release по тегу", () => {
    const workflow = readProjectFile(".github/workflows/android-signed-release.yml");
    const signingScript = readProjectFile("scripts/release-signing.gradle");
    const guide = readProjectFile("docs/GITHUB_SIGNED_RELEASE.md");
    expect(workflow).toContain('"release-v*"');
    expect(workflow).toContain("app:assembleRelease app:bundleRelease --no-daemon");
    expect(workflow).toContain("secrets.ANDROID_KEYSTORE_BASE64");
    expect(workflow).toContain("gh release create");
    expect(workflow).toContain("app-release.aab");
    expect(signingScript).toContain("ANDROID_KEYSTORE_PASSWORD");
    expect(signingScript).not.toMatch(/storePassword\s+['"][^'"]+/);
    expect(guide).toContain("ANDROID_KEYSTORE_BASE64");
  });
});
