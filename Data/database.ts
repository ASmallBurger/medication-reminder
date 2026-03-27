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

export interface MedicationLog {
  id: string;
  medicineName: string;
  status: 'taken' | 'missed';
  date: string;   // e.g. "2026-03-13"
  time: string;   // e.g. "16:45"
}

export interface ArchivedMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  archivedDate: string;
}

const STORAGE_KEY = 'medication_data';
const LOG_KEY = 'medication_log';
const ARCHIVE_KEY = 'medication_archive';

/**
 * Get all medications from storage
 */
export const getMedications = async (): Promise<Medication[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const medications: Medication[] = JSON.parse(data);
    const today = new Date().toISOString().split('T')[0];
    
    let needsSave = false;
    const currentMedications = medications.map(med => {
      // If last updated on a previous day and still has a "status", clear it
      if (med.lastUpdated && med.lastUpdated.split('T')[0] !== today && med.status !== undefined) {
        needsSave = true;
        return { ...med, status: undefined };
      }
      return med;
    });

    if (needsSave) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentMedications));
    }

    return currentMedications;
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

// ─── Medication Log ────────────────────────────────────────

/**
 * Add a log entry recording a taken/missed event
 */
export const addLogEntry = async (
  medicineName: string,
  status: 'taken' | 'missed'
): Promise<boolean> => {
  try {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    const existing = await getLogEntries();
    const existingIndex = existing.findIndex(
      e => e.medicineName === medicineName && e.date === dateStr
    );

    if (existingIndex !== -1) {
      // Update existing entry for today instead of creating duplicate
      existing[existingIndex].status = status;
      existing[existingIndex].time = timeStr;
      await AsyncStorage.setItem(LOG_KEY, JSON.stringify(existing));
    } else {
      // Create new entry
      const entry: MedicationLog = {
        id: now.getTime().toString() + Math.random().toString(36).substr(2, 5),
        medicineName,
        status,
        date: dateStr,
        time: timeStr,
      };
      await AsyncStorage.setItem(LOG_KEY, JSON.stringify([entry, ...existing]));
    }
    return true;
  } catch (e) {
    console.error("Error adding log entry", e);
    return false;
  }
};

/**
 * Get all log entries (newest first)
 */
export const getLogEntries = async (): Promise<MedicationLog[]> => {
  try {
    const data = await AsyncStorage.getItem(LOG_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading log entries", e);
    return [];
  }
};

// ─── Medication Archive ────────────────────────────────────

/**
 * Archive a medication (called before deletion)
 */
export const archiveMedication = async (med: Medication): Promise<boolean> => {
  try {
    const archived: ArchivedMedication = {
      id: med.id,
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      archivedDate: new Date().toISOString().split('T')[0],
    };
    const existing = await getArchivedMedications();
    await AsyncStorage.setItem(ARCHIVE_KEY, JSON.stringify([archived, ...existing]));
    return true;
  } catch (e) {
    console.error("Error archiving medication", e);
    return false;
  }
};

/**
 * Get all archived (deleted) medications
 */
export const getArchivedMedications = async (): Promise<ArchivedMedication[]> => {
  try {
    const data = await AsyncStorage.getItem(ARCHIVE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading archived medications", e);
    return [];
  }
};

// ─── Status & Delete (updated) ─────────────────────────────

/**
 * Update medication status (taken/missed) and log the event
 */
export const updateMedicationStatus = async (
  id: string,
  status: 'taken' | 'missed'
): Promise<boolean> => {
  try {
    const medications = await getMedications();
    const med = medications.find(m => m.id === id);
    const updatedList = medications.map(m =>
      m.id === id
        ? { ...m, status, lastUpdated: new Date().toISOString() }
        : m
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    // Log this event
    if (med) {
      await addLogEntry(med.name, status);
    }

    return true;
  } catch (e) {
    console.error("Error updating medication status", e);
    return false;
  }
};

/**
 * Delete a medication (archives it first)
 */
export const deleteMedication = async (id: string): Promise<boolean> => {
  try {
    const medications = await getMedications();
    const medToDelete = medications.find(med => med.id === id);

    // Archive before deleting
    if (medToDelete) {
      await archiveMedication(medToDelete);
    }

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
