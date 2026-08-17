export type ProjectTrackId = "bot" | "data" | "api" | "automation";
export type ProjectTrack = { id: ProjectTrackId; title: string; icon: string; goal: string; skills: string[]; steps: string[]; deliverable: string; readme: string };

export const projectTracks: ProjectTrack[] = [
  { id: "bot", title: "Полезный бот", icon: "BOT", goal: "Собрать бота, который принимает простую команду и отвечает понятным сообщением.", skills: ["Функции", "Словари", "API", "Ошибки"], steps: ["Повторить функции и словари", "Сделать обработчик одной команды", "Добавить безопасную проверку ввода", "Написать 2 тестовых сценария"], deliverable: "Бот с README и двумя примерами команд.", readme: "# Полезный бот\n\n## Что умеет\nКоротко опишите одну полезную команду.\n\n## Как запустить\n1. Установите зависимости.\n2. Добавьте настройки в переменные окружения.\n3. Запустите файл main.py." },
  { id: "data", title: "Анализ данных", icon: "DATA", goal: "Исследовать небольшую таблицу, посчитать показатели и сделать честный вывод.", skills: ["Pandas", "NumPy", "CSV", "Визуализация"], steps: ["Загрузить безопасный CSV", "Проверить столбцы и пропуски", "Посчитать среднее и сумму", "Сформулировать вывод в 2 предложениях"], deliverable: "Ноутбук или скрипт с выводом и кратким README.", readme: "# Мини-анализ данных\n\n## Вопрос\nКакой вопрос отвечает таблица?\n\n## Данные\nОпишите столбцы и ограничения.\n\n## Вывод\nУкажите 1–2 вывода, которые действительно подтверждаются данными." },
  { id: "api", title: "Клиент API", icon: "API", goal: "Сделать маленький клиент, который запрашивает разрешённый API и аккуратно показывает ответ.", skills: ["requests", "JSON", "HTTP", "Тесты"], steps: ["Выбрать официальный публичный API", "Сделать запрос с timeout", "Проверить ошибку ответа", "Сохранить один пример JSON"], deliverable: "Клиент с обработкой ошибок и примером ответа.", readme: "# API-клиент\n\n## Источник данных\nУкажите официальный API и его правила.\n\n## Безопасность\nНе храните ключи в коде: используйте переменные окружения.\n\n## Пример\nОпишите ожидаемый ответ и обработку ошибки." },
  { id: "automation", title: "Автоматизация", icon: "AUTO", goal: "Автоматизировать повторяющееся действие с файлами или разрешённым веб-сервисом.", skills: ["pathlib", "JSON", "Логи", "Кэш"], steps: ["Описать повторяющуюся работу", "Сделать тест на копии данных", "Добавить лог и обработку ошибок", "Проверить правила сервиса и лимиты"], deliverable: "Скрипт с безопасным режимом проверки и README.", readme: "# Скрипт автоматизации\n\n## Задача\nЧто автоматизируется и зачем?\n\n## Безопасность\nСкрипт работает только с разрешёнными данными и не обходит защиту сайтов.\n\n## Проверка\nОпишите тестовый запуск на копии данных." },
];

export const reviewChecklist = ["Есть ясная цель проекта", "Названия переменных понятны", "Ошибки обрабатываются без падения", "Секреты не записаны в коде", "Есть хотя бы один тестовый сценарий", "README объясняет запуск и ограничения"];

export const skillDomains = ["Python", "Git", "SQL", "Тесты", "API", "Docker"] as const;
export type SkillDomain = typeof skillDomains[number];

export const apiProjectTemplates = [
  { title: "requests-клиент", code: "import requests\n\nresponse = requests.get(\"https://api.example.com/items\", timeout=10)\nresponse.raise_for_status()\nitems = response.json()\nprint(items)" },
  { title: "FastAPI: один маршрут", code: "from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get(\"/health\")\ndef health():\n    return {\"status\": \"ok\"}" },
  { title: "Flask: один маршрут", code: "from flask import Flask, jsonify\n\napp = Flask(__name__)\n\n@app.get(\"/health\")\ndef health():\n    return jsonify(status=\"ok\")" },
];
