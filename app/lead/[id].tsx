import { useCallback, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { getLead, deleteLead, changeLeadStatus } from "@/services/leads";
import { Lead, LeadStatus } from "@/types/lead";
import { formatNairobiDate } from "@/utils/date";

export default function LeadDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);

  const load = useCallback(() => {
    if (id) getLead(id).then(setLead).catch(console.warn);
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!lead) return <View style={styles.center}><Text>Lead not found.</Text></View>;

  const call = () => Linking.openURL(`tel:${lead.phoneNumber}`);
  const whatsapp = () => Linking.openURL(`https://wa.me/${lead.phoneNumber.replace(/\D/g, "")}`);

  const setStatus = (status: LeadStatus) => {
    Alert.alert("Change status", "Choose the new lead status.", [
      ...(["pending", "sold", "reversed", "abandoned"] as LeadStatus[]).map((s) => ({
        text: s[0].toUpperCase() + s.slice(1),
        onPress: async () => { await changeLeadStatus(lead.id, s); load(); }
      })),
      { text: "Cancel", style: "cancel" }
    ]);
  };

  const remove = () => Alert.alert("Delete lead?", "This permanently removes the lead.", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: async () => { await deleteLead(lead.id); router.back(); } }
  ]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={22} /></Pressable>
      <View style={styles.hero}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(lead.name || lead.phoneNumber)[0]}</Text></View>
        <Text style={styles.title}>{lead.name || lead.phoneNumber}</Text>
        <Text style={styles.phone}>{lead.phoneNumber}</Text>
        <View style={styles.status}><Text style={styles.statusText}>{lead.status}</Text></View>
      </View>

      <View style={styles.actions}>
        <Action icon="call-outline" label="Call" onPress={call} />
        <Action icon="logo-whatsapp" label="WhatsApp" onPress={whatsapp} />
        <Action icon="create-outline" label="Edit" onPress={() => router.push(`/edit?id=${lead.id}`)} />
        <Action icon="swap-horizontal-outline" label="Status" onPress={() => setStatus(lead.status)} />
      </View>

      <View style={styles.card}>
        <Field label="Date to call" value={formatNairobiDate(lead.dateToCall)} />
        <Field label="Location" value={lead.location} />
        <Field label="Package" value={lead.package} />
        <Field label="Estate" value={lead.estateName} />
        <Field label="Apartment" value={lead.apartmentName} />
        <Field label="Created" value={formatNairobiDate(lead.createdAt)} />
        <Field label="Updated" value={formatNairobiDate(lead.updatedAt)} />
      </View>

      <Pressable onPress={remove} style={styles.delete}><Text style={styles.deleteText}>Delete lead</Text></Pressable>
    </ScrollView>
  );
}

function Action({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.action}><Ionicons name={icon} size={20} color="#111827" /><Text style={styles.actionText}>{label}</Text></Pressable>;
}
function Field({ label, value }: { label: string; value?: string }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value || "—"}</Text></View>;
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 58, backgroundColor: "#F8FAFC", minHeight: "100%" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  back: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", alignItems: "center", justifyContent: "center" },
  hero: { alignItems: "center", paddingVertical: 25 },
  avatar: { width: 72, height: 72, borderRadius: 22, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 28, fontWeight: "800", color: "#4F46E5" },
  title: { fontSize: 25, fontWeight: "800", color: "#0F172A", marginTop: 14 },
  phone: { color: "#64748B", marginTop: 5 },
  status: { marginTop: 10, backgroundColor: "#E2E8F0", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { color: "#334155", fontWeight: "700", textTransform: "capitalize", fontSize: 12 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  action: { flex: 1, minWidth: "22%", height: 70, backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0", alignItems: "center", justifyContent: "center", gap: 5 },
  actionText: { fontSize: 11, fontWeight: "700", color: "#334155" },
  card: { marginTop: 14, backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#E2E8F0", padding: 16 },
  field: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  label: { fontSize: 11, color: "#94A3B8", fontWeight: "700" },
  value: { color: "#0F172A", marginTop: 3, fontSize: 15 },
  delete: { alignItems: "center", padding: 25 },
  deleteText: { color: "#DC2626", fontWeight: "800" }
});
