export type Value = string | number | boolean | Value[] | { [key: string]: Value };
type Environment = Record<string, Value>;
type Dictionary = { [key: string]: Value };

export type LearningRunResult = { output: string[]; variables: Record<string, Value>; error?: string; consumedInputs: number };

const forbidden = /\b(import|open|exec|eval|__|os\.|sys\.|requests\.|socket|subprocess|while\b|for\b|def\b|class\b)\b/;
const indentation = (line: string) => line.match(/^\s*/)?.[0].length ?? 0;

function unquote(value: string) { return value.slice(1, -1); }
function isDictionary(value: Value): value is Dictionary { return typeof value === "object" && value !== null && !Array.isArray(value); }
function asNumber(value: Value) {
  if (typeof value === "number") return value;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "string") {
    const result = Number(value);
    if (!Number.isNaN(result)) return result;
  }
  throw new Error(`Нельзя использовать «${formatValue(value)}» как число.`);
}
function formatValue(value: Value): string {
  if (typeof value === "string") return value;
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return `[${value.map((item) => typeof item === "string" ? JSON.stringify(item) : formatValue(item)).join(", ")}]`;
  return `{${Object.entries(value).map(([key, item]) => `${JSON.stringify(key)}: ${typeof item === "string" ? JSON.stringify(item) : formatValue(item)}`).join(", ")}}`;
}
function splitTopLevel(raw: string, separator: string) {
  const parts: string[] = []; let start = 0; let quote = ""; let depth = 0; let escaped = false;
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (quote) { if (char === quote && !escaped) quote = ""; escaped = char === "\\" && !escaped; continue; }
    if (char === "'" || char === '"') { quote = char; continue; }
    if (char === "[" || char === "{" || char === "(") depth += 1;
    if (char === "]" || char === "}" || char === ")") depth -= 1;
    if (char === separator && depth === 0) { parts.push(raw.slice(start, index).trim()); start = index + 1; }
  }
  parts.push(raw.slice(start).trim());
  return parts.filter(Boolean);
}
function findTopLevelColon(raw: string) {
  let quote = ""; let depth = 0; let escaped = false;
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (quote) { if (char === quote && !escaped) quote = ""; escaped = char === "\\" && !escaped; continue; }
    if (char === "'" || char === '"') { quote = char; continue; }
    if (char === "[" || char === "{" || char === "(") depth += 1;
    if (char === "]" || char === "}" || char === ")") depth -= 1;
    if (char === ":" && depth === 0) return index;
  }
  return -1;
}
function asKey(value: Value) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  throw new Error("Ключ словаря должен быть строкой, числом или True/False.");
}
function asListIndex(value: Value) {
  const index = asNumber(value);
  if (!Number.isInteger(index) || index < 0) throw new Error("Индекс списка должен быть целым числом 0 или больше.");
  return index;
}

function evaluate(raw: string, env: Environment, inputs: string[], inputIndex: { value: number }): Value {
  const value = raw.trim();
  if (/^f["']/.test(value)) return unquote(value.slice(1)).replace(/\{([^{}]+)\}/g, (_, expression) => formatValue(evaluate(expression, env, inputs, inputIndex)));
  if (/^["'].*["']$/.test(value)) return unquote(value);
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if (value === "True") return true;
  if (value === "False") return false;
  if (value.startsWith("[") && value.endsWith("]")) {
    const inside = value.slice(1, -1).trim();
    return inside ? splitTopLevel(inside, ",").map((item) => evaluate(item, env, inputs, inputIndex)) : [];
  }
  if (value.startsWith("{") && value.endsWith("}")) {
    const result: Dictionary = Object.create(null) as Dictionary; const inside = value.slice(1, -1).trim();
    if (!inside) return result;
    for (const pair of splitTopLevel(inside, ",")) {
      const separator = findTopLevelColon(pair);
      if (separator === -1) throw new Error("В словаре после ключа поставьте двоеточие: {\"ключ\": значение}.");
      const key = asKey(evaluate(pair.slice(0, separator), env, inputs, inputIndex));
      result[key] = evaluate(pair.slice(separator + 1), env, inputs, inputIndex);
    }
    return result;
  }
  if (/^(int|float|str)\s*\(\s*input\s*\(/.test(value)) {
    const input = inputs[inputIndex.value++] ?? "";
    if (value.startsWith("int")) return Number.parseInt(input, 10) || 0;
    if (value.startsWith("float")) return Number.parseFloat(input) || 0;
    return input;
  }
  if (/^input\s*\(/.test(value)) return inputs[inputIndex.value++] ?? "";
  const conversion = value.match(/^(int|float|str)\s*\((.+)\)$/);
  if (conversion) {
    const source = evaluate(conversion[2], env, inputs, inputIndex);
    if (conversion[1] === "int") {
      const converted = Number.parseInt(String(source), 10);
      if (Number.isNaN(converted)) throw new Error(`Нельзя превратить «${formatValue(source)}» в целое число.`);
      return converted;
    }
    if (conversion[1] === "float") {
      const converted = Number.parseFloat(String(source));
      if (Number.isNaN(converted)) throw new Error(`Нельзя превратить «${formatValue(source)}» в дробное число.`);
      return converted;
    }
    return formatValue(source);
  }
  const indexed = value.match(/^([A-Za-z_]\w*)\s*\[(.+)\]$/);
  if (indexed) {
    const container = env[indexed[1]];
    if (container === undefined) throw new Error(`Переменная «${indexed[1]}» ещё не создана.`);
    const key = evaluate(indexed[2], env, inputs, inputIndex);
    if (Array.isArray(container)) {
      const index = asListIndex(key);
      if (index >= container.length) throw new Error(`В списке нет элемента с номером ${index}.`);
      return container[index];
    }
    if (isDictionary(container)) {
      const dictionaryKey = asKey(key);
      if (!Object.prototype.hasOwnProperty.call(container, dictionaryKey)) throw new Error(`В словаре пока нет ключа «${dictionaryKey}».`);
      return container[dictionaryKey];
    }
    throw new Error(`К переменной «${indexed[1]}» нельзя обратиться по ключу или номеру.`);
  }
  const operation = value.match(/^([A-Za-z_]\w*|-?\d+(?:\.\d+)?)\s*([+\-*/])\s*([A-Za-z_]\w*|-?\d+(?:\.\d+)?)$/);
  if (operation) {
    const left = env[operation[1]] ?? Number(operation[1]); const right = env[operation[3]] ?? Number(operation[3]);
    if (operation[2] === "+" && (typeof left === "string" || typeof right === "string")) return `${formatValue(left)}${formatValue(right)}`;
    if (operation[2] === "+") return asNumber(left) + asNumber(right);
    if (operation[2] === "-") return asNumber(left) - asNumber(right);
    if (operation[2] === "*") return asNumber(left) * asNumber(right);
    if (operation[2] === "/") return asNumber(left) / asNumber(right);
  }
  if (value in env) return env[value];
  throw new Error(`Пока не умею выполнить выражение: ${value}`);
}

function condition(raw: string, env: Environment, inputs: string[], inputIndex: { value: number }) {
  const membership = raw.match(/^(.+?)\s+(not\s+in|in)\s+(.+)$/);
  if (membership) {
    const needle = evaluate(membership[1], env, inputs, inputIndex); const haystack = evaluate(membership[3], env, inputs, inputIndex);
    const included = Array.isArray(haystack) ? haystack.some((item) => item === needle) : isDictionary(haystack) ? Object.prototype.hasOwnProperty.call(haystack, asKey(needle)) : typeof haystack === "string" ? haystack.includes(formatValue(needle)) : false;
    return membership[2].replace(/\s+/g, " ") === "in" ? included : !included;
  }
  const match = raw.match(/^(.+?)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
  if (!match) throw new Error("В условии используйте ==, !=, >, <, >=, <= или in.");
  const left = evaluate(match[1], env, inputs, inputIndex); const right = evaluate(match[3], env, inputs, inputIndex);
  if (match[2] === "==") return left === right; if (match[2] === "!=") return left !== right;
  if (match[2] === ">=") return asNumber(left) >= asNumber(right); if (match[2] === "<=") return asNumber(left) <= asNumber(right);
  return match[2] === ">" ? asNumber(left) > asNumber(right) : asNumber(left) < asNumber(right);
}

function setIndexedValue(name: string, keyExpression: string, valueExpression: string, env: Environment, inputs: string[], inputIndex: { value: number }) {
  const container = env[name];
  if (container === undefined) throw new Error(`Сначала создайте переменную «${name}».`);
  const key = evaluate(keyExpression, env, inputs, inputIndex); const item = evaluate(valueExpression, env, inputs, inputIndex);
  if (Array.isArray(container)) { container[asListIndex(key)] = item; return; }
  if (isDictionary(container)) { container[asKey(key)] = item; return; }
  throw new Error(`В «${name}» нельзя записать элемент по ключу или номеру.`);
}

function executeStatement(trimmed: string, env: Environment, output: string[], inputs: string[], inputIndex: { value: number }) {
  const indexedAssignment = trimmed.match(/^([A-Za-z_]\w*)\s*\[(.+)\]\s*=\s*(.+)$/);
  const assignment = trimmed.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
  const increment = trimmed.match(/^([A-Za-z_]\w*)\s*\+=\s*(.+)$/);
  const append = trimmed.match(/^([A-Za-z_]\w*)\.append\((.*)\)$/);
  const print = trimmed.match(/^print\((.+)\)$/);
  if (indexedAssignment) setIndexedValue(indexedAssignment[1], indexedAssignment[2], indexedAssignment[3], env, inputs, inputIndex);
  else if (assignment) env[assignment[1]] = evaluate(assignment[2], env, inputs, inputIndex);
  else if (increment) env[increment[1]] = asNumber(env[increment[1]] ?? 0) + asNumber(evaluate(increment[2], env, inputs, inputIndex));
  else if (append) {
    const list = env[append[1]];
    if (!Array.isArray(list)) throw new Error(`«${append[1]}» должен быть списком, чтобы использовать append().`);
    list.push(evaluate(append[2], env, inputs, inputIndex));
  } else if (print) output.push(formatValue(evaluate(print[1], env, inputs, inputIndex)));
  else throw new Error(`Пока не умею выполнить строку: ${trimmed}`);
}

export function runLearningPython(code: string, preparedInput = ""): LearningRunResult {
  if (forbidden.test(code)) return { output: [], variables: {}, error: "Учебный запуск поддерживает только безопасные основы: переменные, словари, списки, input(), if/else, print() и простые вычисления.", consumedInputs: 0 };
  const lines = code.replace(/\r/g, "").split("\n"); const env: Environment = {}; const output: string[] = []; const inputs = preparedInput.split("\n"); const inputIndex = { value: 0 };
  try {
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index]; const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || indentation(line) > 0) continue;
      const ifMatch = trimmed.match(/^if\s+(.+):$/);
      if (ifMatch) {
        const enabled = condition(ifMatch[1], env, inputs, inputIndex); const parentIndent = indentation(line); let inElse = false; index += 1;
        while (index < lines.length) {
          const nestedLine = lines[index]; const nested = nestedLine.trim(); const nestedIndent = indentation(nestedLine);
          if (!nested) { index += 1; continue; }
          if (nestedIndent === parentIndent && nested === "else:") { inElse = true; index += 1; continue; }
          if (nestedIndent <= parentIndent) break;
          if ((enabled && !inElse) || (!enabled && inElse)) executeStatement(nested, env, output, inputs, inputIndex);
          index += 1;
        }
        index -= 1; continue;
      }
      executeStatement(trimmed, env, output, inputs, inputIndex);
    }
    return { output, variables: { ...env }, consumedInputs: inputIndex.value };
  } catch (error) { return { output, variables: { ...env }, error: error instanceof Error ? error.message : "Не удалось выполнить пример.", consumedInputs: inputIndex.value }; }
}
