import type { PracticeVolume } from "./practice-challenges";

export type VolumeFinalTask = {
  volumeId: PracticeVolume;
  label: string;
  title: string;
  questions: VolumeFinalQuestion[];
};

export type VolumeFinalQuestion = {
  prompt: string;
  code?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export const volumeFinalTasks: VolumeFinalTask[] = [
  {
    volumeId: "junior",
    label: "Итоговая мини-задача · Junior",
    title: "Проверь основы Python",
    questions: [
      { prompt: "Какая строка напечатается после запуска кода?", code: 'name = "Лена"\nprint(f"Привет, {name}!")', options: ["Привет, name!", "Привет, Лена!", "Ошибка"], correctIndex: 1, explanation: "Переменная name хранит слово «Лена», а f-строка аккуратно вставляет его между фигурными скобками." },
      { prompt: "Что лучше сохранить в переменной age?", options: ["Число возраста", "Название переменной как текст", "Пустой экран"], correctIndex: 0, explanation: "Переменная — это коробка. В age удобно положить число, например 8." },
      { prompt: "Какой знак Python использует, чтобы положить значение в переменную?", options: ["=", "==", "?"], correctIndex: 0, explanation: "Один знак = кладёт значение в переменную. Два знака == сравнивают значения." },
    ],
  },
  {
    volumeId: "middle",
    label: "Итоговая мини-задача · Middle",
    title: "Проверь структуры данных",
    questions: [
      { prompt: "Какой метод добавит «молоко» в конец списка products?", code: 'products = ["хлеб"]', options: ['products.append("молоко")', 'products.print("молоко")', 'products.add("молоко")'], correctIndex: 0, explanation: "append() кладёт новый элемент в конец списка — как добавить ещё один предмет в корзину." },
      { prompt: "Где словарь хранит значение «Анна» по ключу name?", options: ['person["name"]', 'person.append("name")', 'person.name()'], correctIndex: 0, explanation: "У словаря есть ключи. В квадратных скобках указывают нужный ключ." },
      { prompt: "Что вернёт len([" + '"a", "b", "c"' + "])?", options: ["3", "2", "Ошибка"], correctIndex: 0, explanation: "len() считает элементы: в этом списке три предмета." },
    ],
  },
  {
    volumeId: "senior",
    label: "Итоговая мини-задача · Senior",
    title: "Проверь инженерные привычки",
    questions: [
      { prompt: "Что лучше всего проверяет автоматический тест?", code: 'expected = 5\nactual = 2 + 3\nprint("Результат совпал")', options: ["Что функция возвращает верный результат", "Цвет окна редактора", "Скорость печати разработчика"], correctIndex: 0, explanation: "Тест запускает маленькую проверку и сравнивает ожидаемый результат с настоящим. Так код становится надёжнее." },
      { prompt: "Зачем указывать тип str у параметра name?", options: ["Чтобы понятнее ожидать текст", "Чтобы удалить строку", "Чтобы интернет стал быстрее"], correctIndex: 0, explanation: "Подсказки типов объясняют людям и инструментам, какой вид данных ожидается." },
      { prompt: "Что делает await внутри асинхронной функции?", options: ["Ждёт результат без остановки остальных задач", "Удаляет функцию", "Всегда создаёт ошибку"], correctIndex: 0, explanation: "await даёт программе возможность подождать операцию, не превращая весь код в пробку." },
    ],
  },
  {
    volumeId: "web",
    label: "Итоговая мини-задача · Веб и боты",
    title: "Проверь бережную автоматизацию",
    questions: [
      { prompt: "Какой шаг безопаснее и правильнее перед сбором данных с сайта?", code: 'url = "https://example.com"\nprint("Сначала проверь правила сайта")', options: ["Проверить правила сайта, разрешение и ограничить частоту запросов", "Сразу отправить тысячи запросов", "Обойти запреты сайта"], correctIndex: 0, explanation: "Хороший бот уважает правила сайта, не перегружает сервер и работает только там, где у него есть разрешение." },
      { prompt: "Зачем сохранять готовый ответ в кэш?", options: ["Чтобы не просить сайт об одном и том же слишком часто", "Чтобы убрать все данные", "Чтобы обойти правила сайта"], correctIndex: 0, explanation: "Кэш — это записная книжка. Он уменьшает лишние запросы и помогает не нагружать сайт." },
      { prompt: "Где безопаснее хранить пароль или токен проекта?", options: ["В переменной окружения, не в коде", "Прямо в публичном файле", "В названии функции"], correctIndex: 0, explanation: "Секреты не кладут в исходный код. Их хранят отдельно, например в переменных окружения." },
    ],
  },
];

export function getVolumeFinalTask(volumeId: string | undefined) {
  return volumeFinalTasks.find((task) => task.volumeId === volumeId);
}
