// Data/database.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  status?: 'taken' | 'missed';
  lastUpdated?: string;
}

const STORAGE_KEY = 'medication_data';

// Initialize with dummy data on first load
const initializeDummyData = async () => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    if (!existingData) {
      const dummyData: Medication[] = [
        { id: '1', name: 'Vitamin D', dosage: '1000 IU', frequency: 'Daily 9:00 AM' },
        { id: '2', name: 'Omega-3', dosage: '1000 MG', frequency: 'Daily 9:00 AM' },
      ];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dummyData));
    }
  } catch (e) {
    console.error("Error initializing dummy data", e);
  }
};

// Call initialization
initializeDummyData();

/**
 * Get all medications from storage
 */
export const getMedications = async (): Promise<Medication[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error loading medications", e);
    return [];
  }
};

/**
 * Add a new medication
 */
export const addMedication = async (newMed: Medication): Promise<boolean> => {
  try {
    const medications = await getMedications();
    const updatedList = [...medications, newMed];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    return true;
  } catch (e) {
    console.error("Error saving medication", e);
    return false;
  }
};

/**
 * Update medication status (taken/missed)
 */
export const updateMedicationStatus = async (
  id: string, 
  status: 'taken' | 'missed'
): Promise<boolean> => {
  try {
    const medications = await getMedications();
    const updatedList = medications.map(med => 
      med.id === id 
        ? { ...med, status, lastUpdated: new Date().toISOString() } 
        : med
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    return true;
  } catch (e) {
    console.error("Error updating medication status", e);
    return false;
  }
};

/**
 * Delete a medication
 */
export const deleteMedication = async (id: string): Promise<boolean> => {
  try {
    const medications = await getMedications();
    const updatedList = medications.filter(med => med.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    return true;
  } catch (e) {
    console.error("Error deleting medication", e);
    return false;
  }
};

/**
 * Barcode lookup table
 * Returns medication data if barcode is found in our database
 */
export const getMedicationByBarcode = (barcode: string): Partial<Medication> | null => {
  const barcodeLookupTable: Record<string, Partial<Medication>> = {
    "5012345678901": { name: "Paracetamol", dosage: "500mg" },
    "5098765432101": { name: "Ibuprofen", dosage: "200mg" },
    "5055555555501": { name: "Aspirin", dosage: "75mg" },
    "5044444444401": { name: "Vitamin C", dosage: "1000mg" },
  };
  
  return barcodeLookupTable[barcode] || null;
};
