import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme';

interface FloralSplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

// Woman silhouette SVG component
const WomanSilhouette: React.FC<{ opacity: Animated.AnimatedInterpolation<number> }> = ({ opacity }) => (
  <Animated.View style={[styles.silhouetteContainer, { opacity }]}>
    <Svg width={200} height={280} viewBox="0 0 200 280" fill="none">
      {/* Hair - flowing waves */}
      <Path
        d="M100 20C60 20 30 50 25 90C20 130 30 160 35 180C40 200 50 220 60 240L140 240C150 220 160 200 165 180C170 160 180 130 175 90C170 50 140 20 100 20Z"
        fill="#2D1F1F"
      />
      {/* Hair details - waves */}
      <Path
        d="M25 90C30 80 40 85 45 95C50 105 40 115 35 110C30 105 25 100 25 90Z"
        fill="#1A1111"
      />
      <Path
        d="M175 90C170 80 160 85 155 95C150 105 160 115 165 110C170 105 175 100 175 90Z"
        fill="#1A1111"
      />
      {/* Face profile */}
      <Ellipse cx="100" cy="75" rx="35" ry="42" fill="#FFE4C4" />
      {/* Neck */}
      <Path
        d="M85 115L85 135L115 135L115 115C115 115 100 125 85 115Z"
        fill="#FFE4C4"
      />
      {/* Shoulders */}
      <Path
        d="M60 135C40 140 30 160 25 180C20 200 20 230 20 260L180 260C180 230 180 200 175 180C170 160 160 140 140 135C125 130 115 135 115 135L100 145L85 135C85 135 75 130 60 135Z"
        fill="#FFE4C4"
      />
      {/* Floral crown - pink roses */}
      <Circle cx="75" cy="45" r="12" fill={Colors.blushPink} />
      <Circle cx="75" cy="45" r="8" fill={Colors.rosePink} />
      <Circle cx="100" cy="38" r="14" fill={Colors.softPink} />
      <Circle cx="100" cy="38" r="10" fill={Colors.blushPink} />
      <Circle cx="125" cy="45" r="12" fill={Colors.rosePink} />
      <Circle cx="125" cy="45" r="8" fill={Colors.hotPink} />
      {/* Small flowers */}
      <Circle cx="60" cy="55" r="6" fill={Colors.lavender} />
      <Circle cx="140" cy="55" r="6" fill={Colors.lavender} />
      {/* Leaves */}
      <Path
        d="M70 35C65 30 70 25 75 30C80 35 75 40 70 35Z"
        fill={Colors.sageGreen}
      />
      <Path
        d="M130 35C135 30 130 25 125 30C120 35 125 40 130 35Z"
        fill={Colors.sageGreen}
      />
    </Svg>
  </Animated.View>
);

const FloralSplashScreen: React.FC<FloralSplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const silhouetteFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation sequence
    Animated.sequence([
      // Fade in and scale up the silhouette
      Animated.parallel([
        Animated.timing(silhouetteFade, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Slide in and fade text
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Hold for 2 seconds
      Animated.delay(2000),
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish();
    });
  }, []);

  return (
    <LinearGradient
      colors={[Colors.blushWhite, Colors.lightPink, Colors.paleRose]}
      style={styles.container}
    >
      {/* Decorative floral elements */}
      <View style={styles.flowerTopLeft}>
        <Svg width={100} height={100} viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="20" fill={Colors.softPink} opacity="0.6" />
          <Circle cx="50" cy="50" r="12" fill={Colors.blushPink} opacity="0.8" />
          <Path d="M50 30C45 20 55 20 50 30" fill={Colors.sageGreen} />
        </Svg>
      </View>
      
      <View style={styles.flowerBottomRight}>
        <Svg width={120} height={120} viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="25" fill={Colors.paleRose} opacity="0.5" />
          <Circle cx="50" cy="50" r="15" fill={Colors.rosePink} opacity="0.6" />
        </Svg>
      </View>

      <View style={styles.content}>
        <WomanSilhouette opacity={silhouetteFade} />
        
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.brandName}>Bloom</Text>
          <Text style={styles.tagline}>Where Savings Blossom</Text>
        </Animated.View>
      </View>

      {/* Decorative bottom flowers */}
      <View style={styles.bottomDecoration}>
        <Svg width={width} height={80} viewBox={`0 0 ${width} 80`} preserveAspectRatio="none">
          <Path
            d={`M0 80 Q${width * 0.25} 40 ${width * 0.5} 60 T${width} 40 L${width} 80 L0 80Z`}
            fill={Colors.softPink}
            opacity="0.4"
          />
          <Path
            d={`M0 60 Q${width * 0.3} 30 ${width * 0.6} 50 T${width} 30 L${width} 80 L0 80Z`}
            fill={Colors.blushPink}
            opacity="0.3"
          />
        </Svg>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  silhouetteContainer: {
    marginBottom: 24,
  },
  textContainer: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: 48,
    fontWeight: '300',
    color: Colors.deepPink,
    letterSpacing: 8,
    fontFamily: 'serif',
  },
  tagline: {
    fontSize: 16,
    color: Colors.softDark,
    marginTop: 8,
    letterSpacing: 2,
    fontWeight: '400',
  },
  flowerTopLeft: {
    position: 'absolute',
    top: 60,
    left: 20,
    opacity: 0.7,
  },
  flowerBottomRight: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    opacity: 0.6,
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default FloralSplashScreen;
