import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { updateLead } from "@/services/leads";
import type { Lead, LeadStatus } from "@/types/lead";

type StatusButtonProps = {
    lead: Lead;
    buttonStatus: LeadStatus;
};

export default function StatusButton({
    lead,
    buttonStatus,
}: StatusButtonProps) {
    const [currentStatus, setCurrentStatus] = useState(lead.status);

    const handlePress = async () => {
        await updateLead(lead.id, { status: buttonStatus });
        setCurrentStatus(buttonStatus);
    };

    return (
        <Pressable
            onPress={handlePress}
            style={[
                styles.status,
                currentStatus === buttonStatus && styles.statusActive,
            ]}
        >
            <Text
                style={[
                    styles.statusText,
                    currentStatus === buttonStatus && styles.statusTextActive,
                ]}
            >
                {buttonStatus}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    status: {
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderRadius: 12,
        backgroundColor: "#fff",
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
        color: "#fff",
    },
});
