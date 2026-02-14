import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { addMedication, Medication } from '@/Data/database';

export default function AddMedicationScreen() {
  const router = useRouter();
  
  // State for form inputs
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Generate a unique ID for new medications
  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  // Save medication to database
  const handleSave = async () => {
    if (!name || !dosage || !frequency) {
      Alert.alert('Missing Info', 'Please fill in all the boxes.');
      return;
    }
    
    setIsSaving(true);
    
    const newMedication: Medication = {
      id: generateId(),
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
    };
    
    const success = await addMedication(newMedication);
    
    setIsSaving(false);
    
    if (success) {
      Alert.alert(
        'Success!', 
        `${name} has been added to your list.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear the form
              setName('');
              setDosage('');
              setFrequency('');
              // Navigate back to home screen
              router.back();
            }
          }
        ]
      );
    } else {
      Alert.alert('Error', 'Failed to save medication. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Add New Med</Text>
          <Text style={styles.subtitle}>Enter the details manually or scan.</Text>
        </View>

        {/* --- INPUT BOXES --- */}
        
        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Medication Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Ibuprofen"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        {/* Dosage Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dosage</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 200mg"
            placeholderTextColor="#999"
            value={dosage}
            onChangeText={setDosage}
          />
        </View>

        {/* Frequency Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Frequency / Time</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Daily at 9:00 AM"
            placeholderTextColor="#999"
            value={frequency}
            onChangeText={setFrequency}
          />
        </View>

        {/* --- BUTTONS --- */}

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          <IconSymbol name="plus.circle.fill" size={20} color="white" />
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save Medication'}
          </Text>
        </TouchableOpacity>

        {/* Scan Button (Placeholder for Camera later) */}
        <TouchableOpacity style={styles.scanButton}>
          <IconSymbol name="barcode.viewfinder" size={20} color="#0a7ea4" />
          <Text style={styles.scanButtonText}>Scan Barcode (Coming Soon)</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
    marginTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButton: {
    backgroundColor: '#0a7ea4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    marginTop: 20,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#6ba5ba',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scanButton: {
    marginTop: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  scanButtonText: {
    color: '#0a7ea4',
    fontSize: 16,
    fontWeight: '600',
  },
});
