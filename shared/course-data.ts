import rawCourse from "./course-content.json";
import type { CourseData, Lesson, Volume } from "./course-types";
import { supplementalLessons } from "./supplemental-lessons";

const baseCourse = rawCourse as CourseData;
export const course: CourseData = {
  volumes: baseCourse.volumes.map((volume) => ({
    ...volume,
    lessons: [...volume.lessons, ...(supplementalLessons[volume.id] ?? [])],
  })),
};
export const volumes: Volume[] = course.volumes;

export function getVolume(volumeId: string | undefined) {
  return volumes.find((volume) => volume.id === volumeId);
}

export function getLesson(lessonId: string | undefined): Lesson | undefined {
  return volumes.flatMap((volume) => volume.lessons).find((lesson) => lesson.id === lessonId);
}
