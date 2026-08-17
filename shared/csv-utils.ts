export type CsvSummary = { headers: string[]; rowCount: number; sample: string[][]; numeric: Array<{ column: string; count: number; sum: number; mean: number }> };

function parseRow(line: string, delimiter: string) {
  const values: string[] = []; let current = ""; let quoted = false;
  for (let index = 0; index < line.length; index += 1) { const char = line[index]; const next = line[index + 1]; if (char === '"' && quoted && next === '"') { current += '"'; index += 1; } else if (char === '"') quoted = !quoted; else if (char === delimiter && !quoted) { values.push(current.trim()); current = ""; } else current += char; }
  values.push(current.trim()); return values;
}

export function summarizeCsv(source: string): CsvSummary {
  const lines = source.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim()).slice(0, 201);
  if (lines.length < 2) throw new Error("Нужны заголовок и хотя бы одна строка данных.");
  const delimiter = lines[0].split(";").length > lines[0].split(",").length ? ";" : ",";
  const headers = parseRow(lines[0], delimiter).map((item, index) => item || `Колонка ${index + 1}`);
  const rows = lines.slice(1).map((line) => parseRow(line, delimiter));
  const numeric = headers.flatMap((column, index) => { const values = rows.map((row) => Number(row[index]?.replace(",", "."))).filter((value) => Number.isFinite(value)); if (!values.length) return []; const sum = values.reduce((total, value) => total + value, 0); return [{ column, count: values.length, sum, mean: sum / values.length }]; });
  return { headers, rowCount: rows.length, sample: rows.slice(0, 5), numeric };
}
