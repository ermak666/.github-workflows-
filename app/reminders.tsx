import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, Switch, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { disableDailyReminder, enableDailyReminder, formatReminderTime, loadDailyReminder, type DailyReminder } from "@/lib/daily-reminders";

export default function RemindersScreen() {
  const router = useRouter();
  const [reminder, setReminder] = useState<DailyReminder>({ enabled: false, hour: 19, minute: 0 });
  const [busy, setBusy] = useState(false);
  useFocusEffect(useCallback(() => { loadDailyReminder().then(setReminder); }, []));

  const changeHour = (delta: number) => setReminder((value) => ({ ...value, hour: (value.hour + delta + 24) % 24 }));
  const toggle = async (enabled: boolean) => {
    setBusy(true);
    try {
      if (enabled) {
        const result = await enableDailyReminder(reminder.hour, reminder.minute);
        if (!result.ok || !result.reminder) Alert.alert("Не получилось включить", result.reason ?? "Проверьте разрешения устройства.");
        else setReminder(result.reminder);
      } else {
        setReminder(await disableDailyReminder());
      }
    } finally {
      setBusy(false);
    }
  };

  const saveTime = async () => {
    if (!reminder.enabled) return;
    setBusy(true);
    try {
      const result = await enableDailyReminder(reminder.hour, reminder.minute);
      if (result.ok && result.reminder) setReminder(result.reminder);
      else Alert.alert("Не получилось обновить", result.reason ?? "Проверьте разрешения устройства.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer className="px-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}><Text className="mb-5 pt-2 text-base font-semibold text-primary">‹ Назад</Text></Pressable>
        <Text className="text-3xl font-bold text-foreground">Напоминания</Text>
        <Text className="mt-2 text-base leading-6 text-muted">Одно бережное напоминание в день. Оно сработает и без открытого приложения после разрешения на уведомления.</Text>
        <View className="mt-7 rounded-3xl border border-border bg-surface p-5">
          <View className="flex-row items-center justify-between"><View className="flex-1"><Text className="text-lg font-bold text-foreground">Ежедневное занятие</Text><Text className="mt-1 text-sm leading-5 text-muted">Мы предложим открыть одну короткую задачу.</Text></View><Switch value={reminder.enabled} disabled={busy} onValueChange={toggle} trackColor={{ false: "#D6D9E5", true: "#A9AAF9" }} thumbColor={reminder.enabled ? "#5B5CE2" : "#FFFFFF"} /></View>
          <View className="mt-6 items-center rounded-2xl bg-background p-5"><Text className="text-sm font-semibold text-muted">ВРЕМЯ НАПОМИНАНИЯ</Text><Text className="mt-1 text-5xl font-bold text-foreground">{formatReminderTime(reminder.hour, reminder.minute)}</Text><View className="mt-5 flex-row gap-3"><Pressable onPress={() => changeHour(-1)} style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })} className="h-12 w-14 items-center justify-center rounded-xl bg-[#E9EAFE]"><Text className="text-2xl font-bold text-primary">−</Text></Pressable><Pressable onPress={() => changeHour(1)} style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })} className="h-12 w-14 items-center justify-center rounded-xl bg-[#E9EAFE]"><Text className="text-2xl font-bold text-primary">+</Text></Pressable></View></View>
          {reminder.enabled ? <Pressable disabled={busy} onPress={saveTime} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })} className="mt-4 items-center rounded-2xl bg-primary py-4"><Text className="font-bold text-white">Сохранить время</Text></Pressable> : null}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
