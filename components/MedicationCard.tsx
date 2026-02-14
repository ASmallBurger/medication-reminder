import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface MedicationCardProps {
  name: string;
  dosage: string;
  time: string;
  status?: 'taken' | 'missed';
  onPressTaken: () => void;
  onPressMissed: () => void;
}

export default function MedicationCard({
  name,
  dosage,
  time,
  status,
  onPressTaken,
  onPressMissed,
}: MedicationCardProps) {
  return (
    <View style={styles.card}>
      {/* Medication Info */}
      <View style={styles.infoSection}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.details}>
          {dosage} • {time}
        </Text>
        {status && (
          <Text style={[styles.statusText, status === 'taken' ? styles.takenText : styles.missedText]}>
            {status === 'taken' ? '✓ Taken' : '✗ Missed'}
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, styles.takenButton]}
          onPress={onPressTaken}
          disabled={status === 'taken'}
        >
          <Text style={styles.buttonText}>Taken</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.missedButton]}
          onPress={onPressMissed}
          disabled={status === 'missed'}
        >
          <Text style={styles.buttonText}>Missed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoSection: {
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  details: {
    fontSize: 16,
    color: '#666',
  },
  statusText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  takenText: {
    color: '#34C759',
  },
  missedText: {
    color: '#FF3B30',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  takenButton: {
    backgroundColor: '#34C759',
  },
  missedButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
