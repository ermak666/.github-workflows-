import rawCourse from "./course-content.json";
import type { CourseData, Lesson, Volume } from "./course-types";

export const course = rawCourse as CourseData;
export const volumes: Volume[] = course.volumes;

export function getVolume(volumeId: string | undefined) {
  return volumes.find((volume) => volume.id === volumeId);
}

export function getLesson(lessonId: string | undefined): Lesson | undefined {
  return volumes.flatMap((volume) => volume.lessons).find((lesson) => lesson.id === lessonId);
}
