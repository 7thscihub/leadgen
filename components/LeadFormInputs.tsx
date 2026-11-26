import React, { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View,} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { Lead } from "@/types/lead";
import { Residence, type ResidenceProps, type ResidenceType } from "./Residence";

export { Residence, type ResidenceProps, type ResidenceType };

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
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [dateText, setDateText] = useState(value?.slice(0, 10) ?? "");

    const parseDate = (val: string): Date => {
        const match = val?.match(
            /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/
        );

        if (match) {
            const [, year, month, day, hour = "09", minute = "00"] = match;

            const date = new Date(
                Number(year),
                Number(month) - 1,
                Number(day),
                Number(hour),
                Number(minute)
            );

            if (
                date.getFullYear() === Number(year) &&
                date.getMonth() === Number(month) - 1 &&
                date.getDate() === Number(day) &&
                date.getHours() === Number(hour) &&
                date.getMinutes() === Number(minute)
            ) {
                return date;
            }
        }

        return new Date();
    };

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const formatTime = (date: Date) =>
        `${String(date.getHours()).padStart(2, "0")}:${String(
            date.getMinutes()
        ).padStart(2, "0")}`;

    const saveDateTime = (date: Date) =>
        onChangeDate(`${formatDate(date)}T${formatTime(date)}`);

    const selectedDate = parseDate(value);

    useEffect(() => {
        if (/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2})?$/.test(value)) {
            setDateText(value.slice(0, 10));
        }
    }, [value]);

    return (
        <View style={styles.inputBox}>
            <Text style={styles.label}>{label}</Text>

            <View style={styles.dateRow}>
                <TextInput
                    value={dateText}
                    onChangeText={(dateValue) => {
                        setDateText(dateValue);
                        if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
                            const date = parseDate(
                                `${dateValue}T${formatTime(selectedDate)}`
                            );
                            if (formatDate(date) === dateValue) {
                                saveDateTime(date);
                            }
                        }
                    }}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94A3B8"
                    style={styles.dateInput}
                />

                <Pressable
                    onPress={() => {
                        setShowTimePicker(false);
                        setShowDatePicker(!showDatePicker);
                    }}
                    style={styles.calendarButton}
                >
                    <Text style={styles.calendarIcon}>▦</Text>
                </Pressable>
                <Pressable
                    onPress={() => {
                        setShowDatePicker(false);
                        setShowTimePicker(!showTimePicker);
                    }}
                    style={styles.timeButton}
                >
                    <Text style={styles.timeText}>{formatTime(selectedDate)}</Text>
                </Pressable>
            </View>

            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={
                        Platform.OS === "ios"
                            ? "spinner"
                            : "default"
                    }
                    onChange={(_, selectedDate) => {
                        if (Platform.OS !== "ios") {
                            setShowDatePicker(false);
                        }

                        if (selectedDate) {
                            const updatedDate = new Date(selectedDate);
                            updatedDate.setHours(
                                parseDate(value).getHours(),
                                parseDate(value).getMinutes(),
                                0,
                                0
                            );
                            saveDateTime(updatedDate);
                        }
                    }}
                />
            )}

            {showTimePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(_, selectedTime) => {
                        if (Platform.OS !== "ios") {
                            setShowTimePicker(false);
                        }

                        if (selectedTime) {
                            const updatedDate = new Date(selectedDate);
                            updatedDate.setHours(
                                selectedTime.getHours(),
                                selectedTime.getMinutes(),
                                0,
                                0
                            );
                            saveDateTime(updatedDate);
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
        <View>
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
                label="Package/issue"
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
                location={form.location ?? ""}
                estateName={form.estateName ?? ""}
                apartmentName={form.apartmentName ?? ""}
                residenceType={residenceType}
                onChange={onChange}
                onSelect={onSelectResidence}
            />
        </View>
    );
}

export default LeadFormInputs;

const styles = StyleSheet.create({
    inputBox: {
        marginBottom: 3,
        paddingTop: 8,
        marginTop: 8,
        paddingBottom: 2
    },

    label: {
        color: "#64748B",
        fontSize: 12,
        fontWeight: "700",
        // marginBottom: 7,
    },

    input: {
        height: 50,
        borderBottomWidth: 1,
        borderBottomColor:"#E2E8F0",
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

    // Date picker
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },

    dateInput: {
        flex: 1,
        height: 50,
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
    timeButton: {
        minWidth: 58,
        height: 35,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 6,
    },
    timeText: {
        color: "#0F172A",
        fontSize: 14,
    },
});
