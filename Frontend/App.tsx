import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet } from 'react-native';
import { Home, Store, Users, Crown, LucideIcon } from 'lucide-react-native';
import { Colors } from './src/theme';

import FloralSplashScreen from './src/screens/FloralSplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import GreenhouseScreen from './src/screens/GreenhouseScreen';
import MarketplaceScreen from './src/screens/MarketplaceScreen';
import HiveScreen from './src/screens/HiveScreen';
import PaywallScreen from './src/screens/PaywallScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

interface TabBarIconProps {
  focused: boolean;
  Icon: LucideIcon;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ focused, Icon }) => (
  <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
    <Icon size={24} color={focused ? Colors.deepPink : Colors.lightGray} />
  </View>
);

const MainTabs: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
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
      <Tab.Screen
        name="Greenhouse"
        component={GreenhouseScreen}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabBarIcon focused={focused} Icon={Home} />
          ),
        }}
      />
      <Tab.Screen
        name="Marketplace"
        component={MarketplaceScreen}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabBarIcon focused={focused} Icon={Store} />
          ),
        }}
      />
      <Tab.Screen
        name="Hive"
        component={HiveScreen}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabBarIcon focused={focused} Icon={Users} />
          ),
        }}
      />
      <Tab.Screen
        name="Bloom Pro"
        listeners={({ navigation }: { navigation: any }) => ({
          tabPress: (e: { preventDefault: () => void }) => {
            e.preventDefault();
            navigation.navigate('Paywall');
          },
        })}
        options={{
          tabBarIcon: ({ focused }: { focused: boolean }) => (
            <TabBarIcon focused={focused} Icon={Crown} />
          ),
        }}
      >
        {() => <View style={{ flex: 1, backgroundColor: Colors.blushWhite }} />}
      </Tab.Screen>
    </Tab.Navigator>
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
    </Stack.Navigator>
  );
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <FloralSplashScreen onFinish={() => setIsLoading(false)} />;
  }

  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
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
});

export default App;
