import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_FORM_FUNCTION_URL || "";
const TOKEN_KEY = "formToken";
const URL_KEY = "formUrl";

async function request(path: string, options: RequestInit = {}) {
  if (!BASE_URL) throw new Error("EXPO_PUBLIC_FORM_FUNCTION_URL is not configured.");
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  if (!response.ok) throw new Error(`Form service returned ${response.status}.`);
  return response.json();
}

export async function getOrCreateFormToken() {
  const cached = await AsyncStorage.getItem(TOKEN_KEY);
  if (cached) {
    const url = `${BASE_URL}/form/${cached}`;
    await AsyncStorage.setItem(URL_KEY, url);
    return url;
  }

  // The authenticated Appwrite function should identify the current agent,
  // generate/retrieve an opaque token, and return { token }.
  const data = await request("/agent/form-token", { method: "POST", body: "{}" });
  const token = data.token as string;
  const url = `${BASE_URL}/form/${token}`;
  await AsyncStorage.multiSet([[TOKEN_KEY, token], [URL_KEY, url]]);
  return url;
}

export async function disableFormToken() {
  await request("/agent/form-token/disable", { method: "POST", body: "{}" });
  await AsyncStorage.multiRemove([TOKEN_KEY, URL_KEY]);
}

export async function regenerateFormToken() {
  const data = await request("/agent/form-token/regenerate", { method: "POST", body: "{}" });
  const token = data.token as string;
  const url = `${BASE_URL}/form/${token}`;
  await AsyncStorage.multiSet([[TOKEN_KEY, token], [URL_KEY, url]]);
  return url;
}
