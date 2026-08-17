import { Text, View } from "react-native";

import { CodeCard } from "@/components/code-card";

function cleanInline(value: string) {
  return value.replace(/`([^`]+)`/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1");
}

export function LessonMarkdown({ content, fontScale = 1 }: { content: string; fontScale?: number }) {
  const lines = content.replace(/\r/g, "").split("\n");
  const blocks: React.ReactNode[] = [];
  let code: string[] = [];
  let inCode = false;

  const pushCode = () => {
    if (code.length) blocks.push(<View key={`code-${blocks.length}`} className="mt-3"><CodeCard code={code.join("\n")} /></View>);
    code = [];
  };

  for (const [index, rawLine] of lines.entries()) {
    const line = rawLine.trimEnd();
    if (line.trim().startsWith("```")) { if (inCode) pushCode(); inCode = !inCode; continue; }
    if (inCode) { code.push(rawLine); continue; }
    if (!line.trim() || line.trim() === "---") continue;
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    const checklist = line.match(/^\s*[-*]\s+\[([ xX])\]\s+(.+)$/);
    const bullet = line.match(/^\s*[-*]\s+(.+)$/);
    const numbered = line.match(/^\s*(\d+)\.\s+(.+)$/);
    const table = line.match(/^\|(.+)\|$/);
    if (heading) {
      const level = heading[1].length;
      blocks.push(<Text key={`h-${index}`} style={{ fontSize: (level <= 2 ? 22 : level === 3 ? 19 : 17) * fontScale, lineHeight: (level <= 2 ? 30 : 25) * fontScale }} className="mt-6 font-bold text-foreground">{cleanInline(heading[2])}</Text>);
    } else if (checklist) {
      const done = checklist[1].toLowerCase() === "x";
      blocks.push(<View key={`check-${index}`} className="mt-2 flex-row gap-3"><View className={`mt-1 h-5 w-5 items-center justify-center rounded-md border ${done ? "border-success bg-success" : "border-primary bg-background"}`}><Text className="text-xs font-bold text-white">{done ? "✓" : ""}</Text></View><Text style={{ fontSize: 16 * fontScale, lineHeight: 25 * fontScale }} className="flex-1 text-foreground">{cleanInline(checklist[2])}</Text></View>);
    } else if (bullet || numbered) {
      const marker = numbered ? `${numbered[1]}.` : "•";
      const value = numbered ? numbered[2] : bullet?.[1] ?? "";
      blocks.push(<View key={`list-${index}`} className="mt-2 flex-row gap-3"><Text style={{ fontSize: 16 * fontScale, lineHeight: 25 * fontScale }} className="w-5 font-bold text-primary">{marker}</Text><Text style={{ fontSize: 16 * fontScale, lineHeight: 25 * fontScale }} className="flex-1 text-foreground">{cleanInline(value)}</Text></View>);
    } else if (table) {
      const cells = table[1].split("|").map((cell) => cleanInline(cell.trim())).filter(Boolean);
      if (!cells.every((cell) => /^:?-{3,}:?$/.test(cell))) blocks.push(<View key={`table-${index}`} className="mt-2 rounded-xl bg-background px-3 py-2"><Text style={{ fontSize: 14 * fontScale, lineHeight: 21 * fontScale }} className="text-muted">{cells.join("  ·  ")}</Text></View>);
    } else {
      blocks.push(<Text key={`p-${index}`} style={{ fontSize: 16 * fontScale, lineHeight: 28 * fontScale }} className="mt-3 text-foreground">{cleanInline(line.trim())}</Text>);
    }
  }
  if (inCode) pushCode();
  return <View>{blocks}</View>;
}
