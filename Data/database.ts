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

/*
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

/*
 * Update a medication's details
 */
export const updateMedication = async (
  id: string,
  updates: Partial<Pick<Medication, 'name' | 'dosage' | 'frequency'>>
): Promise<boolean> => {
  try {
    const medications = await getMedications();
    const updatedList = medications.map(med =>
      med.id === id ? { ...med, ...updates } : med
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    return true;
  } catch (e) {
    console.error("Error updating medication", e);
    return false;
  }
};

/**
 * Built-in barcode lookup table (starter database)
 */
const BUILT_IN_BARCODES: Record<string, Partial<Medication>> = {
  "5017848251872": { name: "Paracetamol", dosage: "500mg" },
  "5017353502469": { name: "Ibuprofen", dosage: "200mg" },
  "5055555555501": { name: "Aspirin", dosage: "75mg" },
  "7898665432143": { name: "Omega-3", dosage: "1000mg" },
};

const USER_BARCODES_KEY = 'user_barcode_data';

/**
 * Get medication data by barcode
 * First checks built-in database, then checks user-saved barcodes
 */
export const getMedicationByBarcode = async (barcode: string): Promise<Partial<Medication> | null> => {
  // Check built-in database first
  if (BUILT_IN_BARCODES[barcode]) {
    return BUILT_IN_BARCODES[barcode];
  }

  // Check user-saved barcodes
  try {
    const data = await AsyncStorage.getItem(USER_BARCODES_KEY);
    if (data) {
      const userBarcodes: Record<string, Partial<Medication>> = JSON.parse(data);
      if (userBarcodes[barcode]) {
        return userBarcodes[barcode];
      }
    }
  } catch (e) {
    console.error("Error reading user barcodes", e);
  }

  return null;
};

/**
 * Save a barcode -> medication mapping for future auto-fill
 * Skips if the barcode already exists in either database
 */
export const saveBarcodeMedication = async (
  barcode: string,
  name: string,
  dosage: string
): Promise<boolean> => {
  try {
    // Skip if already in built-in database
    if (BUILT_IN_BARCODES[barcode]) return true;

    // Load existing user barcodes
    const data = await AsyncStorage.getItem(USER_BARCODES_KEY);
    const userBarcodes: Record<string, Partial<Medication>> = data ? JSON.parse(data) : {};

    // Skip if already saved by user
    if (userBarcodes[barcode]) return true;

    // Save new barcode mapping
    userBarcodes[barcode] = { name, dosage };
    await AsyncStorage.setItem(USER_BARCODES_KEY, JSON.stringify(userBarcodes));
    return true;
  } catch (e) {
    console.error("Error saving barcode mapping", e);
    return false;
  }
};
