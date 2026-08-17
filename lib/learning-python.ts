type Value = string | number | boolean;
type Environment = Record<string, Value>;

export type LearningRunResult = { output: string[]; error?: string; consumedInputs: number };

const forbidden = /\b(import|open|exec|eval|__|os\.|sys\.|requests\.|socket|subprocess|while\b|for\b|def\b|class\b)\b/;
const indentation = (line: string) => line.match(/^\s*/)?.[0].length ?? 0;

function unquote(value: string) { return value.slice(1, -1); }
function asNumber(value: Value) { return typeof value === "number" ? value : Number(value); }

function evaluate(raw: string, env: Environment, inputs: string[], inputIndex: { value: number }): Value {
  const value = raw.trim();
  if (/^f["']/.test(value)) return unquote(value.slice(1)).replace(/\{([A-Za-z_]\w*)\}/g, (_, key) => String(env[key] ?? ""));
  if (/^["'].*["']$/.test(value)) return unquote(value);
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if (value === "True") return true;
  if (value === "False") return false;
  if (/^(int|float|str)\s*\(\s*input\s*\(/.test(value)) {
    const input = inputs[inputIndex.value++] ?? "";
    if (value.startsWith("int")) return Number.parseInt(input, 10) || 0;
    if (value.startsWith("float")) return Number.parseFloat(input) || 0;
    return input;
  }
  if (/^input\s*\(/.test(value)) return inputs[inputIndex.value++] ?? "";
  const operation = value.match(/^([A-Za-z_]\w*|-?\d+(?:\.\d+)?)\s*([+\-*/])\s*([A-Za-z_]\w*|-?\d+(?:\.\d+)?)$/);
  if (operation) {
    const left = env[operation[1]] ?? Number(operation[1]); const right = env[operation[3]] ?? Number(operation[3]);
    if (operation[2] === "+" && (typeof left === "string" || typeof right === "string")) return `${left}${right}`;
    if (operation[2] === "+") return asNumber(left) + asNumber(right);
    if (operation[2] === "-") return asNumber(left) - asNumber(right);
    if (operation[2] === "*") return asNumber(left) * asNumber(right);
    if (operation[2] === "/") return asNumber(left) / asNumber(right);
  }
  if (value in env) return env[value];
  throw new Error(`Пока не умею выполнить выражение: ${value}`);
}

function condition(raw: string, env: Environment, inputs: string[], inputIndex: { value: number }) {
  const match = raw.match(/^(.+?)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
  if (!match) throw new Error("В условии используйте ==, !=, >, <, >= или <=.");
  const left = evaluate(match[1], env, inputs, inputIndex); const right = evaluate(match[3], env, inputs, inputIndex);
  if (match[2] === "==") return left === right; if (match[2] === "!=") return left !== right;
  if (match[2] === ">=") return asNumber(left) >= asNumber(right); if (match[2] === "<=") return asNumber(left) <= asNumber(right);
  return match[2] === ">" ? asNumber(left) > asNumber(right) : asNumber(left) < asNumber(right);
}

export function runLearningPython(code: string, preparedInput = ""): LearningRunResult {
  if (forbidden.test(code)) return { output: [], error: "Учебный запуск поддерживает только безопасные основы: переменные, input(), if/else, print() и простые вычисления.", consumedInputs: 0 };
  const lines = code.replace(/\r/g, "").split("\n"); const env: Environment = {}; const output: string[] = []; const inputs = preparedInput.split("\n"); const inputIndex = { value: 0 };
  try {
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index]; const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || indentation(line) > 0) continue;
      const ifMatch = trimmed.match(/^if\s+(.+):$/);
      if (ifMatch) {
        const enabled = condition(ifMatch[1], env, inputs, inputIndex); const parentIndent = indentation(line); index += 1;
        while (index < lines.length && (indentation(lines[index]) > parentIndent || !lines[index].trim())) {
          const nested = lines[index].trim();
          if (enabled && nested) {
            const increment = nested.match(/^([A-Za-z_]\w*)\s*\+=\s*(.+)$/); const nestedPrint = nested.match(/^print\((.+)\)$/);
            if (increment) env[increment[1]] = asNumber(env[increment[1]] ?? 0) + asNumber(evaluate(increment[2], env, inputs, inputIndex));
            else if (nestedPrint) output.push(String(evaluate(nestedPrint[1], env, inputs, inputIndex)));
          }
          index += 1;
        }
        index -= 1; continue;
      }
      const assignment = trimmed.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
      const increment = trimmed.match(/^([A-Za-z_]\w*)\s*\+=\s*(.+)$/);
      const print = trimmed.match(/^print\((.+)\)$/);
      if (assignment) env[assignment[1]] = evaluate(assignment[2], env, inputs, inputIndex);
      else if (increment) env[increment[1]] = asNumber(env[increment[1]] ?? 0) + asNumber(evaluate(increment[2], env, inputs, inputIndex));
      else if (print) output.push(String(evaluate(print[1], env, inputs, inputIndex)));
      else throw new Error(`Пока не умею выполнить строку: ${trimmed}`);
    }
    return { output, consumedInputs: inputIndex.value };
  } catch (error) { return { output, error: error instanceof Error ? error.message : "Не удалось выполнить пример.", consumedInputs: inputIndex.value }; }
}
