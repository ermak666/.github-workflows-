export type PracticeChallenge = {
  id: string;
  title: string;
  level: string;
  task: string;
  hint: string;
  solution: string;
  check: (code: string) => boolean;
};

const compact = (value: string) => value.replace(/\s+/g, " ").trim();

export const practiceChallenges: PracticeChallenge[] = [
  {
    id: "hello",
    title: "Поздоровайся с Python",
    level: "Начало",
    task: "Напиши одну строку, которая выведет на экран слово «Привет».",
    hint: "Нужна функция print(), а текст должен быть в кавычках.",
    solution: 'print("Привет")',
    check: (code) => /print\s*\(\s*["']Привет["']\s*\)/i.test(code),
  },
  {
    id: "variable",
    title: "Сохрани имя",
    level: "Переменные",
    task: "Создай переменную name со своим именем, затем выведи её через print(name).",
    hint: "Сначала: name = " + '"Аня"' + ". Затем в скобках print напиши name без кавычек.",
    solution: 'name = "Аня"\nprint(name)',
    check: (code) => /name\s*=\s*["'][^"']+["']/.test(code) && /print\s*\(\s*name\s*\)/.test(code),
  },
  {
    id: "condition",
    title: "Проверь оценку",
    level: "Условия",
    task: "Создай score = 5. Если score больше или равен 5, выведи «Отлично!».",
    hint: "Понадобятся score = 5, строка if score >= 5: и отступ перед print.",
    solution: 'score = 5\nif score >= 5:\n    print("Отлично!")',
    check: (code) => /score\s*=\s*5/.test(code) && /if\s+score\s*>=\s*5\s*:/.test(code) && /print\s*\(\s*["']Отлично!["']\s*\)/i.test(code),
  },
  {
    id: "loop",
    title: "Перебери список",
    level: "Циклы",
    task: "Создай список tasks с двумя словами и выведи каждое дело в цикле for.",
    hint: "Список пишется в квадратных скобках. Начало цикла: for task in tasks:.",
    solution: 'tasks = ["уроки", "сон"]\nfor task in tasks:\n    print(task)',
    check: (code) => /tasks\s*=\s*\[/.test(code) && /for\s+\w+\s+in\s+tasks\s*:/.test(code) && /print\s*\(\s*\w+\s*\)/.test(code),
  },
  {
    id: "function",
    title: "Сделай маленькую функцию",
    level: "Функции",
    task: "Напиши функцию double(number), которая возвращает number * 2.",
    hint: "Начни с def double(number): и внутри используй return.",
    solution: 'def double(number):\n    return number * 2',
    check: (code) => /def\s+double\s*\(\s*number\s*\)\s*:/.test(code) && /return\s+number\s*\*\s*2/.test(compact(code)),
  },
];

export function evaluatePractice(challenge: PracticeChallenge, code: string) {
  if (!code.trim()) return { correct: false, message: "Сначала напишите хотя бы одну строку кода." };
  if (challenge.check(code)) return { correct: true, message: "Верно! Все важные шаги на месте. Вы только что написали рабочую идею самостоятельно." };
  return { correct: false, message: "Пока не совпало. Проверьте цель задания, отступы и подсказку; потом попробуйте ещё раз." };
}
