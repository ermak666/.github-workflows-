const fs = require("node:fs");
const path = require("node:path");

const source = path.resolve(__dirname, "../shared/course-content.json");
const destination = path.resolve(__dirname, "../voice-samples/lesson-voiceover-inputs.json");
const course = JSON.parse(fs.readFileSync(source, "utf8"));

const inputs = course.volumes.flatMap((volume) =>
  volume.lessons.map((lesson) => ({
    lessonId: lesson.id,
    volumeId: volume.id,
    script: `Урок: ${lesson.title}. Цель урока: ${lesson.goal}. Представьте так: ${lesson.analogy}`,
  })),
);

fs.writeFileSync(destination, JSON.stringify(inputs, null, 2));
console.log(`Prepared ${inputs.length} lesson voiceover scripts.`);
