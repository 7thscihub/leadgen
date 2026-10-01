import { useEffect, useState } from "react";
import { Alert, Pressable, Share, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { getOrCreateFormToken, disableFormToken, regenerateFormToken } from "@/services/forms";

const URL_KEY = "formUrl";

export default function FormLink() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    AsyncStorage.getItem(URL_KEY).then((cached) => cached && setUrl(cached));
    getOrCreateFormToken().then(setUrl).catch(() => {});
  }, []);

  const copy = async () => { await Clipboard.setStringAsync(url); Alert.alert("Copied", "Your public form link is on the clipboard."); };
  const share = () => Share.share({ message: url });
  const disable = () => Alert.alert("Disable form?", "The current public link will stop accepting submissions.", [
    { text: "Cancel", style: "cancel" },
    { text: "Disable", style: "destructive", onPress: async () => { await disableFormToken(); setUrl(""); } }
  ]);
  const regenerate = () => Alert.alert("Regenerate link?", "The old link will stop working.", [
    { text: "Cancel", style: "cancel" },
    { text: "Regenerate", onPress: async () => setUrl(await regenerateFormToken()) }
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>PUBLIC FORM</Text>
      <Text style={styles.title}>Get more leads</Text>
      <Text style={styles.subtitle}>Share one link with customers. They don't need the app.</Text>

      <View style={styles.card}>
        <View style={styles.linkIcon}><Ionicons name="link-outline" size={22} color="#4F46E5" /></View>
        <Text style={styles.url}>{url || "Loading form link…"}</Text>
        <View style={styles.buttons}>
          <Button label="Copy" onPress={copy} />
          <Button label="Share" onPress={share} />
        </View>
      </View>

      <Pressable style={styles.secondary} onPress={regenerate}><Text style={styles.secondaryText}>Regenerate link</Text></Pressable>
      <Pressable style={styles.danger} onPress={disable}><Text style={styles.dangerText}>Disable link</Text></Pressable>
    </View>
  );
}

function Button({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable style={styles.button} onPress={onPress}><Text style={styles.buttonText}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 20, paddingTop: 70 },
  eyebrow: { fontSize: 11, letterSpacing: 2, fontWeight: "800", color: "#64748B" },
  title: { fontSize: 30, fontWeight: "800", color: "#0F172A", marginTop: 5 },
  subtitle: { color: "#64748B", fontSize: 15, lineHeight: 21, marginTop: 8, maxWidth: 330 },
  card: { backgroundColor: "#fff", borderRadius: 20, borderWidth: 1, borderColor: "#E2E8F0", padding: 18, marginTop: 28 },
  linkIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" },
  url: { color: "#334155", fontSize: 13, lineHeight: 20, marginTop: 14 },
  buttons: { flexDirection: "row", gap: 8, marginTop: 18 },
  button: { flex: 1, height: 46, borderRadius: 13, backgroundColor: "#111827", alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#fff", fontWeight: "800" },
  secondary: { alignItems: "center", padding: 20 },
  secondaryText: { color: "#334155", fontWeight: "800" },
  danger: { alignItems: "center", padding: 10 },
  dangerText: { color: "#DC2626", fontWeight: "700" }
});
