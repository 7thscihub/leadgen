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


function idFor(leadId: string, date:Date) {
    return `lead-reminder-${leadId}-${date.getTime()}`;
}


function getTargetDates(dateToCall: string) {
    const [year, month, day] = dateToCall.split("-").map(Number);
    const oneHour = 60 * 60 * 1000;
    const now = new Date();

    const target1 = new Date(year, month - 1, day, 9, 0, 0, 0);
    const target2 = new Date(year, month - 1, day, 16, 0, 0, 0);
    const target3 = new Date(year, month - 1, day, 20, 0, 0, 0);

    const targetDates = [target, target2, target3].filter(target=> target.getTime() >= now.getTime())
    if (!targetDates.length) { 
        targetDates = [now.getTime() + oneHour]
    }
    return targetDates;
}


export async function scheduleLeadReminders(lead: Lead) {
    await configureNotifications();
    const dates = getTargetDates(lead.dateToCall);
    await cancelLeadReminders(lead.id, dates);

    if (lead.status !== "pending") return;

    await Promise.all(dates.map((date)=> Notifications.scheduleNotificationAsync({
        identifier: idFor(lead.id, date),
        content: {
            title: "DON'T LOSE THIS SALE!!!",
            body: `Call ${lead.name || lead.phoneNumber}`,
            data: { leadId: lead.id, type: "lead_reminder" }
        },
        trigger: Platform.OS === "android"
            ? { 
                type: Notifications.SchedulableTriggerInputTypes.DATE, 
                date: date, 
                channelId: channel 
            }
            : { 
                type: Notifications.SchedulableTriggerInputTypes.DATE, 
                date: date
            }
    })));
}


export async function cancelLeadReminders(leadId: string, dates:Date[]) {
    if (Platform.OS == 'web') return 
    await Promise.all(dates.map(
        date => Notifications.cancelScheduledNotificationAsync(idFor(leadId, date))
    ))
}


export async function reconcileLeadReminders() {
  // The local lead service owns reconciliation. This entry point configures
  // the OS notification channel/permissions and is safe to call on app start.
    await configureNotifications();
}



