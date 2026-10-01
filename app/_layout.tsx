import { Stack } from "expo-router";
import { useEffect } from "react";
import { reconcileLeadReminders } from "@/services/notifications";
import { registerPushDevice } from "@/services/push";
import { importPublicLead } from "@/services/leads";
import * as Notifications from "expo-notifications";

export default function Layout() {
  useEffect(() => {
    reconcileLeadReminders().catch(console.warn);
    registerPushDevice().catch(console.warn);

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener(async (response) => {
        const data = response.notification.request.content.data as any;
        if (data?.type !== "new_lead" || !data?.submissionId || !data?.phoneNumber) return;

        await importPublicLead({
          submissionId: String(data.submissionId),
          phoneNumber: String(data.phoneNumber),
          name: data.name ? String(data.name) : "",
          location: data.location ? String(data.location) : "",
          package: data.package ? String(data.package) : "",
          estateName: data.estateName ? String(data.estateName) : "",
          apartmentName: data.apartmentName ? String(data.apartmentName) : "",
          dateToCall: ""
        });
      });

    return () => responseSubscription.remove();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F8FAFC" }
      }}
    />
  );
}
