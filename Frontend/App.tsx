import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from './src/theme';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

import FloralSplashScreen from './src/screens/FloralSplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import MarketplaceScreen from './src/screens/MarketplaceScreen';
import VillageScreen from './src/screens/VillageScreen';
import ScanSellScreen from './src/screens/ScanSellScreen';
import VaultScreen from './src/screens/VaultScreen';
import MessScreen from './src/screens/MessScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import SubmitProductScreen from './src/screens/SubmitProductScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

interface TabBarIconProps {
  focused: boolean;
  iconName: keyof typeof Ionicons.glyphMap;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ focused, iconName }) => (
  <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
    <Ionicons name={iconName} size={24} color={focused ? Colors.deepPink : Colors.lightGray} />
  </View>
);

const MainTabs: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin' || userRole === 'developer' || userRole === 'creator';

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.white,
            borderTopWidth: 1,
            borderTopColor: Colors.softPink,
            height: 84,
            paddingBottom: 20,
            paddingTop: 8,
          },
          tabBarShowLabel: true,
          tabBarActiveTintColor: Colors.deepPink,
          tabBarInactiveTintColor: Colors.lightGray,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 4,
          },
        }}
      >
        {/* Tab 1: Home Feed (Discovery) */}
        <Tab.Screen
          name="Home"
          component={MarketplaceScreen}
          options={{
            tabBarIcon: ({ focused }: { focused: boolean }) => (
              <TabBarIcon focused={focused} iconName="home" />
            ),
          }}
        />
        
        {/* Tab 2: Village (Social Commerce) */}
        <Tab.Screen
          name="Village"
          component={VillageScreen}
          options={{
            tabBarIcon: ({ focused }: { focused: boolean }) => (
              <TabBarIcon focused={focused} iconName="location" />
            ),
          }}
        />
        
        {/* Tab 3: Scan (Center Button) - Empty screen, opens modal */}
        <Tab.Screen
          name="Scan"
          component={View}
          options={{
            tabBarButton: () => (
              <TouchableOpacity 
                style={styles.scanButton}
                onPress={() => setScanModalVisible(true)}
              >
                <View style={styles.scanButtonInner}>
                  <Ionicons name="camera" size={28} color={Colors.white} />
                </View>
              </TouchableOpacity>
            ),
          }}
        />
        
        {/* Tab 4: Vault (Wallet) */}
        <Tab.Screen
          name="Vault"
          component={VaultScreen}
          options={{
            tabBarIcon: ({ focused }: { focused: boolean }) => (
              <TabBarIcon focused={focused} iconName="wallet" />
            ),
          }}
        />
        
        {/* Tab 5: Mess (Communication) */}
        <Tab.Screen
          name="Mess"
          component={MessScreen}
          options={{
            tabBarIcon: ({ focused }: { focused: boolean }) => (
              <TabBarIcon focused={focused} iconName="chatbubble-ellipses" />
            ),
          }}
        />

        {/* Tab 6: Admin (Only for admin/creator/developer) */}
        {isAdmin && (
          <Tab.Screen
            name="Admin"
            component={AdminDashboardScreen}
            options={{
              tabBarIcon: ({ focused }: { focused: boolean }) => (
                <TabBarIcon focused={focused} iconName="shield-checkmark" />
              ),
            }}
          />
        )}
      </Tab.Navigator>

      {/* Scan Modal */}
      {scanModalVisible && (
        <View style={StyleSheet.absoluteFillObject}>
          <ScanSellScreen onClose={() => setScanModalVisible(false)} />
        </View>
      )}
    </>
  );
};

const AuthNavigator: React.FC = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Signup" component={SignupScreen} />
  </AuthStack.Navigator>
);

interface PaywallWrapperProps {
  navigation: {
    goBack: () => void;
  };
}

const PaywallWrapper: React.FC<PaywallWrapperProps> = ({ navigation }) => {
  return (
    <PaywallScreen 
      onClose={() => navigation.goBack()} 
      onSubscribe={() => {
        navigation.goBack();
      }} 
    />
  );
};

const RootStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen 
        name="Paywall" 
        component={PaywallWrapper}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="SubmitProduct" 
        component={SubmitProductScreen}
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <FloralSplashScreen onFinish={() => setIsLoading(false)} />;
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <RootStack />
      </NavigationContainer>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: `${Colors.deepPink}20`,
  },
  scanButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.deepPink,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.deepPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: Colors.white,
  },
});

export default App;
