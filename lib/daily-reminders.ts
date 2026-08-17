import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

const KEY = "python-bez-straha.daily-reminder.v1";
const CHANNEL_ID = "study-reminders";

export type DailyReminder = {
  enabled: boolean;
  hour: number;
  minute: number;
  notificationId?: string;
};

export const defaultDailyReminder: DailyReminder = { enabled: false, hour: 19, minute: 0 };

export async function loadDailyReminder(): Promise<DailyReminder> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return defaultDailyReminder;
  try {
    const parsed = JSON.parse(raw) as Partial<DailyReminder>;
    return {
      enabled: parsed.enabled === true,
      hour: Number.isInteger(parsed.hour) && parsed.hour! >= 0 && parsed.hour! <= 23 ? parsed.hour! : 19,
      minute: Number.isInteger(parsed.minute) && parsed.minute! >= 0 && parsed.minute! <= 59 ? parsed.minute! : 0,
      notificationId: typeof parsed.notificationId === "string" ? parsed.notificationId : undefined,
    };
  } catch {
    return defaultDailyReminder;
  }
}

async function saveDailyReminder(value: DailyReminder) {
  await AsyncStorage.setItem(KEY, JSON.stringify(value));
}

async function configureChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Занятия Python",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 180],
      lightColor: "#5B5CE2",
    });
  }
}

export async function enableDailyReminder(hour: number, minute = 0) {
  if (Platform.OS === "web") return { ok: false, reason: "Напоминания доступны в установленном мобильном приложении." };
  await configureChannel();
  const existing = await Notifications.getPermissionsAsync();
  const permission = existing.status === "granted" ? existing : await Notifications.requestPermissionsAsync();
  if (permission.status !== "granted") return { ok: false, reason: "Разрешение на уведомления не выдано." };

  const previous = await loadDailyReminder();
  if (previous.notificationId) await Notifications.cancelScheduledNotificationAsync(previous.notificationId);
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Python без страха",
      body: "Один маленький шаг сегодня — уже движение вперёд. Откройте задачу для практики.",
      data: { url: "/practice" },
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: CHANNEL_ID,
    },
  });
  const next = { enabled: true, hour, minute, notificationId };
  await saveDailyReminder(next);
  return { ok: true, reminder: next };
}

export async function disableDailyReminder() {
  const previous = await loadDailyReminder();
  if (previous.notificationId && Platform.OS !== "web") await Notifications.cancelScheduledNotificationAsync(previous.notificationId);
  const next = { ...previous, enabled: false, notificationId: undefined };
  await saveDailyReminder(next);
  return next;
}

export function formatReminderTime(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
