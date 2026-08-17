export type CheatItem = { id: string; group: string; title: string; code: string; note: string };

export const cheatItems: CheatItem[] = [
  { id: "print", group: "Основы", title: "Вывести текст", code: 'print("Привет!")', note: "Текст пишется внутри кавычек." },
  { id: "input", group: "Основы", title: "Спросить пользователя", code: 'name = input("Имя: ")', note: "Ответ всегда приходит как строка." },
  { id: "number", group: "Основы", title: "Сделать ввод числом", code: 'age = int(input("Возраст: "))', note: "Для дробей используйте float()." },
  { id: "condition", group: "Условия", title: "Если / иначе", code: 'if age >= 18:\n    print("Можно")\nelse:\n    print("Пока нельзя")', note: "Отступ из четырёх пробелов — часть синтаксиса Python." },
  { id: "loop", group: "Циклы", title: "Пройти по списку", code: 'for task in tasks:\n    print(task)', note: "Переменная task получает элементы по одному." },
  { id: "function", group: "Функции", title: "Вернуть результат", code: 'def add(a, b):\n    return a + b', note: "return отдаёт результат наружу функции." },
  { id: "list", group: "Данные", title: "Добавить в список", code: 'tasks.append("уроки")', note: "append добавляет элемент в конец списка." },
  { id: "dict", group: "Данные", title: "Безопасно взять ключ", code: 'city = user.get("city", "не указан")', note: "get возвращает запасное значение, если ключа нет." },
  { id: "json", group: "Файлы", title: "Сохранить JSON", code: 'json.dump(data, file, ensure_ascii=False)', note: "ensure_ascii=False сохраняет русские буквы читаемыми." },
  { id: "try", group: "Надёжность", title: "Поймать ошибку", code: 'try:\n    age = int(text)\nexcept ValueError:\n    print("Нужно число")', note: "Ловите только ожидаемые типы ошибок." },
  { id: "request", group: "API", title: "Безопасный GET-запрос", code: 'r = requests.get(url, timeout=10)\nr.raise_for_status()', note: "Для сети всегда указывайте timeout." },
  { id: "dataclass", group: "Senior", title: "Класс-данные", code: '@dataclass\nclass Task:\n    title: str\n    done: bool = False', note: "dataclass создаёт типовой __init__ и удобное представление." },
  { id: "async", group: "Senior", title: "Асинхронная функция", code: 'async def main():\n    await asyncio.sleep(1)\n\nasyncio.run(main())', note: "asyncio подходит прежде всего для ожидания сетевых операций." },
  { id: "robots", group: "Веб", title: "Проверить robots.txt", code: 'rp.can_fetch("learning-bot", url)', note: "Проверяйте правила и останавливайтесь при запрете." },
  { id: "systemd", group: "Боты", title: "Перезапуск службы", code: 'sudo systemctl restart mybot.service\nsudo systemctl status mybot.service', note: "Секреты не добавляйте в файл службы или Git." },
];
