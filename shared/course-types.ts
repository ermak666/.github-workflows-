export type Lesson = {
  id: string;
  number: number;
  title: string;
  goal: string;
  analogy: string;
  code: string;
  body: string;
};

export type Volume = {
  id: string;
  title: string;
  lessons: Lesson[];
};

export type CourseData = { volumes: Volume[] };
