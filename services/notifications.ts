import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Lead } from "@/types/lead";

const channel = "lead-followups";

export async function configureNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(channel, {
      name: "Lead follow-ups",
      importance: Notifications.AndroidImportance.DEFAULT
    });
  }
  const permissions = await Notifications.getPermissionsAsync();
  if (!permissions.granted) await Notifications.requestPermissionsAsync();
}

function idFor(leadId: string) {
  return `lead-reminder-${leadId}`;
}

function reminderDate(dateToCall: string) {
  const [year, month, day] = dateToCall.split("-").map(Number);
  const now = new Date();
  const target = new Date(year, month - 1, day, 9, 0, 0, 0);
  if (target.getTime() <= now.getTime()) target.setTime(now.getTime() + 60_000);
  return target;
}

export async function scheduleLeadReminder(lead: Lead) {
  await configureNotifications();
  await cancelLeadReminder(lead.id);
  if (lead.status !== "pending") return;

  await Notifications.scheduleNotificationAsync({
    identifier: idFor(lead.id),
    content: {
      title: "Lead follow-up",
      body: `${lead.name || lead.phoneNumber} is due for follow-up.`,
      data: { leadId: lead.id, type: "lead_reminder" }
    },
    trigger: Platform.OS === "android"
      ? { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderDate(lead.dateToCall), channelId: channel }
      : { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderDate(lead.dateToCall) }
  });
}

export async function cancelLeadReminder(leadId: string) {
  try { await Notifications.cancelScheduledNotificationAsync(idFor(leadId)); } catch {}
}

export async function reconcileLeadReminders() {
  // The local lead service owns reconciliation. This entry point configures
  // the OS notification channel/permissions and is safe to call on app start.
  await configureNotifications();
}
