import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getLeads } from "@/services/leads";
import { Lead, LeadStatus, FollowUpState } from "@/types/lead";
import { followUpState } from "@/utils/date";

const filters: Array<{ label: string; value: LeadStatus }> = [
  { label: "Pending", value: "pending" },
  { label: "Sold", value: "sold" },
  { label: "Reversed", value: "reversed" },
  { label: "Abandoned", value: "abandoned" }
];

export default function Home() {
  const router = useRouter();
  const [status, setStatus] = useState<LeadStatus>("pending");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLeads(await getLeads(status, query));
  }, [status, query]);

  useFocusEffect(useCallback(() => {
    load().catch(console.warn);
  }, [load]));

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>LEADGEN</Text>
          <Text style={styles.title}>Your leads</Text>
        </View>
        <Pressable style={styles.iconButton} onPress={() => router.push("/form")}>
          <Ionicons name="link-outline" size={21} color="#111827" />
        </Pressable>
      </View>

      <View style={styles.search}>
        <Ionicons name="search-outline" size={18} color="#94A3B8" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search name or phone"
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
        />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={filters}
        keyExtractor={(item) => item.value}
        contentContainerStyle={styles.filters}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setStatus(item.value)}
            style={[styles.filter, status === item.value && styles.filterActive]}
          >
            <Text style={[styles.filterText, status === item.value && styles.filterTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        )}
      />

      <FlatList
        data={leads}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No {status} leads</Text>
            <Text style={styles.emptyText}>Add a lead or wait for a public-form submission.</Text>
          </View>
        }
        renderItem={({ item }) => <LeadRow lead={item} onPress={() => router.push(`/lead/${item.id}`)} />}
      />

      <Pressable style={styles.add} onPress={() => router.push("/add")}>
        <Ionicons name="add" size={22} color="#fff" />
        <Text style={styles.addText}>Add lead</Text>
      </Pressable>
    </View>
  );
}

function LeadRow({ lead, onPress }: { lead: Lead; onPress: () => void }) {
  const state: FollowUpState | null = lead.status === "pending" ? followUpState(lead.dateToCall) : null;

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{(lead.name || lead.phoneNumber).slice(0, 1).toUpperCase()}</Text>
      </View>
      <View style={styles.rowMain}>
        <Text style={styles.name}>{lead.name || lead.phoneNumber}</Text>
        <Text style={styles.phone}>{lead.name ? lead.phoneNumber : lead.dateToCall}</Text>
      </View>
      {state && <Text style={[styles.state, state === "overdue" && styles.overdue]}>{label(state)}</Text>}
      {!state && <Text style={styles.status}>{lead.status}</Text>}
      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
    </Pressable>
  );
}

function label(value: FollowUpState) {
  return value === "due_today" ? "Today" : value === "overdue" ? "Overdue" : "Upcoming";
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", paddingTop: 58 },
  header: { paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 2, color: "#64748B" },
  title: { fontSize: 30, fontWeight: "800", color: "#0F172A", marginTop: 2 },
  iconButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E2E8F0" },
  search: { margin: 20, marginBottom: 10, height: 48, borderRadius: 14, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", flexDirection: "row", alignItems: "center", paddingHorizontal: 14 },
  searchInput: { flex: 1, marginLeft: 9, color: "#0F172A", fontSize: 15 },
  filters: { paddingHorizontal: 20, gap: 8, paddingBottom: 14 },
  filter: { paddingHorizontal: 15, height: 36, borderRadius: 18, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", justifyContent: "center" },
  filterActive: { backgroundColor: "#111827", borderColor: "#111827" },
  filterText: { color: "#64748B", fontWeight: "700", fontSize: 13 },
  filterTextActive: { color: "#fff" },
  list: { padding: 20, paddingTop: 4, paddingBottom: 110, gap: 8 },
  row: { minHeight: 72, backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0", padding: 13, flexDirection: "row", alignItems: "center" },
  avatar: { width: 44, height: 44, borderRadius: 13, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#4F46E5", fontWeight: "800", fontSize: 17 },
  rowMain: { flex: 1, marginLeft: 12 },
  name: { color: "#0F172A", fontSize: 15, fontWeight: "750" },
  phone: { color: "#64748B", fontSize: 12, marginTop: 4 },
  state: { color: "#64748B", fontSize: 11, fontWeight: "700", marginRight: 8 },
  overdue: { color: "#DC2626" },
  status: { color: "#64748B", fontSize: 11, textTransform: "capitalize", marginRight: 8 },
  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
  emptyText: { textAlign: "center", color: "#64748B", marginTop: 8, lineHeight: 20 },
  add: { position: "absolute", right: 20, bottom: 24, height: 54, borderRadius: 18, paddingHorizontal: 20, backgroundColor: "#111827", flexDirection: "row", alignItems: "center", gap: 7, elevation: 4 },
  addText: { color: "#fff", fontWeight: "800", fontSize: 14 }
});
