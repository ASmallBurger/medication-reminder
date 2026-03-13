import { StyleSheet, Text, View, SectionList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  getMedications,
  getArchivedMedications,
  Medication,
  ArchivedMedication,
} from '@/Data/database';

type SectionData =
  | { title: string; data: Medication[]; type: 'current' }
  | { title: string; data: ArchivedMedication[]; type: 'archived' };

export default function ArchiveScreen() {
  const [currentMeds, setCurrentMeds] = useState<Medication[]>([]);
  const [archivedMeds, setArchivedMeds] = useState<ArchivedMedication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setIsLoading(true);
        const [current, archived] = await Promise.all([
          getMedications(),
          getArchivedMedications(),
        ]);
        setCurrentMeds(current);
        setArchivedMeds(archived);
        setIsLoading(false);
      };
      fetchData();
    }, [])
  );

  const sections: SectionData[] = [
    { title: 'Current Medications', data: currentMeds, type: 'current' },
    { title: 'Deleted Medications', data: archivedMeds, type: 'archived' },
  ];

  const renderItem = ({ item, section }: { item: any; section: SectionData }) => {
    if (section.type === 'current') {
      const med = item as Medication;
      return (
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.medName}>{med.name}</Text>
            {med.status && (
              <View style={[
                styles.statusDot,
                med.status === 'taken' ? styles.takenDot : styles.missedDot,
              ]} />
            )}
          </View>
          <Text style={styles.medDetails}>{med.dosage} • {med.frequency}</Text>
        </View>
      );
    }

    const archived = item as ArchivedMedication;
    return (
      <View style={[styles.card, styles.archivedCard]}>
        <View style={styles.cardRow}>
          <Text style={[styles.medName, styles.archivedName]}>{archived.name}</Text>
          <Text style={styles.archivedBadge}>Deleted</Text>
        </View>
        <Text style={styles.medDetails}>{archived.dosage} • {archived.frequency}</Text>
        <Text style={styles.archivedDate}>Archived on {archived.archivedDate}</Text>
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: SectionData }) => (
    <Text style={styles.sectionTitle}>{section.title}</Text>
  );

  const renderSectionEmpty = ({ section }: { section: SectionData }) => {
    if (section.data.length === 0) {
      return (
        <Text style={styles.emptyText}>
          {section.type === 'current'
            ? 'No active medications.'
            : 'No deleted medications.'}
        </Text>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Archive</Text>
          <Text style={styles.subtitle}>All current and previously deleted medications</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#0a7ea4" style={styles.loader} />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            renderSectionFooter={renderSectionEmpty}
            contentContainerStyle={{ paddingBottom: 100 }}
            stickySectionHeadersEnabled={false}
          />
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  contentContainer: {
    padding: 20,
    flex: 1,
  },
  header: {
    marginBottom: 16,
    marginTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  archivedCard: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  medName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  archivedName: {
    color: '#666',
  },
  medDetails: {
    fontSize: 14,
    color: '#888',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  takenDot: {
    backgroundColor: '#34C759',
  },
  missedDot: {
    backgroundColor: '#FF3B30',
  },
  archivedBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9500',
    backgroundColor: '#FFF4E5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  archivedDate: {
    fontSize: 13,
    color: '#AAA',
    marginTop: 6,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 15,
    marginTop: 8,
    marginBottom: 20,
  },
  loader: {
    marginTop: 50,
  },
});
