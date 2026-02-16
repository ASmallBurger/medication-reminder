import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';

interface MedicationCardProps {
  name: string;
  dosage: string;
  time: string;
  status?: 'taken' | 'missed';
  onPressTaken: () => void;
  onPressMissed: () => void;
  onDelete: () => void;
  onEdit: (updates: { name: string; dosage: string; frequency: string }) => void;
}

export default function MedicationCard({
  name,
  dosage,
  time,
  status,
  onPressTaken,
  onPressMissed,
  onDelete,
  onEdit,
}: MedicationCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(name);
  const [editDosage, setEditDosage] = useState(dosage);
  const [editFrequency, setEditFrequency] = useState(time);

  const handleDelete = () => {
    setMenuOpen(false);
    Alert.alert(
      'Delete Medication',
      `Are you sure you want to remove ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  const handleEditStart = () => {
    setMenuOpen(false);
    setEditName(name);
    setEditDosage(dosage);
    setEditFrequency(time);
    setEditing(true);
  };

  const handleEditSave = () => {
    if (!editName.trim() || !editDosage.trim() || !editFrequency.trim()) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }
    onEdit({
      name: editName.trim(),
      dosage: editDosage.trim(),
      frequency: editFrequency.trim(),
    });
    setEditing(false);
  };

  const handleEditCancel = () => {
    setEditing(false);
  };

  // ─── Edit Mode ───
  if (editing) {
    return (
      <View style={styles.card}>
        <Text style={styles.editTitle}>Edit Medication</Text>

        <TextInput
          style={styles.editInput}
          value={editName}
          onChangeText={setEditName}
          placeholder="Name"
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.editInput}
          value={editDosage}
          onChangeText={setEditDosage}
          placeholder="Dosage"
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.editInput}
          value={editFrequency}
          onChangeText={setEditFrequency}
          placeholder="Frequency / Time"
          placeholderTextColor="#999"
        />

        <View style={styles.editButtonGroup}>
          <TouchableOpacity style={styles.cancelEditButton} onPress={handleEditCancel}>
            <Text style={styles.cancelEditText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveEditButton} onPress={handleEditSave}>
            <Text style={styles.saveEditText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Normal Mode ───
  return (
    <View style={styles.card}>
      {/* Top row: info + menu button */}
      <View style={styles.topRow}>
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

        {/* Three-dot menu button (placed in thumb zone, right side) */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuOpen(!menuOpen)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.menuDots}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown menu */}
      {menuOpen && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={handleEditStart}>
            <Text style={styles.menuItemText}>✏️  Edit</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
            <Text style={[styles.menuItemText, styles.deleteText]}>🗑️  Delete</Text>
          </TouchableOpacity>
        </View>
      )}

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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoSection: {
    flex: 1,
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

  // ─── Menu ───
  menuButton: {
    padding: 4,
    marginLeft: 8,
  },
  menuDots: {
    fontSize: 22,
    color: '#666',
    fontWeight: 'bold',
  },
  menu: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  deleteText: {
    color: '#FF3B30',
  },

  // ─── Edit Mode ───
  editTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  editInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
  },
  editButtonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelEditButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#E5E5EA',
  },
  cancelEditText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  saveEditButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
  },
  saveEditText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // ─── Action Buttons ───
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
