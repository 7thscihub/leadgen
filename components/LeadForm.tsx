import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useRouter, Href } from "expo-router";
import { LeadStatus } from "@/types/lead";
import LeadFormInputs, {
    ResidenceType,
    FormData,
} from "@/components/LeadFormInputs";

export type { FormData };

export function LeadForm({
    title,
    initial,
    status = "pending",
    onSave,
    saving = false,
    exitRoute,
}: {
    title: string;
    initial: FormData;
    status?: LeadStatus;
    onSave: (data: FormData & { status?: LeadStatus }) => Promise<void>;
    saving?: boolean;
    exitRoute?: Href;
}) {
    const router = useRouter();

    const [form, setForm] = useState<FormData>(() => ({
        phoneNumber: initial?.phoneNumber ?? "",
        name: initial?.name ?? "",
        idNumber: initial?.idNumber ?? "",
        dateToCall: initial?.dateToCall ?? "",
        location: initial?.location ?? "",
        package: initial?.package ?? "",
        estateName: initial?.estateName ?? "",
        apartmentName: initial?.apartmentName ?? "",
    }));
    const [currentStatus, setCurrentStatus] = useState(status);

    const [residenceType, setResidenceType] = useState<ResidenceType>(
        (initial as any)?.residency || "estate"
    );

    // Update form fields
    const set = (key: keyof FormData, value: string) => {
        setForm((v) => ({ ...v, [key]: value }));
    };

    // Handle residence selection
    const selectResidence = (type: ResidenceType) => {
        setResidenceType(type);

        if (type === "estate") {
            set("apartmentName", "");
        } else if (type === "apartment") {
            set("estateName", "");
        } else {
            set("estateName", "");
            set("apartmentName", "");
        }
    };

    // Submit form
    const submit = async () => {
        if (!form.phoneNumber.trim()) {
            return Alert.alert("Phone number required");
        }

        if (!form.dateToCall.trim()) {
            return Alert.alert("Date to call required");
        }

        await onSave({ ...form, status: currentStatus });

        router.navigate("/");
    };

    // Exit form
    const handleExit = () => {
        if (exitRoute) {
            router.navigate(exitRoute);
        } else {
            router.navigate("/");
        }
    };

    return (
        <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                {/* Header */}
                <View style={styles.top}>
                    <Text style={styles.title}>{title}</Text>

                    <View style={{ width: 55 }} />

                    <Pressable onPress={handleExit}>
                        <Text style={styles.cancel}>X</Text>
                    </Pressable>
                </View>

                {/* Status */}
                {title !== "Add lead" && (
                    <View style={styles.statusBox}>
                        <Text style={styles.label}>Status</Text>

                        <View style={styles.statuses}>
                            {(
                                [
                                    "pending",
                                    "sold",
                                    "reversed",
                                    "abandoned",
                                ] as LeadStatus[]
                            ).map((s) => (
                                <Pressable
                                    key={s}
                                    onPress={() => setCurrentStatus(s)}
                                    style={[
                                        styles.status,
                                        currentStatus === s &&
                                            styles.statusActive,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.statusText,
                                            currentStatus === s &&
                                                styles.statusTextActive,
                                        ]}
                                    >
                                        {s}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                )}

                {/* Form Inputs */}
                <LeadFormInputs
                    form={form}
                    onChange={set}
                    residenceType={residenceType}
                    onSelectResidence={selectResidence}
                />

                {/* Save */}
                <Pressable disabled={saving} onPress={submit} style={[styles.save, saving && styles.saveDisabled,]}>
                    <Text style={styles.saveText}>
                        {saving ? "Saving…" : "Save lead"}
                    </Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}


// Styles
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },

    container: {
        padding: 20,
        paddingTop: 58,
        backgroundColor: "#F8FAFC",
        minHeight: "100%",
    },

    top: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 28,
    },

    cancel: {
        color: "red",
        fontSize: 20,
        fontWeight: "500",
        marginRight: 10,
    },

    title: {
        fontSize: 20,
        fontWeight: "800",
        color: "black",
        // backgroundColor: "#111827",
        paddingHorizontal: 15,
        // paddingVertical: 3,
    },

    label: {
        color: "#64748B",
        fontSize: 12,
        fontWeight: "700",
        marginBottom: 7,
    },

    // Status
    statusBox: {
        marginBottom: 20,
    },

    statuses: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 7,
    },

    status: {
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },

    statusActive: {
        backgroundColor: "#111827",
        borderColor: "#111827",
    },

    statusText: {
        color: "#64748B",
        fontSize: 12,
        fontWeight: "700",
        textTransform: "capitalize",
    },

    statusTextActive: {
        color: "#FFFFFF",
    },

    // Save
    save: {
        marginTop: 20,
        height: 40,
        borderRadius: 18,
        backgroundColor: "#111827",
        alignItems: "center",
        justifyContent: "center",
    },

    saveDisabled: {
        opacity: 0.6,
    },

    saveText: {
        color: "#FFFFFF",
        fontWeight: "800",
        fontSize: 15,
    },
});

