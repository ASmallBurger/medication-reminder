import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import PieChart from '@/components/PieChart';
import { getLogEntries, MedicationLog } from '@/Data/database';

export default function HistoryScreen() {
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchLogs = async () => {
        setIsLoading(true);
        const data = await getLogEntries();
        setLogs(data);
        setIsLoading(false);
      };
      fetchLogs();
    }, [])
  );

  const takenCount = logs.filter(l => l.status === 'taken').length;
  const missedCount = logs.filter(l => l.status === 'missed').length;

  const renderLogItem = ({ item }: { item: MedicationLog }) => (
    <View style={styles.logCard}>
      <View style={styles.logLeft}>
        <Text style={styles.logMedName}>{item.medicineName}</Text>
        <Text style={styles.logDateTime}>{item.date}  {item.time}</Text>
      </View>
      <View style={[
        styles.statusBadge,
        item.status === 'taken' ? styles.takenBadge : styles.missedBadge
      ]}>
        <Text style={styles.statusBadgeText}>
          {item.status === 'taken' ? 'Taken' : 'Missed'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>Your medication tracking overview</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#0a7ea4" style={styles.loader} />
        ) : (
          <FlatList
            data={logs}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              <View style={styles.chartContainer}>
                <PieChart taken={takenCount} missed={missedCount} size={180} />
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No history yet. Mark medications as Taken or Missed on the Home tab.
                </Text>
              </View>
            }
            renderItem={renderLogItem}
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
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  logCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logLeft: {
    flex: 1,
  },
  logMedName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  logDateTime: {
    fontSize: 14,
    color: '#888',
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  takenBadge: {
    backgroundColor: '#E8F9ED',
  },
  missedBadge: {
    backgroundColor: '#FFECEB',
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    lineHeight: 24,
  },
  loader: {
    marginTop: 50,
  },
});
