import type { Lesson } from "@/shared/course-types";

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

type QuizBank = Record<string, QuizQuestion[]>;

const banks: QuizBank = {
  junior: [
    { id: "j-print", question: "Какая команда показывает текст на экране?", options: ["show()", "print()", "say()"], correctIndex: 1, explanation: "Верно: print() просит Python показать значение на экране." },
    { id: "j-variable", question: "Что делает знак = в строке name = \"Маша\"?", options: ["Сравнивает", "Кладёт значение в переменную", "Удаляет текст"], correctIndex: 1, explanation: "Верно: значение справа сохраняется в переменной слева." },
    { id: "j-condition", question: "Какой знак означает «равно ли» в условии?", options: ["=", "==", ":="], correctIndex: 1, explanation: "Верно: == сравнивает два значения, а = присваивает." },
    { id: "j-list", question: "С какого номера начинается первый элемент списка?", options: ["0", "1", "С номера последнего элемента"], correctIndex: 0, explanation: "Верно: Python начинает нумерацию элементов списка с нуля." },
    { id: "j-function", question: "Какое слово создаёт функцию?", options: ["func", "def", "return"], correctIndex: 1, explanation: "Верно: def начинает описание новой функции." },
  ],
  middle: [
    { id: "m-json", question: "Какая библиотека помогает работать с JSON?", options: ["json", "paint", "clock"], correctIndex: 0, explanation: "Верно: стандартный модуль json читает и записывает JSON-данные." },
    { id: "m-error", question: "Где ловят ожидаемую ошибку ValueError?", options: ["В except", "В import", "В return"], correctIndex: 0, explanation: "Верно: except описывает, что сделать при возникновении ошибки." },
    { id: "m-path", question: "Какой модуль делает пути к файлам понятнее?", options: ["pathlib", "random", "math"], correctIndex: 0, explanation: "Верно: pathlib представляет пути как удобные объекты." },
    { id: "m-file", question: "Зачем открывать файл через with open(...)?", options: ["Чтобы файл закрылся сам", "Чтобы ускорить интернет", "Чтобы создать список"], correctIndex: 0, explanation: "Верно: блок with заботится о корректном закрытии файла." },
    { id: "m-request", question: "Какой аргумент полезен, чтобы запрос не ждал бесконечно?", options: ["timeout", "forever", "repeat"], correctIndex: 0, explanation: "Верно: timeout задаёт ограничение времени ожидания." },
  ],
  senior: [
    { id: "s-types", question: "Для чего нужны аннотации типов?", options: ["Подсказать ожидаемые данные", "Удалить ошибки навсегда", "Ускорить интернет"], correctIndex: 0, explanation: "Верно: типы делают контракт функции понятнее человеку и инструментам." },
    { id: "s-test", question: "Какое слово проверяет ожидание в тесте Python?", options: ["assert", "guess", "send"], correctIndex: 0, explanation: "Верно: assert проверяет условие и сообщает о несовпадении." },
    { id: "s-async", question: "Что означает await в async-коде?", options: ["Подождать результат, не блокируя другие задачи", "Удалить функцию", "Открыть файл"], correctIndex: 0, explanation: "Верно: await отдаёт управление, пока ожидаемая операция не завершится." },
    { id: "s-log", question: "Зачем нужно логирование?", options: ["Понимать ход работы программы", "Спрятать код", "Заменить тесты"], correctIndex: 0, explanation: "Верно: сообщения логов помогают понять, что происходило в программе." },
    { id: "s-context", question: "Что удобно контролирует контекстный менеджер?", options: ["Открытие и закрытие ресурса", "Цвет экрана", "Скорость клавиатуры"], correctIndex: 0, explanation: "Верно: контекстный менеджер надёжно освобождает ресурс после работы." },
  ],
  web: [
    { id: "w-robots", question: "Что нужно проверить до автоматического сбора данных с сайта?", options: ["robots.txt и правила сайта", "Только цвет страницы", "Число вкладок"], correctIndex: 0, explanation: "Верно: сначала проверяют правила ресурса и доступные разрешённые способы работы." },
    { id: "w-delay", question: "Зачем ставить паузу между разрешёнными запросами?", options: ["Не перегружать сайт", "Сделать код длиннее", "Обойти защиту"], correctIndex: 0, explanation: "Верно: ограничения частоты бережно относятся к ресурсу и его правилам." },
    { id: "w-session", question: "Что хранит requests.Session() для разрешённой авторизации?", options: ["Состояние сессии и cookies", "Пароль телефона", "Исходники сайта"], correctIndex: 0, explanation: "Верно: сессия сохраняет разрешённое HTTP-состояние между запросами." },
    { id: "w-cache", question: "Зачем нужен кэш?", options: ["Не запрашивать одинаковое повторно", "Обходить ограничения", "Скрыть ошибки"], correctIndex: 0, explanation: "Верно: кэш сокращает лишние повторные обращения к данным." },
    { id: "w-secret", question: "Где должен жить токен бота?", options: ["В переменной окружения", "Прямо в исходном коде", "В названии файла"], correctIndex: 0, explanation: "Верно: секреты не записывают в код; используют переменные окружения." },
  ],
};

export function getLessonQuiz(lesson: Lesson): QuizQuestion {
  const volumeId = lesson.id.split("-")[0];
  const bank = banks[volumeId] ?? banks.junior;
  return bank[(Math.max(lesson.number, 1) - 1) % bank.length];
}
