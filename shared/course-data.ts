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

export function getNextVolume(volumeId: string | undefined): Volume | undefined {
  const index = volumes.findIndex((volume) => volume.id === volumeId);
  return index >= 0 ? volumes[index + 1] : undefined;
}

export function isVolumeComplete(volume: Volume, completedLessonIds: string[]) {
  return volume.lessons.length > 0 && volume.lessons.every((lesson) => completedLessonIds.includes(lesson.id));
}

export function getLessonNavigation(lessonId: string | undefined) {
  for (const volume of volumes) {
    const index = volume.lessons.findIndex((lesson) => lesson.id === lessonId);
    if (index >= 0) {
      return {
        volume,
        previousLesson: volume.lessons[index - 1],
        nextLesson: volume.lessons[index + 1],
        nextVolume: getNextVolume(volume.id),
      };
    }
  }
  return undefined;
}
