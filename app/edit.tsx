import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LeadForm } from "@/components/LeadForm";
import { getLead, updateLead } from "@/services/leads";
import { Lead } from "@/types/lead";


export default function EditLead() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [lead, setLead] = useState<Lead | null>(null);

    useEffect(() => {
        if (id) getLead(id).then(setLead).catch(console.warn);
    }, [id]);

    if (!lead) {
        return (
            <View style={{ flex: 1, justifyContent: "center" }}>
                <ActivityIndicator />
            </View>
        )
    }
    
    const exitRoute = `/lead/${lead.id}`

    const saveLead = async(data: any) => {
        try {
            await updateLead(lead.id, data);
        } catch (e) {
            Alert.alert(
                "Could not save", e instanceof Error ? e.message : "Try again."
            );
            throw e;
        }
    }

    return (
        <LeadForm 
            title="Edit Lead" 
            initial={lead} 
            status={lead.status} 
            onSave={saveLead}
            exitRoute={exitRoute}
        />
    );
}

