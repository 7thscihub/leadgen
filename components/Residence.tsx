import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export type ResidenceType = "estate" | "apartment" | "own compound";

export type ResidenceProps = {
    location: string;
    estateName: string;
    apartmentName: string;
    residenceType: ResidenceType;
    onChange: (
        key: "location" | "estateName" | "apartmentName",
        value: string
    ) => void;
    onSelect: (type: ResidenceType) => void;
};

const RESIDENCE_OPTIONS: { label: string; value: ResidenceType }[] = [
    { label: "Estate", value: "estate" },
    { label: "Apartment", value: "apartment" },
    { label: "Own Compound", value: "own compound" },
];

export function Residence({
    location,
    estateName,
    apartmentName,
    residenceType,
    onChange,
    onSelect,
}: ResidenceProps) {
    return (
        <View style={styles.residency}>
            <ResidenceInput
                label="Location"
                value={location}
                onChangeText={(v) => onChange("location", v)}
                placeholder="Enter location"
            />

            {/* Residence type radio buttons */}
            <View style={styles.radioGroupContainer}>
                <Text style={styles.label}>Residence</Text>
                <View style={styles.radioGroup}>
                    {RESIDENCE_OPTIONS.map((option) => {
                        const isSelected = residenceType === option.value;

                        return (
                            <Pressable
                                key={option.value}
                                accessibilityRole="radio"
                                accessibilityState={{ checked: isSelected }}
                                onPress={() => onSelect(option.value)}
                                style={styles.radioButton}
                            >
                                <View
                                    style={[
                                        styles.radioCircle,
                                        isSelected && styles.radioCircleSelected,
                                    ]}
                                >
                                    {isSelected && <View style={styles.radioDot} />}
                                </View>
                                <Text
                                    style={[
                                        styles.radioLabel,
                                        isSelected && styles.radioLabelSelected,
                                    ]}
                                >
                                    {option.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            {/* Conditional inputs */}
            {residenceType === "estate" && (
                <ResidenceInput
                    label="Estate name"
                    value={estateName}
                    onChangeText={(v) => onChange("estateName", v)}
                    placeholder="Enter estate name"
                />
            )}

            {residenceType === "apartment" && (
                <ResidenceInput
                    label="Apartment name"
                    value={apartmentName}
                    onChangeText={(v) => onChange("apartmentName", v)}
                    placeholder="Enter apartment name"
                />
            )}
        </View>
    );
}

/* Residency input */
export function ResidenceInput({
    label,
    value,
    ...props
}: {
    label: string;
    value?: string;
} & React.ComponentProps<typeof TextInput>) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.inputBox}>
            <Text style={styles.label}>{label}</Text>

            <TextInput
                value={value ?? ""}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholderTextColor="#94A3B8"
                style={[styles.input, isFocused && styles.inputFocused]}
                {...props}
            />
        </View>
    );
}

export default Residence;

const styles = StyleSheet.create({
    residency: {
        marginTop: 5,
        marginBottom: 5,
    },

    inputBox: {
        marginBottom: 16,
    },

    label: {
        color: "#64748B",
        fontSize: 12,
        fontWeight: "700",
        marginBottom: 7,
    },

    input: {
        height: 50,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
        paddingHorizontal: 5,
        color: "#0F172A",
        fontSize: 15,
        paddingBottom: 1,
    },

    inputFocused: {
        outlineWidth: 0,
        borderWidth: 0,
        borderColor: "transparent",
        borderBottomColor: "black",
    },

    radioGroupContainer: {
        marginBottom: 16,
    },

    radioGroup: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
        paddingTop: 4,
    },

    radioButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
    },

    radioCircle: {
        width: 10,
        height: 10,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#94A3B8",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },

    radioCircleSelected: {
        borderColor: "#0F172A",
    },

    radioDot: {
        width: 5,
        height: 5,
        borderRadius: 5,
        backgroundColor: "#0F172A",
    },

    radioLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#64748B",
    },

    radioLabelSelected: {
        color: "#0F172A",
        fontWeight: "700",
    },
});
