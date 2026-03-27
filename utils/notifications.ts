import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function requestNotificationPermissions() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0a7ea4',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export async function scheduleMedicationNotification(id: string, name: string, dosage: string, frequency: string) {
  // Cancel any existing notification with this ID
  await cancelMedicationNotification(id);

  // Parse frequency string "Daily at 9:00 AM"
  const timeMatch = frequency.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!timeMatch) return;

  let hour = parseInt(timeMatch[1], 10);
  const minute = parseInt(timeMatch[2], 10);
  const period = timeMatch[3].toUpperCase();

  if (period === 'PM' && hour < 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Medication Reminder 💊",
      body: `It's time to take your ${name} (${dosage}).`,
      data: { medicationId: id },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
    identifier: id,
  });
}

export async function cancelMedicationNotification(id: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (error) {
    console.log("Error canceling notification:", error);
  }
}
