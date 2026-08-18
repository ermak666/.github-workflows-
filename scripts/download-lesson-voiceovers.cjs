const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "..");
const lessonInputs = JSON.parse(fs.readFileSync(path.join(projectRoot, "voice-samples/lesson-voiceover-inputs.json"), "utf8"));
const generation = JSON.parse(fs.readFileSync("/home/ubuntu/generate_lesson_algieba_voiceovers.json", "utf8"));
const audioDir = path.join(projectRoot, "assets/audio/lesson-intros");
const tempDir = path.join(projectRoot, "voice-samples/downloaded-wav");

fs.mkdirSync(audioDir, { recursive: true });
fs.mkdirSync(tempDir, { recursive: true });

async function run() {
  for (const item of generation.results) {
    const index = Number(item.input);
    const lesson = lessonInputs[index];
    const url = item.output?.audio_file;
    if (!lesson || !url) throw new Error(`Missing generation output for index ${item.input}`);

    const wavPath = path.join(tempDir, `${lesson.lessonId}.wav`);
    const mp3Path = path.join(audioDir, `${lesson.lessonId}.mp3`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed for ${lesson.lessonId}: ${response.status}`);
    fs.writeFileSync(wavPath, Buffer.from(await response.arrayBuffer()));
    execFileSync("ffmpeg", ["-y", "-i", wavPath, "-ac", "1", "-ar", "24000", "-b:a", "48k", mp3Path], { stdio: "ignore" });
    fs.unlinkSync(wavPath);
    console.log(`Prepared ${lesson.lessonId}`);
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
