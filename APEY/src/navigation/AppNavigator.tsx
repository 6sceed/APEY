import { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import SplashScreen from '../screens/SplashScreen';
import PinScreen from '../screens/PinScreen';
import HomeScreen from '../screens/HomeScreen';
import AccountsScreen from '../screens/AccountsScreen';
import BurnersScreen from '../screens/BurnersScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function MainTabNavigator({ onLockApp }: { onLockApp: () => void }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#09090b',
          borderTopColor: '#27272a',
          borderTopWidth: 1,
          height: 60,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#fafafa',
        tabBarInactiveTintColor: '#52525b',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'ellipse';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Accounts') {
            iconName = focused ? 'key' : 'key-outline';
          } else if (route.name === 'Burners') {
            iconName = focused ? 'flame' : 'flame-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size - 2} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Accounts" component={AccountsScreen} />
      <Tab.Screen name="Burners" component={BurnersScreen} />
      <Tab.Screen name="Settings">
        {(props) => <SettingsScreen {...props} onLockApp={onLockApp} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [appState, setAppState] = useState<'splash' | 'pin' | 'unlocked'>('splash');

  if (appState === 'splash') {
    return <SplashScreen onFinish={() => setAppState('pin')} />;
  }

  if (appState === 'pin') {
    return <PinScreen onSuccess={() => setAppState('unlocked')} />;
  }

  return <MainTabNavigator onLockApp={() => setAppState('pin')} />;
}