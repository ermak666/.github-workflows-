import type { PracticeVolume } from "./practice-challenges";

export type VolumeFinalTask = {
  volumeId: PracticeVolume;
  label: string;
  title: string;
  prompt: string;
  code: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export const volumeFinalTasks: VolumeFinalTask[] = [
  {
    volumeId: "junior",
    label: "Итоговая мини-задача · Junior",
    title: "Коробка с именем",
    prompt: "Какая строка напечатается после запуска кода?",
    code: 'name = "Лена"\nprint(f"Привет, {name}!")',
    options: ["Привет, name!", "Привет, Лена!", "Ошибка"],
    correctIndex: 1,
    explanation: "Переменная name хранит слово «Лена», а f-строка аккуратно вставляет его между фигурными скобками.",
  },
  {
    volumeId: "middle",
    label: "Итоговая мини-задача · Middle",
    title: "Список покупок",
    prompt: "Какой метод добавит «молоко» в конец списка products?",
    code: 'products = ["хлеб"]',
    options: ['products.append("молоко")', 'products.print("молоко")', 'products.add("молоко")'],
    correctIndex: 0,
    explanation: "append() кладёт новый элемент в конец списка — как добавить ещё один предмет в корзину.",
  },
  {
    volumeId: "senior",
    label: "Итоговая мини-задача · Senior",
    title: "Проверка результата",
    prompt: "Что лучше всего проверяет автоматический тест?",
    code: 'expected = 5\nactual = 2 + 3\nprint("Результат совпал")',
    options: ["Что функция возвращает верный результат", "Цвет окна редактора", "Скорость печати разработчика"],
    correctIndex: 0,
    explanation: "Тест запускает маленькую проверку и сравнивает ожидаемый результат с настоящим. Так код становится надёжнее.",
  },
  {
    volumeId: "web",
    label: "Итоговая мини-задача · Веб и боты",
    title: "Бережный бот",
    prompt: "Какой шаг безопаснее и правильнее перед сбором данных с сайта?",
    code: 'url = "https://example.com"\nprint("Сначала проверь правила сайта")',
    options: ["Проверить правила сайта, разрешение и ограничить частоту запросов", "Сразу отправить тысячи запросов", "Обойти запреты сайта"],
    correctIndex: 0,
    explanation: "Хороший бот уважает правила сайта, не перегружает сервер и работает только там, где у него есть разрешение.",
  },
];

export function getVolumeFinalTask(volumeId: string | undefined) {
  return volumeFinalTasks.find((task) => task.volumeId === volumeId);
}
