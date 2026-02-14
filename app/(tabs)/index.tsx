import { StyleSheet, View, Text, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import MedicationCard from '@/components/MedicationCard';
import { getMedications, updateMedicationStatus, Medication } from '@/Data/database';

export default function HomeScreen() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch medications when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setIsLoading(true);
        const data = await getMedications();
        setMedications(data);
        setIsLoading(false);
      };
      fetchData();
    }, [])
  );

  // Handle status update (taken/missed)
  const handleStatusUpdate = async (id: string, status: 'taken' | 'missed') => {
    // Update in database
    const success = await updateMedicationStatus(id, status);
    
    if (success) {
      // Refresh the local state to show the change immediately
      const updatedData = await getMedications();
      setMedications(updatedData);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.date}>Today</Text>
          <Text style={styles.title}>Medications</Text>
        </View>

        <Text style={styles.sectionTitle}>Your List</Text>

        {/* Loading Indicator */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#0a7ea4" style={styles.loader} />
        ) : (
          <FlatList
            data={medications}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No medications yet. Tap "Add Med" to start.
              </Text>
            }
            renderItem={({ item }) => (
              <MedicationCard 
                name={item.name} 
                dosage={item.dosage} 
                time={item.frequency} 
                status={item.status}
                onPressTaken={() => handleStatusUpdate(item.id, 'taken')}
                onPressMissed={() => handleStatusUpdate(item.id, 'missed')}
              />
            )}
            contentContainerStyle={{ paddingBottom: 100 }}
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
    marginBottom: 24,
    marginTop: 10,
  },
  date: {
    fontSize: 14,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
    fontSize: 16,
  },
  loader: {
    marginTop: 50,
  },
});
