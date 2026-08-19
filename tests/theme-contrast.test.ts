import { describe, expect, it } from "vitest";

import themeConfig from "../theme.config";

function luminance(hex: string) {
  const channels = hex.slice(1).match(/../g)?.map((channel) => Number.parseInt(channel, 16) / 255) ?? [];
  const linear = channels.map((channel) => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(first: string, second: string) {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("контраст учебного интерфейса", () => {
  it("сохраняет читаемый светлый текст на тёмном фоне и карточках", () => {
    const scheme = "dark" as const;
    expect(contrast(themeConfig.themeColors.foreground[scheme], themeConfig.themeColors.background[scheme])).toBeGreaterThanOrEqual(7);
    expect(contrast(themeConfig.themeColors.foreground[scheme], themeConfig.themeColors.surface[scheme])).toBeGreaterThanOrEqual(7);
    expect(contrast(themeConfig.themeColors.muted[scheme], themeConfig.themeColors.background[scheme])).toBeGreaterThanOrEqual(4.5);
  });

  it("сохраняет высокий контраст текста учебного запуска на тёмной кодовой карточке", () => {
    expect(contrast("#F7F5FF", "#111426")).toBeGreaterThanOrEqual(7);
    expect(contrast("#FFE2E8", "#3B1724")).toBeGreaterThanOrEqual(4.5);
  });
});
