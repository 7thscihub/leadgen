import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { createLead } from "@/services/leads";
import { todayNairobi } from "@/utils/date";
import { LeadForm } from "@/components/LeadForm";


export default function AddLead() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    const save = async (data: Parameters<typeof createLead>[0]) => {
        try {
            setSaving(true);
            await createLead(data);
            // router.navigate('/');
        } catch (e) {
            Alert.alert(
                "Could not save", e instanceof Error ? e.message : "Try again."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
            <LeadForm 
                title="Add lead" 
                initial={{ 
                    phoneNumber: "", 
                    name: "", dateToCall: todayNairobi(), 
                    location: "", 
                    package: "", 
                    estateName: "", 
                    apartmentName: "" 
                }} onSave={save} 
                saving={saving} 
            />
        )
}
