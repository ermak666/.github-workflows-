export const planOptions = [
  { id: "five", title: "5 минут в день", detail: "Один короткий шаг: прочитать, предсказать результат или исправить строку." },
  { id: "steady", title: "Спокойный ритм", detail: "Три урока и пять задач за неделю без гонки." },
  { id: "project", title: "Через проект", detail: "Каждую неделю двигаем один полезный мини‑проект." },
] as const;

export const topicDependencies = [
  { topic: "Переменные", needs: "Старт", opens: "Условия и строки" },
  { topic: "Условия", needs: "Переменные", opens: "Циклы и проверки" },
  { topic: "Циклы for", needs: "Условия", opens: "Списки и алгоритмы" },
  { topic: "Функции", needs: "Циклы", opens: "Проекты и тесты" },
  { topic: "Словари", needs: "Списки", opens: "JSON и API" },
  { topic: "Тесты", needs: "Функции", opens: "Надёжные проекты" },
];

export const debugDrills = [
  { id: "debug-indent", title: "Отступ в условии", broken: 'age = 12\nif age >= 10:\nprint("Можно")', question: "Что нужно исправить?", options: ["Сдвинуть print на 4 пробела", "Убрать двоеточие", "Заменить if на for"], answer: 0, explanation: "Строки внутри if должны иметь отступ. Отступ — как коробочка внутри коробочки." },
  { id: "debug-list", title: "Выход за границы списка", broken: 'colors = ["красный", "синий"]\nprint(colors[2])', question: "Почему это не работает?", options: ["В списке нет элемента №2", "Список нельзя печатать", "Нужно добавить import"], answer: 0, explanation: "Нумерация начинается с нуля: здесь есть только 0 и 1." },
  { id: "debug-equals", title: "Сравнение и присваивание", broken: 'name = "Аня"\nif name = "Аня":\n    print("Привет")', question: "Какой знак нужен в условии?", options: ["==", "+=", "!="], answer: 0, explanation: "Один = кладёт значение в коробку, два == спрашивают: одинаковые ли значения?" },
];

export const codeReadingDrills = [
  { id: "read-total", code: "total = 0\nfor number in range(1, 4):\n    total += number\nprint(total)", question: "Что напечатает код?", options: ["6", "3", "0"], answer: 0, explanation: "range(1, 4) даёт 1, 2, 3. Складываем: 1 + 2 + 3 = 6." },
  { id: "read-filter", code: "pets = [\"кот\", \"пёс\"]\nfor pet in pets:\n    print(pet)", question: "Сколько строк будет в выводе?", options: ["2", "1", "0"], answer: 0, explanation: "Цикл берёт по одному питомцу, поэтому print сработает два раза." },
];

export const styleChecks = [
  { id: "style-name", title: "Понятные имена", bad: "x = 12\ny = x * 0.2", better: "price = 12\ndiscount = price * 0.2", rule: "Имя отвечает на вопрос «что здесь лежит?»." },
  { id: "style-space", title: "Воздух вокруг знаков", bad: "total=price+tax", better: "total = price + tax", rule: "Пробелы делают код легче для глаз." },
  { id: "style-small", title: "Маленькие шаги", bad: "Одна длинная строка делает всё", better: "Сначала ввод, затем вычисление, затем print", rule: "Маленькие шаги проще проверить и объяснить." },
];

export const milestoneProjects = [
  { id: "budget", title: "Копилка расходов", goal: "Список трат, сумма и предупреждение о лимите.", stages: ["Создать список трат", "Добавить ввод", "Посчитать сумму", "Показать лимит", "Написать README"] },
  { id: "quiz", title: "Мини‑викторина", goal: "Вопросы, счёт и дружелюбный итог.", stages: ["Список вопросов", "Проверить ответ", "Считать очки", "Добавить повтор", "Описать проект"] },
  { id: "catalog", title: "Каталог книг", goal: "Словарь книг и поиск по названию.", stages: ["Создать словарь", "Показать книгу", "Добавить поиск", "Обработать отсутствие", "Сделать пример"] },
];

export const professionalTracks = [
  { id: "pytest", title: "Практика pytest", steps: ["Написать маленькую функцию", "Сформулировать 3 ожидаемых результата", "Понять arrange / act / assert", "Разобрать падение теста"] },
  { id: "git", title: "Трек Git", steps: ["Создать понятный commit", "Понять ветку", "Описать pull request", "Разрешить учебный конфликт"] },
  { id: "sqlite", title: "SQLite‑мастерская", steps: ["Спроектировать таблицу книг", "Добавить запись", "Сделать SELECT", "Объяснить первичный ключ"] },
  { id: "automation", title: "Этичная веб‑автоматизация", steps: ["Проверить правила сайта", "Выбрать публичный API", "Поставить таймаут", "Не хранить чужие cookies и пароли"] },
] as const;

export const finalDiagnostic = [
  { id: "diag-loop", topic: "Циклы", question: "Когда нужен for?", options: ["Когда повторяем действие для каждого элемента", "Когда импортируем библиотеку", "Когда открываем файл"], answer: 0, lesson: "Циклы for" },
  { id: "diag-dict", topic: "Словари", question: "Что хранит словарь?", options: ["Пары ключ — значение", "Только числа", "Только строки"], answer: 0, lesson: "Словари" },
  { id: "diag-test", topic: "Тесты", question: "Зачем нужен тест?", options: ["Проверить ожидаемый результат", "Ускорить интернет", "Заменить программу"], answer: 0, lesson: "Первые тесты" },
  { id: "diag-api", topic: "Автоматизация", question: "Что безопаснее проверить первым?", options: ["Публичный API и правила сайта", "Чужой пароль", "Обход ограничений"], answer: 0, lesson: "Этичная автоматизация" },
];

export const portfolioChecklist = ["Понятное название и цель", "Короткое README с запуском", "Скриншот или пример вывода", "Одна интересная техническая находка", "Список того, что улучшите позже"];
