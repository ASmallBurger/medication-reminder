import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// Helper component for Tab Icons
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0a7ea4',
        // Disable the static render of the header on web
        headerShown: useClientOnlyValue(false, true),
      }}>
      
      {/* Tab 1: Home Screen */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />

      {/* Tab 2: Add Medication Screen */}
      <Tabs.Screen
        name="two" 
        options={{
          title: 'Add Med',
          tabBarIcon: ({ color }) => <TabBarIcon name="plus" color={color} />,
        }}
      />

      {/* Tab 3: History Screen */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart" color={color} />,
        }}
      />

      {/* Tab 4: Archive Screen */}
      <Tabs.Screen
        name="archive"
        options={{
          title: 'Archive',
          tabBarIcon: ({ color }) => <TabBarIcon name="archive" color={color} />,
        }}
      />
    </Tabs>
  );
}