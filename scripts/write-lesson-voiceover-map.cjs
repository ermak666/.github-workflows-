const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const inputs = JSON.parse(fs.readFileSync(path.join(projectRoot, "voice-samples/lesson-voiceover-inputs.json"), "utf8"));
const lines = inputs.map((lesson) => `  ${JSON.stringify(lesson.lessonId)}: require(${JSON.stringify(`../assets/audio/lesson-intros/${lesson.lessonId}.mp3`)}),`);
const destination = path.join(projectRoot, "lib/lesson-voiceovers.ts");

fs.writeFileSync(destination, `// Generated bundled audio introductions narrated with the selected Algieba voice.\nexport const lessonVoiceovers = {\n${lines.join("\n")}\n} as const;\n\nexport type LessonVoiceoverId = keyof typeof lessonVoiceovers;\n`);
console.log(`Wrote ${inputs.length} voiceover mappings.`);
