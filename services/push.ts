import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { Platform } from "react-native";

const BASE_URL = process.env.EXPO_PUBLIC_FORM_FUNCTION_URL || "";

export async function registerPushDevice() {
    if (!Device.isDevice || !BASE_URL) return;

    const permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) {
        const requested = await Notifications.requestPermissionsAsync();
        if (!requested.granted) return;
    }

    const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ||
        Constants.easConfig?.projectId;

    const token = (await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
    )).data;

    const deviceId =
        Platform.OS === "android"
        ? Application.getAndroidId()
        : Application.applicationId || `${Device.modelName || "ios-device"}-${Device.osBuildId || "unknown"}`;

    await fetch(`${BASE_URL}/agent/push-device`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, pushToken: token })
    });
}

