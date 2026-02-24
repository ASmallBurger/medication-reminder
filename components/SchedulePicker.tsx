import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';

interface SchedulePickerProps {
    value: string; // e.g. "Daily at 9:00 AM"
    onChange: (value: string) => void;
}

const HOURS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const MINUTES = ['00', '15', '30', '45'];
const PERIODS = ['AM', 'PM'];
const FREQUENCIES = ['Daily', 'Twice a Day', 'Three Times a Day', 'Weekly', 'As Needed'];

// Parse a stored string like "Daily at 9:00 AM" back into parts
function parseSchedule(value: string) {
    let freq = 'Daily';
    let hour = '9';
    let minute = '00';
    let period = 'AM';

    if (!value) return { freq, hour, minute, period };

    // Try to extract frequency
    for (const f of FREQUENCIES) {
        if (value.toLowerCase().startsWith(f.toLowerCase())) {
            freq = f;
            break;
        }
    }

    // Try to extract time like "9:00 AM" or "10:30 PM"
    const timeMatch = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (timeMatch) {
        hour = timeMatch[1];
        minute = timeMatch[2];
        period = timeMatch[3].toUpperCase();
    }

    return { freq, hour, minute, period };
}

function buildScheduleString(freq: string, hour: string, minute: string, period: string) {
    return `${freq} at ${hour}:${minute} ${period}`;
}

type PickerField = 'hour' | 'minute' | 'period' | 'frequency' | null;

export default function SchedulePicker({ value, onChange }: SchedulePickerProps) {
    const parsed = parseSchedule(value);
    const [hour, setHour] = useState(parsed.hour);
    const [minute, setMinute] = useState(parsed.minute);
    const [period, setPeriod] = useState(parsed.period);
    const [freq, setFreq] = useState(parsed.freq);
    const [openPicker, setOpenPicker] = useState<PickerField>(null);

    const update = (newHour?: string, newMinute?: string, newPeriod?: string, newFreq?: string) => {
        const h = newHour ?? hour;
        const m = newMinute ?? minute;
        const p = newPeriod ?? period;
        const f = newFreq ?? freq;
        onChange(buildScheduleString(f, h, m, p));
    };

    const selectHour = (h: string) => { setHour(h); update(h, undefined, undefined, undefined); setOpenPicker(null); };
    const selectMinute = (m: string) => { setMinute(m); update(undefined, m, undefined, undefined); setOpenPicker(null); };
    const selectPeriod = (p: string) => { setPeriod(p); update(undefined, undefined, p, undefined); setOpenPicker(null); };
    const selectFreq = (f: string) => { setFreq(f); update(undefined, undefined, undefined, f); setOpenPicker(null); };

    return (
        <View>
            {/* Frequency Dropdown */}
            <Text style={styles.label}>Frequency</Text>
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setOpenPicker(openPicker === 'frequency' ? null : 'frequency')}
            >
                <Text style={styles.dropdownText}>{freq}</Text>
                <Text style={styles.arrow}>{openPicker === 'frequency' ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {openPicker === 'frequency' && (
                <View style={styles.optionsList}>
                    {FREQUENCIES.map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.option, f === freq && styles.optionSelected]}
                            onPress={() => selectFreq(f)}
                        >
                            <Text style={[styles.optionText, f === freq && styles.optionTextSelected]}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Time Selector */}
            <Text style={[styles.label, { marginTop: 16 }]}>Time</Text>
            <View style={styles.timeRow}>
                {/* Hour */}
                <View style={styles.timeColumn}>
                    <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => setOpenPicker(openPicker === 'hour' ? null : 'hour')}
                    >
                        <Text style={styles.timeButtonText}>{hour}</Text>
                        <Text style={styles.smallArrow}>▼</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.timeSeparator}>:</Text>

                {/* Minute */}
                <View style={styles.timeColumn}>
                    <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => setOpenPicker(openPicker === 'minute' ? null : 'minute')}
                    >
                        <Text style={styles.timeButtonText}>{minute}</Text>
                        <Text style={styles.smallArrow}>▼</Text>
                    </TouchableOpacity>
                </View>

                {/* AM/PM */}
                <View style={styles.periodToggle}>
                    {PERIODS.map((p) => (
                        <TouchableOpacity
                            key={p}
                            style={[styles.periodButton, p === period && styles.periodButtonActive]}
                            onPress={() => selectPeriod(p)}
                        >
                            <Text style={[styles.periodText, p === period && styles.periodTextActive]}>{p}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Hour options */}
            {openPicker === 'hour' && (
                <View style={styles.timeOptionsList}>
                    {HOURS.map((h) => (
                        <TouchableOpacity
                            key={h}
                            style={[styles.timeOption, h === hour && styles.optionSelected]}
                            onPress={() => selectHour(h)}
                        >
                            <Text style={[styles.optionText, h === hour && styles.optionTextSelected]}>{h}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Minute options */}
            {openPicker === 'minute' && (
                <View style={styles.timeOptionsList}>
                    {MINUTES.map((m) => (
                        <TouchableOpacity
                            key={m}
                            style={[styles.timeOption, m === minute && styles.optionSelected]}
                            onPress={() => selectMinute(m)}
                        >
                            <Text style={[styles.optionText, m === minute && styles.optionTextSelected]}>{m}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
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

    // Time row
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    timeColumn: {
        flex: 1,
    },
    timeButton: {
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
    timeButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    smallArrow: {
        fontSize: 10,
        color: '#666',
    },
    timeSeparator: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    periodToggle: {
        flexDirection: 'row',
        backgroundColor: '#E5E5EA',
        borderRadius: 10,
        overflow: 'hidden',
    },
    periodButton: {
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    periodButtonActive: {
        backgroundColor: '#0a7ea4',
    },
    periodText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    periodTextActive: {
        color: '#fff',
    },

    // Time options
    timeOptionsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginTop: 4,
        padding: 4,
        gap: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    timeOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        minWidth: 50,
        alignItems: 'center',
    },
});
