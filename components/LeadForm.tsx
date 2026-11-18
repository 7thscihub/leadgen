import { useState } from "react";
import { Alert, KeyboardAvoidingView, ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Lead, LeadStatus } from "@/types/lead";


type FormData = Pick<Lead, "phoneNumber" | "name" | "dateToCall" | "location" | "package" | "estateName" | "apartmentName">;


export function LeadForm({
        title, initial, status = "pending", onSave, saving = false
    }: {
        title: string;
        initial: FormData;
        status?: LeadStatus;
        onSave: (data: FormData & { status?: LeadStatus }) => Promise<void>;
        saving?: boolean;
    }) {
    const router = useRouter();
    const [form, setForm] = useState<FormData>(initial);
    const [currentStatus, setCurrentStatus] = useState(status);

    const set = (key: keyof FormData, value: string) => setForm((v) => ({ ...v, [key]: value }));

    const submit = async () => {
        if (!form.phoneNumber.trim()) return Alert.alert("Phone number required");
        if (!form.dateToCall.trim()) return Alert.alert("Date to call required");
        await onSave({ ...form, status: currentStatus });
        router.navigate('/')
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#F8FAFC" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.top}>
                
                <Text style={styles.title}>{title}</Text>
                <View style={{ width: 55 }} />
                <Pressable onPress={() => router.navigate('/')}>
                    <Text style={styles.cancel}>X</Text>
                </Pressable>    
            </View>

            {title !== "Add lead" && (
            <View style={styles.statusBox}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.statuses}>
                    {(["pending", "sold", "reversed", "abandoned"] as LeadStatus[]).map((s) => (
                        <Pressable 
                            key={s} 
                            onPress={() => setCurrentStatus(s)} 
                            style={[styles.status, currentStatus === s && styles.statusActive]}>
                            <Text style={[styles.statusText, currentStatus === s && styles.statusTextActive]}>{s}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>
            )}

            <Input label="Phone number *" value={form.phoneNumber} onChangeText={(v) => set("phoneNumber", v)} keyboardType="phone-pad" />
            <Input label="Name" value={form.name} onChangeText={(v) => set("name", v)} />
            <Input label="Id Number" value={form.idNumber} onChangeText={(v) => set("idNumber", v)} /> 
            <Input label="Package" value={form.package} onChangeText={(v) => set("package", v)} />
            <Input label="Date to call *" value={form.dateToCall} onChangeText={(v) => set("dateToCall", v)} placeholder="YYYY-MM-DD" />
            <Input label="Location" value={form.location} onChangeText={(v) => set("location", v)} />
            <Input label="Estate" value={form.estateName} onChangeText={(v) => set("estateName", v)} />
            <Input label="Apartment" value={form.apartmentName} onChangeText={(v) => set("apartmentName", v)} />

            <Pressable disabled={saving} onPress={submit} style={styles.save}>
                <Text style={styles.saveText}>{saving ? "Saving…" : "Save lead"}</Text>
            </Pressable>
        </ScrollView>
        </KeyboardAvoidingView>
    );
}


function Residence(){
    return (
        <View>
            
        </View>
    )
}

function Input({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
    const [isFocused, setIsFocused ] = useState(false)
    return (
        <View style={styles.inputBox}>
            <Text style={styles.label}>{label}</Text>
            <TextInput 
                onFocus={() => setIsFocused(true)}
                onBlur={()=> setIsFocused(false)}
                {...props} 
                placeholderTextColor="#94A3B8" 
                style={[styles.input, isFocused && styles.inputFocused]} 
            />
        </View>
    )
}


const styles = StyleSheet.create({
    container: { 
        padding: 20, 
        paddingTop: 58, 
        paddingBottom: 50 
    },
    top: { 
        flexDirection: "row", 
        alignItems: "center", 
        justifyContent: "space-between", 
        marginBottom: 28 
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
        color: "#0F172A" 
    },
    inputBox: { 
        marginBottom: 16 
    },
    label: { 
        color: "#64748B", 
        fontSize: 12, 
        fontWeight: "700", 
        marginBottom: 7 
    },
    input: { 
        height: 35, 
        // backgroundColor: "#fff", 
        // borderRadius: 14, 
        // borderWidth: 1, 
        // borderColor: "#E2E8F0",
        borderBottomWidth: 1,
        borderBottomColor: "gray",
        paddingHorizontal: 5, 
        color: "#0F172A", 
        fontSize: 15 
    },
    inputFocused: {
        // border: "transparent",
        outlineStyle:  "none",
        outlineWidth: 1,
        borderBottomWidth: 1,
        borderBottomColor: "black"
    },
    statusBox: { 
        marginBottom: 20 
    },
    statuses: { 
        flexDirection: "row", 
        flexWrap: "wrap", 
        gap: 7 
    },
    status: { 
        paddingHorizontal: 12, 
        paddingVertical: 9, 
        borderRadius: 12, 
        backgroundColor: "#fff", 
        borderWidth: 1, 
        borderColor: "#E2E8F0" 
    },
    statusActive: { 
        backgroundColor: "#111827", 
        borderColor: "#111827" 
    },
    statusText: { 
        color: "#64748B", 
        fontSize: 12, 
        fontWeight: "700", 
        textTransform: "capitalize" 
    },
    statusTextActive: { 
        color: "#fff" 
    },
    save: {
        marginTop: 30,
        height: 52, 
        borderRadius: 15, 
        backgroundColor: "#111827", 
        alignItems: "center", 
        justifyContent: "center", 
        marginTop: 30 
    },
    saveText: { 
        color: "#fff", 
        fontWeight: "800", 
        fontSize: 15 
    }
});

