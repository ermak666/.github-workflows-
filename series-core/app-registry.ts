import type { SeriesCourse } from "./course-contract";

type CourseSeed = Omit<SeriesCourse, "volumes" | "darkOnly"> & { volumeTitles: string[] };

const stages = [
  { id: "junior" as const, label: "Junior" },
  { id: "middle" as const, label: "Middle" },
  { id: "senior" as const, label: "Senior" },
  { id: "applied" as const, label: "Проекты и практика" },
];

const volumes = (titles: string[]) => titles.map((title, index) => ({
  id: `volume-${index + 1}`,
  stage: stages[index]?.id ?? "applied",
  title: `${stages[index]?.label ?? "Проекты и практика"}: ${title}`,
  outcome: `Освоить основу тома «${stages[index]?.label ?? "Проекты и практика"}: ${title}» через уроки, примеры и мини-проект.`,
  lessonTarget: 6,
  challengeTarget: 100,
}));

const seeds: CourseSeed[] = [
  { id: "git-github", title: "Git и GitHub без страха", track: "foundation", prerequisites: [], safePractice: "Симулятор репозитория и команд Git без доступа к реальной файловой системе.", capstone: "Оформленный учебный репозиторий с веткой, Pull Request и README.", volumeTitles: ["Первые снимки", "Ветки", "GitHub", "Командная работа"] },
  { id: "sql", title: "SQL без страха", track: "backend", prerequisites: ["git-github"], safePractice: "Изолированная учебная база данных в памяти.", capstone: "База данных библиотеки с запросами и связями.", volumeTitles: ["Таблицы", "Запросы", "Связи", "Проектирование"] },
  { id: "html-css", title: "Веб без страха: HTML и CSS", track: "web", prerequisites: [], safePractice: "Проверка структуры разметки и стилей в изолированных примерах.", capstone: "Адаптивная страница-портфолио.", volumeTitles: ["HTML", "CSS", "Раскладка", "Адаптивность"] },
  { id: "javascript", title: "JavaScript без страха", track: "web", prerequisites: ["html-css"], safePractice: "Ограниченный учебный запуск JavaScript без сети, файлов и динамического кода.", capstone: "Интерактивный список задач в браузере.", volumeTitles: ["Основы", "Функции и объекты", "DOM", "Асинхронность"] },
  { id: "typescript", title: "TypeScript без страха", track: "web", prerequisites: ["javascript"], safePractice: "Проверка типов и прогнозирование ошибок на коротких локальных примерах.", capstone: "Типизированное приложение заметок.", volumeTitles: ["Типы", "Функции", "Объекты", "Проект"] },
  { id: "react", title: "React без страха", track: "web", prerequisites: ["javascript", "typescript"], safePractice: "Симулятор дерева компонентов и состояния без запуска произвольного кода.", capstone: "Интерфейс личной коллекции с компонентами и маршрутами.", volumeTitles: ["Компоненты", "Состояние", "Формы", "Приложение"] },
  { id: "redux-toolkit", title: "Redux Toolkit без страха", track: "web", prerequisites: ["react", "typescript"], safePractice: "Визуализатор store, actions и selectors на фиксированных данных.", capstone: "Корзина или трекер задач с общим состоянием.", volumeTitles: ["State", "Actions", "Slices", "Большой проект"] },
  { id: "angular", title: "Angular без страха", track: "web", prerequisites: ["html-css", "javascript", "typescript"], safePractice: "Конструктор структуры Angular-проекта и проверка зависимостей компонентов.", capstone: "Каталог с компонентами, сервисом и маршрутизацией.", volumeTitles: ["Компоненты", "Шаблоны", "Сервисы", "Приложение"] },
  { id: "nodejs", title: "Node.js без страха", track: "backend", prerequisites: ["javascript", "typescript"], safePractice: "Разбор модулей, асинхронности и HTTP-моделей без запуска сервера, процессов или сети.", capstone: "Небольшой HTTP-сервис с валидацией, тестами и безопасной конфигурацией.", volumeTitles: ["Модули", "Асинхронность", "HTTP", "Сервис"] },
  { id: "python-backend", title: "Backend без страха: FastAPI и Django", track: "backend", prerequisites: ["sql"], safePractice: "Локальные модели запросов и ответов без публикации серверов.", capstone: "API библиотеки с документацией и базой.", volumeTitles: ["HTTP и API", "FastAPI", "Django", "Сервис"] },
  { id: "pytest-ci", title: "Тесты без страха: pytest и CI", track: "backend", prerequisites: ["git-github"], safePractice: "Проверка тестовых сценариев на детерминированных учебных функциях.", capstone: "Набор тестов и workflow CI для учебного проекта.", volumeTitles: ["Первые тесты", "Фикстуры", "API", "CI"] },
  { id: "docker", title: "Docker без страха", track: "devops", prerequisites: ["git-github"], safePractice: "Визуальный симулятор образов, контейнеров и Compose без запуска Docker на устройстве.", capstone: "Docker Compose-схема учебного сервиса.", volumeTitles: ["Контейнеры", "Образы", "Сети", "Compose"] },
  { id: "powershell-web", title: "PowerShell для веб-разработчика без страха", track: "devops", prerequisites: ["git-github"], safePractice: "Разбор cmdlet, объектов, pipeline, REST-моделей и тестов без выполнения команд.", capstone: "Безопасный сценарий проверки веб-конфигурации с Pester-тестами и README.", volumeTitles: ["Объекты", "Pipeline", "REST", "Автоматизация"] },
  { id: "kotlin", title: "Kotlin без страха", track: "mobile", prerequisites: ["git-github"], safePractice: "Ограниченный учебный запуск выражений Kotlin и проверка структуры кода.", capstone: "Консольный менеджер привычек с тестами.", volumeTitles: ["Основы", "Функции", "Классы", "Тесты"] },
  { id: "android", title: "Android без страха", track: "mobile", prerequisites: ["kotlin"], safePractice: "Конструктор экранов и проверка состояния без доступа к устройству.", capstone: "Офлайн Android-приложение с навигацией и локальными данными.", volumeTitles: ["Экраны", "Состояние", "Данные", "Выпуск"] },
  { id: "csharp-unity", title: "C# и Unity без страха", track: "game", prerequisites: ["git-github"], safePractice: "Проверка коротких C#-скриптов и визуальная модель игровой сцены.", capstone: "Маленькая 2D-механика с меню и счётом.", volumeTitles: ["C#", "Сцены", "Механики", "Мини-игра"] },
  { id: "go", title: "Go без страха", track: "backend", prerequisites: ["git-github"], safePractice: "Локальный разбор Go-кода и предсказуемые HTTP-примеры без внешней сети.", capstone: "CLI-утилита или маленький HTTP-сервис.", volumeTitles: ["Основы", "Структуры", "Горутины", "Сервис"] },
  { id: "rust", title: "Rust без страха", track: "systems", prerequisites: ["git-github"], safePractice: "Визуализатор владения, заимствования и времени жизни на готовых примерах.", capstone: "Надёжная CLI-утилита с тестами.", volumeTitles: ["Основы", "Владение", "Типы", "Инструмент"] },
  { id: "game-modding", title: "Моддинг игр: с нуля до Pro", track: "game", prerequisites: ["git-github"], safePractice: "Конструктор мод-проекта, чек-лист прав и симулятор совместимости без доступа к игровым файлам.", capstone: "Собственный документированный косметический мод-проект для одиночной игры.", volumeTitles: ["Старт моддера", "Свой контент", "Сборка", "Автор мода"] },
];

export const seriesCourses: SeriesCourse[] = seeds.map((seed) => ({
  ...seed,
  volumes: volumes(seed.volumeTitles),
  darkOnly: true,
}));
