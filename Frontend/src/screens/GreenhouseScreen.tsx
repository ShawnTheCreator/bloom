import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, GlobalStyles } from '../theme';
import { RingProgress } from '../components/BloomLogo';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { apiService } from '../services/api';
import { Svg, Circle, Ellipse, Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Floating flower components
const FloatingFlower: React.FC<{ x: number; y: number; size: number; delay: number }> = ({ x, y, size, delay }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 3000 + delay,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 3000 + delay,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    animate();
  }, [animatedValue, delay]);
  
  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });
  
  const rotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '10deg'],
  });
  
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        transform: [{ translateY }, { rotate }],
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Circle
          cx="50"
          cy="50"
          r="8"
          fill={Colors.softPink}
          opacity="0.6"
        />
        {[0, 72, 144, 216, 288].map((angle, index) => (
          <Circle
            key={index}
            cx={50 + 15 * Math.cos((angle * Math.PI) / 180)}
            cy={50 + 15 * Math.sin((angle * Math.PI) / 180)}
            r="6"
            fill={Colors.rosePink}
            opacity="0.4"
          />
        ))}
      </Svg>
    </Animated.View>
  );
};

const FloatingLeaf: React.FC<{ x: number; y: number; size: number; delay: number }> = ({ x, y, size, delay }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 4000 + delay,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 4000 + delay,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    animate();
  }, [animatedValue, delay]);
  
  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });
  
  const rotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-5deg'],
  });
  
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        transform: [{ translateY }, { rotate }],
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Path
          d="M50 20 Q30 40 50 80 Q70 40 50 20"
          fill={Colors.sageGreen}
          opacity="0.3"
        />
      </Svg>
    </Animated.View>
  );
};

const HEADER_MAX_HEIGHT = 140;
const HEADER_MIN_HEIGHT = 80;

interface Stat {
  label: string;
  value: string;
  icon: string;
  change: string;
}

interface GreenhouseScreenProps {
  navigation: BottomTabNavigationProp<any>;
}

const GreenhouseScreen: React.FC<GreenhouseScreenProps> = ({ navigation }) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showScan, setShowScan] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserId();
  }, []);

  const fetchUserId = async () => {
    try {
      const users = await apiService.getUsers();
      if (users && users.length > 0) {
        setUserId(users[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    if (!userId) return;
    try {
      const summary = await apiService.getUserSummary(userId);
      setUserData(summary);
      setTransactions(summary.recentActivity || []);
    } catch (error: any) {
      console.error('Failed to fetch user data:', error);
      
      // If user not found (404), seed the demo data
      if (error.message?.includes('404')) {
        console.log('User not found, seeding demo data...');
        try {
          await apiService.seedDemoData();
          // Retry fetching user data
          const summary = await apiService.getUserSummary(userId);
          setUserData(summary);
          setTransactions(summary.recentActivity || []);
          return;
        } catch (seedError) {
          console.error('Failed to seed demo data:', seedError);
        }
      }
      
      // Use fallback data if API fails
      setUserData({
        totalSaved: 2847,
        itemsSold: 43,
        itemsBought: 12,
        co2SavedKg: 156,
        reputation: 85,
        isPremium: false,
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScan = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowScan(true);
    setTimeout(() => setShowScan(false), 2000);
  };

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });

  const totalSaved = userData?.totalSaved || 2847;
  const itemsSold = userData?.itemsSold || 43;
  const itemsBought = userData?.itemsBought || 12;
  const co2Saved = userData?.co2SavedKg || 156;

  const stats: Stat[] = [
    { label: 'Total Saved', value: `$${totalSaved}`, icon: DollarSign, change: '+12%' },
    { label: 'Items Sold', value: `${itemsSold}`, icon: TrendingUp, change: '+8' },
    { label: 'CO2 Saved', value: `${co2Saved}kg`, icon: Leaf, change: '+23kg' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Floating Background Elements */}
      <View style={styles.backgroundElements}>
        <FloatingFlower x={width * 0.1} y={100} size={60} delay={0} />
        <FloatingFlower x={width * 0.8} y={150} size={45} delay={500} />
        <FloatingFlower x={width * 0.6} y={300} size={55} delay={1000} />
        <FloatingLeaf x={width * 0.15} y={200} size={40} delay={200} />
        <FloatingLeaf x={width * 0.85} y={250} size={35} delay={800} />
        <FloatingLeaf x={width * 0.4} y={180} size={50} delay={1500} />
      </View>

      <Animated.ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <Animated.View
          style={[
            styles.header,
            {
              height: headerHeight,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.headerContent,
              {
                opacity: headerOpacity,
                transform: [{ translateY: headerTranslateY }],
              },
            ]}
          >
            <Text style={styles.greeting}>Watch your savings Bloom, Sarah.</Text>
            <Text style={styles.date}>February 2026</Text>
          </Animated.View>
          <Animated.Text style={[styles.headerSmall, { opacity: Animated.subtract(1, headerOpacity) }]}>
            Bloom
          </Animated.Text>
        </Animated.View>

        <View style={styles.content}>
          <View style={styles.ringContainer}>
            <RingProgress size={220} progress={0.72} />
            <View style={styles.ringCenter}>
              <Text style={styles.ringAmount}>$2,847</Text>
              <Text style={styles.ringLabel}>Total Growth</Text>
            </View>
};

// ...
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  ringAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.deepPink,
  },
  ringLabel: {
    fontSize: 14,
    color: Colors.softDark,
    marginTop: Spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: Spacing.xs,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.charcoal,
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.softDark,
    marginTop: 2,
  },
  statChange: {
    fontSize: 12,
    color: Colors.sageGreen,
    marginTop: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.charcoal,
    marginBottom: Spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  activityTime: {
    fontSize: 13,
    color: Colors.softDark,
    marginTop: 2,
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.sageGreen,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.deepPink,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: Colors.deepPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  scanFrame: {
    width: 280,
    height: 280,
    borderWidth: 2,
    borderColor: Colors.deepPink,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.deepPink,
  },
});

export default GreenhouseScreen;
