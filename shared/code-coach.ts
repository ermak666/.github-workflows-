export type CodeCoachFeedback = {
  status: "needs_fix" | "looks_good" | "caution";
  headline: string;
  issues: string[];
  hint: string;
  nextStep: string;
};

export function fallbackCodeFeedback(code: string): CodeCoachFeedback {
  const source = code.trim();
  if (!source) return { status: "needs_fix", headline: "Пока нет кода", issues: ["Напишите хотя бы одну строку, которую хотите разобрать."], hint: "Начните с самого маленького шага задания.", nextStep: "Введите код и попросите помощника проверить его." };
  if (/\b(api[_-]?key|password|secret|token)\b\s*=/i.test(source)) return { status: "caution", headline: "Похоже на секретные данные", issues: ["Не отправляйте реальные ключи, пароли или токены в помощник."], hint: "Замените значение на безопасный пример вроде YOUR_TOKEN.", nextStep: "Отредактируйте код и запустите разбор снова." };
  if (/^\s*(if|for|while|def)\b[^\n:]*$/m.test(source)) return { status: "needs_fix", headline: "Проверьте двоеточие", issues: ["После условия, цикла или определения функции обычно нужно двоеточие."], hint: "Посмотрите на строку, которая начинается с if, for, while или def.", nextStep: "Добавьте двоеточие и повторите проверку." };
  if (/^\s*(if|for|while|def).*:\s*\n\S/m.test(source)) return { status: "needs_fix", headline: "Проверьте отступ", issues: ["Строки внутри условия, цикла или функции должны иметь отступ."], hint: "Добавьте четыре пробела перед действием внутри блока.", nextStep: "Исправьте отступ и повторите проверку." };
  return { status: "looks_good", headline: "Основа выглядит понятной", issues: [], hint: "Сверьте названия переменных и вывод с условием задачи.", nextStep: "Запустите встроенную проверку задания, затем попробуйте изменить один пример самостоятельно." };
}

export function normalizeCoachFeedback(value: unknown, fallback: CodeCoachFeedback): CodeCoachFeedback {
  if (!value || typeof value !== "object") return fallback;
  const candidate = value as Partial<CodeCoachFeedback>;
  const status = candidate.status === "needs_fix" || candidate.status === "looks_good" || candidate.status === "caution" ? candidate.status : fallback.status;
  const string = (value: unknown, backup: string, limit: number) => typeof value === "string" && value.trim() ? value.trim().slice(0, limit) : backup;
  return { status, headline: string(candidate.headline, fallback.headline, 140), issues: Array.isArray(candidate.issues) ? candidate.issues.filter((item): item is string => typeof item === "string").slice(0, 3).map((item) => item.slice(0, 240)) : fallback.issues, hint: string(candidate.hint, fallback.hint, 360), nextStep: string(candidate.nextStep, fallback.nextStep, 240) };
}
