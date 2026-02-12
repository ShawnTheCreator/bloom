import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius } from '../theme';
import { BloomLogo } from '../components/BloomLogo';
import { apiService } from '../services/api';

const { width } = Dimensions.get('window');

const features: string[] = [
  'Unlimited AI resale scans',
  'Zero marketplace fees',
  'Priority listing placement',
  'Advanced analytics dashboard',
  'Exclusive group-buy access',
  'Early access to new features',
];

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  popular: boolean;
  save?: string;
}

const plans: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$9.99',
    period: '/month',
    popular: false,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '$79.99',
    period: '/year',
    popular: true,
    save: 'Save 33%',
  },
];

interface PaywallScreenProps {
  onClose: () => void;
  onSubscribe: () => void;
}

const PaywallScreen: React.FC<PaywallScreenProps> = ({ onClose, onSubscribe }) => {
  const [selectedPlan, setSelectedPlan] = React.useState<string>('yearly');
  const vibrateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startVibration = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(vibrateAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(vibrateAnim, {
            toValue: -1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(vibrateAnim, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.delay(2000),
        ])
      ).start();
    };

    startVibration();
    return () => {
      vibrateAnim.stopAnimation();
    };
  }, []);

  const handleSubscribe = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Call backend to subscribe user (userId = 1 for demo)
      await apiService.subscribeUser(1);
      onSubscribe();
    } catch (error) {
      console.error('Subscription failed:', error);
    }
  };

  const ctaTranslateX = vibrateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-3, 0, 3],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={24} color={Colors.charcoal} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <BloomLogo size={60} color={Colors.powerPink} />
        </View>

        <Text style={styles.title}>Ready for Full Bloom?</Text>
        <Text style={styles.subtitle}>
          Unlock unlimited AI resale scans and zero marketplace fees
        </Text>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={16} color={Colors.white} strokeWidth={3} />
              </View>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardSelected,
              ]}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.9}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Ionicons name="ribbon" size={12} color={Colors.white} />
                  <Text style={styles.popularText}>POPULAR</Text>
                </View>
              )}
              
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                {plan.save && (
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveText}>{plan.save}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.planPriceRow}>
                <Text style={styles.planPrice}>{plan.price}</Text>
                <Text style={styles.planPeriod}>{plan.period}</Text>
              </View>
              
              <View style={[
                styles.radioCircle,
                selectedPlan === plan.id && styles.radioCircleSelected
              ]}>
                {selectedPlan === plan.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.guaranteeContainer}>
          <Ionicons name="shield" size={16} color={Colors.powerPink} />
          <Text style={styles.guaranteeText}>
            7-day free trial • Cancel anytime
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <Animated.View style={{ transform: [{ translateX: ctaTranslateX }] }}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleSubscribe}
            activeOpacity={0.9}
          >
            <Ionicons name="flash" size={20} color={Colors.white} />
            <Text style={styles.ctaText}>Start Free Trial</Text>
          </TouchableOpacity>
        </Animated.View>
        
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.blushWhite,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.charcoal,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.softDark,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: Spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.sageGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  featureText: {
    fontSize: 16,
    color: Colors.charcoal,
    fontWeight: '500',
  },
  plansContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  planCardSelected: {
    borderColor: Colors.deepPink,
    backgroundColor: `${Colors.deepPink}08`,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.deepPink,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  popularText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  saveBadge: {
    backgroundColor: Colors.sageGreen,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  saveText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  planPeriod: {
    fontSize: 14,
    color: Colors.softDark,
    marginLeft: 2,
  },
  radioCircle: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: Colors.deepPink,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.deepPink,
  },
  guaranteeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  guaranteeText: {
    color: Colors.softDark,
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.softPink,
  },
  ctaButton: {
    backgroundColor: Colors.deepPink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
    shadowColor: Colors.deepPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  restoreText: {
    color: Colors.softDark,
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.md,
    textDecorationLine: 'underline',
  },
});

export default PaywallScreen;
