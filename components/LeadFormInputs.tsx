import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View,} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Lead } from "@/types/lead";
import { Residence, ResidenceType, ResidenceProps } from "./Residence";

export { Residence, ResidenceType, type ResidenceProps };

export type FormData = Pick<
    Lead,
    | "phoneNumber"
    | "name"
    | "idNumber"
    | "dateToCall"
    | "location"
    | "package"
    | "estateName"
    | "apartmentName"
>;

export type InputProps = {
    label: string;
    value?: string;
} & React.ComponentProps<typeof TextInput>;

export type DateInputProps = {
    label?: string;
    value: string;
    onChangeDate: (date: string) => void;
};

export type LeadFormInputsProps = {
    form: FormData;
    onChange: (key: keyof FormData, value: string) => void;
    residenceType: ResidenceType;
    onSelectResidence: (type: ResidenceType) => void;
};

// Reusable text input
export function Input({
    label,
    value,
    ...props
}: InputProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.inputBox, isFocused && styles.inputFocused]}>
            <Text style={styles.label}>{label}</Text>

            <TextInput
                value={value ?? ""}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholderTextColor="#94A3B8"
                style={[
                    styles.input,
                    isFocused && styles.inputFocused,
                ]}
                {...props}
            />
        </View>
    );
}

// Reusable date picker input
export function DateInput({
    label = "Date to call *",
    value,
    onChangeDate,
}: DateInputProps) {
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Parse date string safely
    const parseDate = (val: string): Date => {
        const match = val?.match(/^(\d{4})-(\d{2})-(\d{2})$/);

        if (match) {
            const [, year, month, day] = match;

            const date = new Date(
                Number(year),
                Number(month) - 1,
                Number(day)
            );

            if (
                date.getFullYear() === Number(year) &&
                date.getMonth() === Number(month) - 1 &&
                date.getDate() === Number(day)
            ) {
                return date;
            }
        }

        return new Date();
    };

    // Format date as YYYY-MM-DD
    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    return (
        <View style={styles.inputBox}>
            <Text style={styles.label}>{label}</Text>

            <View style={styles.dateRow}>
                <TextInput
                    value={value ?? ""}
                    onChangeText={onChangeDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94A3B8"
                    style={styles.dateInput}
                />

                <Pressable
                    onPress={() => setShowDatePicker(!showDatePicker)}
                    style={styles.calendarButton}
                >
                    <Text style={styles.calendarIcon}>▦</Text>
                </Pressable>
            </View>

            {showDatePicker && (
                <DateTimePicker
                    value={parseDate(value)}
                    mode="date"
                    display={
                        Platform.OS === "ios"
                            ? "spinner"
                            : "default"
                    }
                    onChange={(_, selectedDate) => {
                        setShowDatePicker(false);

                        if (selectedDate) {
                            onChangeDate(formatDate(selectedDate));
                        }
                    }}
                />
            )}
        </View>
    );
}

// Composite component with all inputs
export function LeadFormInputs({
    form,
    onChange,
    residenceType,
    onSelectResidence,
}: LeadFormInputsProps) {
    return (
        <View style={styles.inputsWrapper}>
            {/* Personal information */}
            <Input
                label="Phone number *"
                value={form.phoneNumber}
                onChangeText={(v) => onChange("phoneNumber", v)}
                keyboardType="phone-pad"
            />

            <Input
                label="Name"
                value={form.name}
                onChangeText={(v) => onChange("name", v)}
            />

            <Input
                label="Id Number"
                value={form.idNumber}
                onChangeText={(v) => onChange("idNumber", v)}
            />

            <Input
                label="Package"
                value={form.package}
                onChangeText={(v) => onChange("package", v)}
            />

            {/* Date to call */}
            <DateInput
                label="Date to call *"
                value={form.dateToCall}
                onChangeDate={(v) => onChange("dateToCall", v)}
            />

            {/* Residency */}
            <Residence
                location={form.location}
                estateName={form.estateName}
                apartmentName={form.apartmentName}
                residenceType={residenceType}
                onChange={onChange}
                onSelect={onSelectResidence}
            />
        </View>
    );
}

export default LeadFormInputs;

const styles = StyleSheet.create({
    inputsWrapper: {
        borderRadius: 15,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        padding: 20, 
        paddingTop: 20, 
        backgroundColor: "white",
        // minHeight: "100%" 
    },
    inputBox: {
        marginBottom: 16,
        paddingTop: 3,
        marginTop: 3,
    },

    label: {
        color: "#64748B",
        fontSize: 12,
        fontWeight: "700",
        // marginBottom: 7,
    },

    input: {
        height: 35,
        borderBottomWidth: 1,
        borderBottomColor: "gray",
        paddingHorizontal: 5,
        color: "#0F172A",
        fontSize: 15,
        paddingBottom: 1,
    },

    inputFocused: {
        outlineWidth: 0,
        outlineStyle: "none",
        borderWidth: 0,
        borderColor: "transparent",
        borderBottomColor: "black",
    },

    // Date picker
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "gray",
    },

    dateInput: {
        flex: 1,
        height: 35,
        paddingHorizontal: 5,
        color: "#0F172A",
        fontSize: 15,
    },

    calendarButton: {
        width: 40,
        height: 35,
        alignItems: "center",
        justifyContent: "center",
    },

    calendarIcon: {
        fontSize: 22,
        color: "#64748B",
    },
});
