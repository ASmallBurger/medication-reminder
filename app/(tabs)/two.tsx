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
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { IconSymbol } from '@/components/ui/icon-symbol';
import SchedulePicker from '@/components/SchedulePicker';
import { addMedication, getMedicationByBarcode, saveBarcodeMedication, Medication } from '@/Data/database';

export default function AddMedicationScreen() {
  const router = useRouter();

  // Camera permissions
  const [permission, requestPermission] = useCameraPermissions();

  // State for form inputs
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Scanner vs form mode
  const [mode, setMode] = useState<'scanner' | 'form'>('scanner');

  // Use a ref for scanned flag — refs update immediately (synchronous),
  // unlike useState which batches updates and can let multiple scan events through
  const scannedRef = useRef(false);

  // Track the last scanned barcode for self-learning database
  const lastBarcodeRef = useRef<string | null>(null);

  // Generate a unique ID for new medications
  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  // Handle barcode scanned
  const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
    // Ref check is synchronous — prevents multiple callbacks from firing
    if (scannedRef.current) return;
    scannedRef.current = true;

    const barcodeData = result.data;
    lastBarcodeRef.current = barcodeData;
    const medication = await getMedicationByBarcode(barcodeData);

    if (medication) {
      // Auto-fill the form with the matched medication data
      setName(medication.name || '');
      setDosage(medication.dosage || '');
      setMode('form');
      Alert.alert(
        'Medication Found!',
        `${medication.name} (${medication.dosage}) was detected. Please set your schedule and save.`
      );
    } else {
      // Barcode not in our database
      Alert.alert(
        'Not Recognized',
        'This barcode is not in the database. You can enter the details manually and it will be remembered for next time.',
        [
          {
            text: 'Add Manually',
            onPress: () => {
              setMode('form');
            }
          },
          {
            text: 'Scan Again',
            onPress: () => {
              scannedRef.current = false;
              lastBarcodeRef.current = null;
            }
          },
        ]
      );
    }
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

    // If this medication came from an unknown barcode scan, save it for future auto-fill
    if (success && lastBarcodeRef.current) {
      await saveBarcodeMedication(lastBarcodeRef.current, name.trim(), dosage.trim());
    }

    setIsSaving(false);

    if (success) {
      Alert.alert(
        'Success!',
        `${name} has been added to your list.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear the form and return to scanner mode
              setName('');
              setDosage('');
              setFrequency('');
              scannedRef.current = false;
              lastBarcodeRef.current = null;
              setMode('scanner');
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

  // Switch to manual form
  const handleAddManually = () => {
    scannedRef.current = false;
    setMode('form');
  };

  // Switch back to scanner from form
  const handleBackToScanner = () => {
    setName('');
    setDosage('');
    setFrequency('');
    scannedRef.current = false;
    lastBarcodeRef.current = null;
    setMode('scanner');
  };

  // ─── Permission Not Yet Determined ───
  if (!permission) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.permissionText}>Loading camera...</Text>
      </View>
    );
  }

  // ─── Permission Denied ───
  if (!permission.granted) {
    return (
      <View style={styles.centeredContainer}>
        <View style={styles.permissionCard}>
          <IconSymbol name="barcode.viewfinder" size={48} color="#0a7ea4" />
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>
            To scan medication barcodes, this app needs access to your camera.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.manualFallbackButton} onPress={handleAddManually}>
            <Text style={styles.manualFallbackText}>Add Medication Manually Instead</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Scanner Mode ───
  if (mode === 'scanner') {
    return (
      <View style={styles.scannerContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
          }}
          onBarcodeScanned={handleBarcodeScanned}
        />

        {/* Dark overlay with cutout */}
        <View style={styles.overlay}>
          {/* Top overlay */}
          <View style={styles.overlayTop} />

          {/* Middle row: left dark | clear center | right dark */}
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            <View style={styles.scanWindow}>
              {/* Corner accents */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <View style={styles.overlaySide} />
          </View>

          {/* Bottom overlay with instructions + button */}
          <View style={styles.overlayBottom}>
            <Text style={styles.scanInstruction}>
              Position the barcode inside the frame
            </Text>
            <TouchableOpacity style={styles.addManuallyButton} onPress={handleAddManually}>
              <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
              <Text style={styles.addManuallyText}>Add Manually</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ─── Form Mode ───
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.header}>
          <Text style={styles.title}>Add New Med</Text>
          <Text style={styles.subtitle}>
            {name ? 'Scanned details below — add your schedule.' : 'Enter the details manually.'}
          </Text>
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

        {/* Frequency & Time Picker */}
        <View style={styles.inputGroup}>
          <SchedulePicker value={frequency} onChange={setFrequency} />
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

        {/* Back to Scanner Button */}
        <TouchableOpacity style={styles.scanButton} onPress={handleBackToScanner}>
          <IconSymbol name="barcode.viewfinder" size={20} color="#0a7ea4" />
          <Text style={styles.scanButtonText}>Back to Scanner</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // ─── Shared ───
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    padding: 24,
  },

  // ─── Permission Screen ───
  centeredContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    width: '100%',
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  manualFallbackButton: {
    marginTop: 16,
    padding: 12,
  },
  manualFallbackText: {
    color: '#0a7ea4',
    fontSize: 15,
    fontWeight: '600',
  },

  // ─── Scanner Mode ───
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scanWindow: {
    width: 260,
    height: 160,
    borderRadius: 4,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#0a7ea4',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  overlayBottom: {
    flex: 1.5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    paddingTop: 32,
  },
  scanInstruction: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 24,
  },
  addManuallyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 14,
    gap: 8,
  },
  addManuallyText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  // ─── Form Mode ───
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
