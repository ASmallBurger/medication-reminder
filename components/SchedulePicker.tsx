import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SchedulePickerProps {
    value: string; // e.g. "Daily at 9:00 AM" or "As Needed"
    onChange: (value: string) => void;
}

const FREQUENCIES = ['Daily', 'As Needed'] as const;
type Frequency = typeof FREQUENCIES[number];

function parseSchedule(value: string): { freq: Frequency; date: Date } {
    const date = new Date();
    date.setSeconds(0, 0);

    if (value && value.toLowerCase().startsWith('as needed')) {
        date.setHours(9, 0);
        return { freq: 'As Needed', date };
    }

    // Anything else (including legacy "Twice a Day", "Weekly", etc.) maps to Daily.
    const timeMatch = value?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (timeMatch) {
        let hour = parseInt(timeMatch[1], 10);
        const minute = parseInt(timeMatch[2], 10);
        const period = timeMatch[3].toUpperCase();
        if (period === 'PM' && hour < 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        date.setHours(hour, minute);
    } else {
        date.setHours(9, 0);
    }

    return { freq: 'Daily', date };
}

function formatTime(date: Date): string {
    let hour = date.getHours();
    const minute = date.getMinutes();
    const period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
}

function buildScheduleString(freq: Frequency, date: Date): string {
    if (freq === 'As Needed') return 'As Needed';
    return `${freq} at ${formatTime(date)}`;
}

export default function SchedulePicker({ value, onChange }: SchedulePickerProps) {
    const parsed = parseSchedule(value);
    const [freq, setFreq] = useState<Frequency>(parsed.freq);
    const [date, setDate] = useState<Date>(parsed.date);
    const [freqOpen, setFreqOpen] = useState(false);
    const [androidPickerOpen, setAndroidPickerOpen] = useState(false);

    const selectFreq = (f: Frequency) => {
        setFreq(f);
        setFreqOpen(false);
        onChange(buildScheduleString(f, date));
    };

    const handleTimeChange = (event: DateTimePickerEvent, selected?: Date) => {
        if (Platform.OS === 'android') {
            setAndroidPickerOpen(false);
        }
        if (event.type === 'set' && selected) {
            setDate(selected);
            onChange(buildScheduleString(freq, selected));
        }
    };

    return (
        <View>
            {/* Frequency Dropdown */}
            <Text style={styles.label}>Frequency</Text>
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setFreqOpen(!freqOpen)}
                accessibilityRole="button"
                accessibilityLabel={`Frequency: ${freq}. Tap to change.`}
            >
                <Text style={styles.dropdownText}>{freq}</Text>
                <Text style={styles.arrow}>{freqOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {freqOpen && (
                <View style={styles.optionsList}>
                    {FREQUENCIES.map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.option, f === freq && styles.optionSelected]}
                            onPress={() => selectFreq(f)}
                        >
                            <Text style={[styles.optionText, f === freq && styles.optionTextSelected]}>
                                {f}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Time Picker — hidden when frequency is "As Needed" */}
            {freq !== 'As Needed' && (
                <>
                    <Text style={[styles.label, { marginTop: 16 }]}>Time</Text>

                    {Platform.OS === 'ios' ? (
                        <View style={styles.iosPickerWrapper}>
                            <DateTimePicker
                                value={date}
                                mode="time"
                                display="spinner"
                                onChange={handleTimeChange}
                                minuteInterval={1}
                                themeVariant="light"
                            />
                        </View>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={styles.timeDisplay}
                                onPress={() => setAndroidPickerOpen(true)}
                                accessibilityRole="button"
                                accessibilityLabel={`Time: ${formatTime(date)}. Tap to change.`}
                            >
                                <Text style={styles.timeDisplayText}>{formatTime(date)}</Text>
                                <Text style={styles.smallArrow}>▼</Text>
                            </TouchableOpacity>

                            {androidPickerOpen && (
                                <DateTimePicker
                                    value={date}
                                    mode="time"
                                    display="spinner"
                                    onChange={handleTimeChange}
                                    is24Hour={false}
                                />
                            )}
                        </>
                    )}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginLeft: 4,
    },
    dropdownButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    dropdownText: {
        fontSize: 16,
        color: '#000',
    },
    arrow: {
        fontSize: 12,
        color: '#666',
    },
    optionsList: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginTop: 4,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    option: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    optionSelected: {
        backgroundColor: '#E8F4F8',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    optionTextSelected: {
        color: '#0a7ea4',
        fontWeight: '600',
    },

    // iOS — inline wheel picker
    iosPickerWrapper: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },

    // Android — tap-to-open trigger
    timeDisplay: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    timeDisplayText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    smallArrow: {
        fontSize: 12,
        color: '#666',
    },
});
