import * as Clipboard from "expo-clipboard";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { exportMasteryBackup, importMasteryBackup, loadMasteryProgress, saveMasteryProgress, type MasteryProgress } from "@/lib/mastery-progress";
import { codeReadingDrills, debugDrills, finalDiagnostic, milestoneProjects, planOptions, portfolioChecklist, professionalTracks, styleChecks, topicDependencies } from "@/shared/mastery-data";

type Section = "practice" | "plan" | "projects" | "tools" | "final";
const sections: { id: Section; label: string }[] = [
  { id: "practice", label: "Практика" }, { id: "plan", label: "План" }, { id: "projects", label: "Проекты" }, { id: "tools", label: "Инструменты" }, { id: "final", label: "Итог" },
];

const tone = { info: "bg-[#E9EAFE]", dark: "bg-[#111426]", warm: "bg-[#FFF3D8]", mint: "bg-[#E4F8EE]" };

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })} className={`rounded-xl border p-3 ${selected ? "border-primary bg-[#E9EAFE]" : "border-border bg-background"}`}><Text className={`text-sm font-semibold ${selected ? "text-primary" : "text-foreground"}`}>{selected ? "✓ " : ""}{label}</Text></Pressable>;
}

export default function MasteryLabScreen() {
  const router = useRouter();
  const [section, setSection] = useState<Section>("practice");
  const [progress, setProgress] = useState<MasteryProgress | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [explanation, setExplanation] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [gitMessage, setGitMessage] = useState("feat: добавить понятную команду");
  const [backupInput, setBackupInput] = useState("");

  const refresh = useCallback(() => { void loadMasteryProgress().then(setProgress); }, []);
  useFocusEffect(refresh);
  const save = async (patch: Partial<MasteryProgress>) => { if (!progress) return; const next = { ...progress, ...patch }; setProgress(await saveMasteryProgress(next)); };
  const today = new Date().toISOString().slice(0, 10);
  const knownItems = useMemo(() => [...topicDependencies.map((item) => item.topic), ...professionalTracks.map((item) => item.title), ...milestoneProjects.map((item) => item.title)], []);
  const searchResults = search.trim() ? knownItems.filter((item) => item.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 6) : [];

  if (!progress) return <ScreenContainer className="items-center justify-center"><Text className="text-muted">Открываем мастерскую…</Text></ScreenContainer>;

  const toggleSolved = async (field: "debugSolved" | "codeReadingSolved" | "styleChecks", id: string) => {
    const current = progress[field];
    await save({ [field]: current.includes(id) ? current.filter((item) => item !== id) : [...current, id] } as Partial<MasteryProgress>);
  };
  const activePlan = planOptions.find((option) => option.id === progress.activePlan) ?? planOptions[1];
  const diagnosticScore = finalDiagnostic.filter((item) => progress.diagnosticAnswers[item.id] === item.answer).length;

  const practice = <View className="gap-4">
    <View className={`${tone.dark} rounded-3xl p-5`}><Text className="text-xs font-bold tracking-wide text-[#C9C9FF]">ПРАКТИКА БЕЗ УГАДЫВАНИЯ</Text><Text className="mt-2 text-xl font-bold text-white">Отладка, чтение и объяснение — три мышцы программиста</Text><Text className="mt-2 text-sm leading-5 text-[#D3D7FF]">Циклы for/range и пошаговый след уже доступны в учебном запуске уроков. Здесь тренируем то, что помогает видеть ошибки раньше.</Text></View>
    <View className="rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">Лаборатория отладки</Text>{debugDrills.map((drill) => { const answer = answers[drill.id]; const solved = progress.debugSolved.includes(drill.id); return <View key={drill.id} className="mt-4 rounded-2xl bg-background p-4"><Text className="font-bold text-foreground">{drill.title}</Text><Text className="mt-2 rounded-lg bg-[#111426] p-3 font-mono text-xs leading-5 text-white">{drill.broken}</Text><Text className="mt-3 text-sm text-muted">{drill.question}</Text><View className="mt-2 gap-2">{drill.options.map((option, index) => <Choice key={option} label={option} selected={answer === index} onPress={() => setAnswers((current) => ({ ...current, [drill.id]: index }))} />)}</View>{answer !== undefined ? <View className={`mt-3 rounded-xl p-3 ${answer === drill.answer ? tone.mint : tone.warm}`}><Text className={`text-sm leading-5 ${answer === drill.answer ? "text-success" : "text-warning"}`}>{drill.explanation}</Text>{answer === drill.answer && !solved ? <Pressable onPress={() => toggleSolved("debugSolved", drill.id)} className="mt-2 self-start rounded-lg bg-success px-3 py-2"><Text className="text-xs font-bold text-white">Отметить как разобранное</Text></Pressable> : null}</View> : null}</View>; })}</View>
    <View className="rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">Тренажёр чтения чужого кода</Text>{codeReadingDrills.map((drill) => { const answer = answers[drill.id]; const solved = progress.codeReadingSolved.includes(drill.id); return <View key={drill.id} className="mt-4 rounded-2xl bg-background p-4"><Text className="font-mono text-xs leading-5 text-foreground">{drill.code}</Text><Text className="mt-3 text-sm font-semibold text-foreground">{drill.question}</Text><View className="mt-2 gap-2">{drill.options.map((option, index) => <Choice key={option} label={option} selected={answer === index} onPress={() => setAnswers((current) => ({ ...current, [drill.id]: index }))} />)}</View>{answer !== undefined ? <Text className={`mt-3 text-sm leading-5 ${answer === drill.answer ? "text-success" : "text-warning"}`}>{drill.explanation}</Text> : null}{answer === drill.answer && !solved ? <Pressable onPress={() => toggleSolved("codeReadingSolved", drill.id)} className="mt-2 self-start rounded-lg bg-primary px-3 py-2"><Text className="text-xs font-bold text-white">Я понял(а) ход кода</Text></Pressable> : null}</View>; })}</View>
    <View className="rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">Объясни код своими словами</Text><Text className="mt-2 text-sm leading-5 text-muted">Напишите: «сначала…, затем…, потому что…». Это укрепляет понимание лучше, чем просто читать ответ.</Text><TextInput value={explanation} onChangeText={setExplanation} multiline textAlignVertical="top" placeholder="Например: цикл берёт каждое число, проверяет условие и печатает подходящие…" placeholderTextColor="#667085" className="mt-3 min-h-28 rounded-xl border border-border bg-background p-3 text-foreground" /><Pressable onPress={() => { if (!explanation.trim()) { setMessage("Сначала опишите ход кода хотя бы одной фразой."); return; } void save({ explanations: { ...progress.explanations, today: explanation.trim() } }); setMessage("Объяснение сохранено. Вернитесь к нему завтра и сравните с новым пониманием."); }} className="mt-3 items-center rounded-xl bg-primary py-3"><Text className="font-bold text-white">Сохранить объяснение</Text></Pressable></View>
    <View className="rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">Мягкий code review</Text>{styleChecks.map((check) => <View key={check.id} className="mt-4 rounded-2xl bg-background p-4"><Text className="font-bold text-foreground">{check.title}</Text><Text className="mt-2 font-mono text-xs text-warning">Было: {check.bad}</Text><Text className="mt-1 font-mono text-xs text-success">Лучше: {check.better}</Text><Text className="mt-2 text-sm text-muted">{check.rule}</Text><Pressable onPress={() => toggleSolved("styleChecks", check.id)} className="mt-3 self-start rounded-lg bg-[#E9EAFE] px-3 py-2"><Text className="text-xs font-bold text-primary">{progress.styleChecks.includes(check.id) ? "✓ Понял(а)" : "Отметить правило"}</Text></Pressable></View>)}</View>
  </View>;

  const plan = <View className="gap-4">
    <View className={`${tone.info} rounded-3xl p-5`}><Text className="text-xs font-bold text-primary">ПЕРСОНАЛЬНЫЙ РИТМ</Text><Text className="mt-2 text-xl font-bold text-foreground">{activePlan.title}</Text><Text className="mt-2 text-sm leading-5 text-[#42446F]">{activePlan.detail}</Text></View>
    <View className="rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">Выберите учебный план</Text><View className="mt-3 gap-2">{planOptions.map((option) => <Choice key={option.id} label={option.title} selected={progress.activePlan === option.id} onPress={() => void save({ activePlan: option.id })} />)}</View></View>
    <View className="rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">Режим «5 минут в день»</Text><Text className="mt-2 text-sm text-muted">Сегодня: один цикл, одна ошибка или один короткий ответ. Маленькая победа сохраняет контакт с учебой.</Text><Pressable onPress={() => { if (!progress.fiveMinuteDays.includes(today)) void save({ fiveMinuteDays: [...progress.fiveMinuteDays, today] }); }} className="mt-3 items-center rounded-xl bg-primary py-3"><Text className="font-bold text-white">{progress.fiveMinuteDays.includes(today) ? "✓ Сегодня уже было 5 минут" : "Отметить 5 минут"}</Text></Pressable><Text className="mt-2 text-xs text-muted">Небольших учебных дней: {progress.fiveMinuteDays.length}</Text></View>
    <View className="rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">Карта зависимостей тем</Text>{topicDependencies.map((item) => <View key={item.topic} className="mt-3 rounded-xl bg-background p-3"><Text className="font-bold text-foreground">{item.topic}</Text><Text className="mt-1 text-xs text-muted">Нужно: {item.needs} → открывает: {item.opens}</Text></View>)}</View>
    <View className="rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">Поиск по мастерской</Text><TextInput value={search} onChangeText={setSearch} placeholder="Например: SQLite, Git, циклы" placeholderTextColor="#667085" className="mt-3 rounded-xl border border-border bg-background px-3 py-3 text-foreground" />{searchResults.map((item) => <Text key={item} className="mt-2 rounded-lg bg-[#E9EAFE] p-2 text-sm font-semibold text-primary">⌕ {item}</Text>)}</View>
    <View className="rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">Недавно открыто</Text>{progress.lastOpened.length ? progress.lastOpened.map((item) => <Pressable key={item.id} onPress={() => router.push(`/lesson/${item.id}` as never)} className="mt-3 rounded-xl bg-background p-3"><Text className="font-bold text-foreground">{item.title}</Text><Text className="mt-1 text-xs text-muted">Открыть снова →</Text></Pressable>) : <Text className="mt-2 text-sm text-muted">Откройте любой урок — он появится здесь для быстрого возврата.</Text>}</View>
  </View>;

  const projects = <View className="gap-4"><View className={`${tone.mint} rounded-3xl p-5`}><Text className="text-xs font-bold text-success">ПРОЕКТЫ С МАЛЕНЬКИМИ ЭТАПАМИ</Text><Text className="mt-2 text-xl font-bold text-foreground">Сначала одна ступень, затем следующая</Text><Text className="mt-2 text-sm leading-5 text-[#245A49]">Каждый чек‑пункт превращает большой проект в посильные десять минут.</Text></View>{milestoneProjects.map((project) => { const stage = progress.completedProjects[project.id] ?? 0; return <View key={project.id} className="rounded-3xl border border-border bg-surface p-5"><Text className="text-xl font-bold text-foreground">{project.title}</Text><Text className="mt-2 text-sm leading-5 text-muted">{project.goal}</Text>{project.stages.map((item, index) => <Pressable key={item} onPress={() => void save({ completedProjects: { ...progress.completedProjects, [project.id]: index < stage ? index : Math.min(project.stages.length, index + 1) } })} className="mt-3 flex-row rounded-xl bg-background p-3"><Text className={`mr-2 font-bold ${index < stage ? "text-success" : "text-muted"}`}>{index < stage ? "✓" : "○"}</Text><Text className="flex-1 text-sm text-foreground">{index + 1}. {item}</Text></Pressable>)}<Text className="mt-3 text-xs text-muted">Этапов пройдено: {stage} из {project.stages.length}</Text></View>})}<View className="rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">Конструктор портфолио</Text>{portfolioChecklist.map((item) => <Text key={item} className="mt-2 text-sm text-muted">□ {item}</Text>)}<Text className="mt-3 text-xs text-primary">Совет: один законченный маленький проект полезнее пяти начатых.</Text></View></View>;

  const tools = (
    <View className="gap-4">
      <View className="rounded-3xl border border-border bg-surface p-5">
        <Text className="text-lg font-bold text-foreground">Профессиональные треки</Text>
        {professionalTracks.map((track) => (
          <Pressable key={track.id} onPress={() => void save({ selectedTrack: track.id })} className={`mt-3 rounded-2xl p-4 ${progress.selectedTrack === track.id ? "bg-[#E9EAFE]" : "bg-background"}`}>
            <Text className="font-bold text-foreground">{progress.selectedTrack === track.id ? "✓ " : ""}{track.title}</Text>
            {progress.selectedTrack === track.id ? track.steps.map((step, index) => <Text key={step} className="mt-2 text-sm text-muted">{index + 1}. {step}</Text>) : <Text className="mt-1 text-xs text-muted">Открыть маршрут</Text>}
          </Pressable>
        ))}
      </View>
      <View className="rounded-3xl border border-border bg-surface p-5">
        <Text className="text-lg font-bold text-foreground">Песочница структур данных</Text>
        <Text className="mt-2 rounded-lg bg-[#111426] p-3 font-mono text-xs leading-5 text-white">{`tasks = ['урок', 'задача']\nprofile = {'name': 'Аня', 'level': 1}`}</Text>
        <Text className="mt-3 text-sm leading-5 text-muted">Список — как очередь карточек, словарь — как шкафчик с подписанными ящиками. Запустите пример в уроке и откройте «Шаги выполнения».</Text>
      </View>
      <View className="rounded-3xl border border-border bg-surface p-5">
        <Text className="text-lg font-bold text-foreground">Учебная SQLite‑мастерская</Text>
        <Text className="mt-2 rounded-lg bg-[#111426] p-3 font-mono text-xs leading-5 text-white">CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT);{`\n`}SELECT title FROM books WHERE id = 1;</Text>
        <Text className="mt-3 text-sm leading-5 text-muted">Сначала создаём таблицу‑полку, затем кладём туда книги и спрашиваем нужную по номеру. Здесь нет настоящей базы — только безопасный разбор запросов.</Text>
      </View>
      <View className="rounded-3xl border border-border bg-surface p-5">
        <Text className="text-lg font-bold text-foreground">Тренажёр Git‑сообщений</Text>
        <TextInput value={gitMessage} onChangeText={setGitMessage} autoCapitalize="none" className="mt-3 rounded-xl border border-border bg-background px-3 py-3 font-mono text-foreground" />
        <Pressable onPress={() => setMessage(/^(feat|fix|docs|test):\s+.{4,}/.test(gitMessage) ? "Хорошо: тип изменения и смысл коммита понятны." : "Попробуйте формат: feat: добавить поиск уроков")} className="mt-3 items-center rounded-xl bg-primary py-3"><Text className="font-bold text-white">Проверить сообщение</Text></Pressable>
      </View>
      <View className="rounded-3xl border border-border bg-surface p-5">
        <Text className="text-lg font-bold text-foreground">Резервная копия прогресса</Text>
        <Text className="mt-2 text-sm text-muted">Копия содержит только локальный учебный прогресс и заметки. Не включает пароли или чужие данные.</Text>
        <Pressable onPress={async () => { await Clipboard.setStringAsync(await exportMasteryBackup()); await save({ backupCreatedAt: new Date().toISOString() }); setMessage("Резервная копия скопирована в буфер. Сохраните её в надёжном месте."); }} className="mt-3 items-center rounded-xl bg-[#E9EAFE] py-3"><Text className="font-bold text-primary">Скопировать резервную копию</Text></Pressable>
        <TextInput value={backupInput} onChangeText={setBackupInput} multiline textAlignVertical="top" placeholder="Вставьте сюда ранее сохранённую копию" placeholderTextColor="#667085" className="mt-3 min-h-24 rounded-xl border border-border bg-background p-3 font-mono text-xs text-foreground" />
        <Pressable onPress={async () => { try { const next = await importMasteryBackup(backupInput); setProgress(next); setBackupInput(""); setMessage("Копия восстановлена на этом устройстве."); } catch (error) { setMessage(error instanceof Error ? error.message : "Не удалось восстановить копию."); } }} className="mt-2 items-center rounded-xl border border-primary bg-background py-3"><Text className="font-bold text-primary">Восстановить из копии</Text></Pressable>
      </View>
    </View>
  );

  const final = <View className="gap-4"><View className={`${tone.warm} rounded-3xl p-5`}><Text className="text-xs font-bold text-warning">ИТОГОВАЯ ДИАГНОСТИКА</Text><Text className="mt-2 text-xl font-bold text-foreground">Проверяем маршрут, а не оцениваем человека</Text><Text className="mt-2 text-sm leading-5 text-[#765C24]">Ошибочный ответ — это указатель на тему для повторения.</Text></View><View className="rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">Быстрая диагностика навыков</Text>{finalDiagnostic.map((item) => <View key={item.id} className="mt-4 rounded-2xl bg-background p-4"><Text className="font-bold text-foreground">{item.topic}: {item.question}</Text><View className="mt-2 gap-2">{item.options.map((option, index) => <Choice key={option} label={option} selected={progress.diagnosticAnswers[item.id] === index} onPress={() => void save({ diagnosticAnswers: { ...progress.diagnosticAnswers, [item.id]: index } })} />)}</View>{progress.diagnosticAnswers[item.id] !== undefined ? <Text className={`mt-3 text-sm ${progress.diagnosticAnswers[item.id] === item.answer ? "text-success" : "text-warning"}`}>{progress.diagnosticAnswers[item.id] === item.answer ? "Верно. Тема укрепляется." : `Повторите урок: «${item.lesson}».`}</Text> : null}</View>)}<Text className="mt-4 rounded-xl bg-[#E9EAFE] p-3 text-sm font-bold text-primary">Текущий результат: {diagnosticScore} из {finalDiagnostic.length}. Рекомендации строятся прямо под ошибками.</Text></View><View className="rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">Этичная веб‑автоматизация</Text><Text className="mt-2 text-sm leading-5 text-muted">Перед любой автоматизацией: прочитайте правила сайта, используйте публичный API, ставьте таймауты и не обходите ограничения. Не храните чужие cookies, пароли и токены.</Text><Pressable onPress={() => void save({ selectedTrack: "automation" })} className="mt-3 items-center rounded-xl bg-primary py-3"><Text className="font-bold text-white">Открыть безопасный трек</Text></Pressable></View></View>;

  const content = section === "practice" ? practice : section === "plan" ? plan : section === "projects" ? projects : section === "tools" ? tools : final;
  return <ScreenContainer className="px-5"><ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}><Pressable onPress={() => router.replace("/study-lab" as never)} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}><Text className="mb-5 pt-2 font-semibold text-primary">‹ К учебной студии</Text></Pressable><Text className="text-3xl font-bold text-foreground">Мастерская роста</Text><Text className="mt-2 text-base leading-6 text-muted">Новые улучшения Python‑учебника: от маленькой практики до собственного портфолио.</Text>{message ? <Text className="mt-4 rounded-xl bg-[#E9EAFE] p-3 text-sm leading-5 text-primary">{message}</Text> : null}<View className="mt-5 flex-row flex-wrap gap-2">{sections.map((item) => <Pressable key={item.id} onPress={() => setSection(item.id)} className={`rounded-full px-4 py-2 ${section === item.id ? "bg-primary" : "border border-border bg-surface"}`}><Text className={`text-sm font-bold ${section === item.id ? "text-white" : "text-foreground"}`}>{item.label}</Text></Pressable>)}</View><View className="mt-5">{content}</View></ScrollView></ScreenContainer>;
}
