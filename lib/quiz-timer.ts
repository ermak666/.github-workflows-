export function formatElapsedTime(elapsedSeconds: number) {
  const wholeSeconds = Math.max(0, Math.floor(elapsedSeconds));
  const minutes = Math.floor(wholeSeconds / 60);
  const seconds = wholeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
