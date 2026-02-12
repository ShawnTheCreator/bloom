import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
  Switch,
  Modal,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme';

const { width, height } = Dimensions.get('window');

interface BulkBuyCart {
  id: string;
  store: string;
  location: string;
  item: string;
  spotsLeft: number;
  totalSpots: number;
  discount: number;
  endTime: string;
  participants: number;
  coordinates: { x: number; y: number };
  pulseDelay: number;
}

interface ExpertMom {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  rating: number;
  availableNow: boolean;
  nextSlot: string;
  hourlyRate: number;
}

interface PurchaseTracking {
  pickupLocation: string;
  pickupWindow: string;
  pickupCode: string;
  status: 'purchased' | 'preparing' | 'ready';
}

const VillageScreen: React.FC = () => {
  const [mapView, setMapView] = useState(true);
  const [carts, setCarts] = useState<BulkBuyCart[]>([]);
  const [experts, setExperts] = useState<ExpertMom[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedCartId, setSelectedCartId] = useState<string | null>(null);
  const [joinedCartIds, setJoinedCartIds] = useState<Set<string>>(new Set());
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutCartId, setCheckoutCartId] = useState<string | null>(null);
  const [purchasedCartIds, setPurchasedCartIds] = useState<Set<string>>(new Set());
  const [trackingByCartId, setTrackingByCartId] = useState<Record<string, PurchaseTracking>>({});
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingCartId, setTrackingCartId] = useState<string | null>(null);
  const pulseAnims = useRef<{ [key: string]: Animated.Value }>({}).current;

  useEffect(() => {
    fetchBulkBuyCarts();
    fetchExpertMoms();
  }, []);

  useEffect(() => {
    // Initialize pulse animations for each cart
    carts.forEach(cart => {
      if (!pulseAnims[cart.id]) {
        pulseAnims[cart.id] = new Animated.Value(0);
      }
    });

    // Start pulse animations
    Object.keys(pulseAnims).forEach((key, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnims[key], {
            toValue: 1,
            duration: 1500,
            delay: index * 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnims[key], {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [carts]);

  const fetchBulkBuyCarts = () => {
    setCarts([
      {
        id: '1',
        store: 'Costco Woodmead',
        location: 'Woodmead, Sandton',
        item: 'Diapers Mega Pack',
        spotsLeft: 2,
        totalSpots: 8,
        discount: 35,
        endTime: '2h 30m',
        participants: 6,
        coordinates: { x: 120, y: 180 },
        pulseDelay: 0,
      },
      {
        id: '2',
        store: 'Checkers Hyper',
        location: 'Fourways Mall',
        item: 'Organic Baby Food',
        spotsLeft: 4,
        totalSpots: 12,
        discount: 28,
        endTime: '5h 15m',
        participants: 8,
        coordinates: { x: 280, y: 120 },
        pulseDelay: 1,
      },
      {
        id: '3',
        store: 'Makro',
        location: 'Crown Mines',
        item: 'Formula Bulk Buy',
        spotsLeft: 1,
        totalSpots: 6,
        discount: 42,
        endTime: '45m',
        participants: 5,
        coordinates: { x: 180, y: 280 },
        pulseDelay: 2,
      },
      {
        id: '4',
        store: 'Baby City',
        location: 'Sandton City',
        item: 'Stroller Group Buy',
        spotsLeft: 3,
        totalSpots: 5,
        discount: 25,
        endTime: '1d 4h',
        participants: 2,
        coordinates: { x: 220, y: 200 },
        pulseDelay: 3,
      },
    ]);
  };

  const openJoinModal = (cartId?: string) => {
    setSelectedCartId(cartId || null);
    setShowJoinModal(true);
  };

  const closeJoinModal = () => {
    setShowJoinModal(false);
    setSelectedCartId(null);
  };

  const openCheckout = (cartId: string) => {
    setCheckoutCartId(cartId);
    setShowCheckoutModal(true);
  };

  const closeCheckout = () => {
    setShowCheckoutModal(false);
    setCheckoutCartId(null);
  };

  const openTracking = (cartId: string) => {
    setTrackingCartId(cartId);
    setShowTrackingModal(true);
  };

  const closeTracking = () => {
    setShowTrackingModal(false);
    setTrackingCartId(null);
  };

  const completePurchase = () => {
    if (!checkoutCartId) return;
    const targetCart = carts.find(c => c.id === checkoutCartId);
    setPurchasedCartIds(prev => {
      const next = new Set(prev);
      next.add(checkoutCartId);
      return next;
    });

    setTrackingByCartId(prev => {
      const existing = prev[checkoutCartId];
      if (existing) return prev;
      const pickupCode = `${checkoutCartId}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      return {
        ...prev,
        [checkoutCartId]: {
          pickupLocation: targetCart ? `${targetCart.store} · ${targetCart.location}` : 'Pickup location not available',
          pickupWindow: 'Today 4:00 PM - 7:00 PM',
          pickupCode,
          status: 'purchased',
        },
      };
    });

    closeCheckout();
    Alert.alert(
      'Purchase complete',
      targetCart ? `You bought: ${targetCart.item}` : 'Your purchase is complete.',
      [
        { text: 'View pickup details', onPress: () => openTracking(checkoutCartId) },
        { text: 'OK' },
      ]
    );
  };

  const joinCart = (cartId: string) => {
    const targetCart = carts.find(c => c.id === cartId);
    if (!targetCart) return;
    if (joinedCartIds.has(cartId)) {
      Alert.alert('Already joined', 'You are already in this cart.');
      return;
    }
    if (targetCart.spotsLeft <= 0) {
      Alert.alert('Cart full', 'This cart is already full.');
      return;
    }

    setCarts(prev => prev.map(c => (
      c.id === cartId
        ? { ...c, spotsLeft: Math.max(0, c.spotsLeft - 1), participants: c.participants + 1 }
        : c
    )));
    setJoinedCartIds(prev => {
      const next = new Set(prev);
      next.add(cartId);
      return next;
    });
    closeJoinModal();
    Alert.alert('Joined cart', `You joined ${targetCart.store}`);
    openCheckout(cartId);
  };

  const fetchExpertMoms = () => {
    setExperts([
      {
        id: '1',
        name: 'Sarah Chen',
        specialty: 'Sleep Training Expert',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        rating: 4.9,
        availableNow: true,
        nextSlot: 'Now',
        hourlyRate: 45,
      },
      {
        id: '2',
        name: 'Emma Williams',
        specialty: 'Nutrition Consultant',
        avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
        rating: 4.8,
        availableNow: false,
        nextSlot: '3:00 PM',
        hourlyRate: 38,
      },
      {
        id: '3',
        name: 'Michelle Park',
        specialty: 'Newborn Care Specialist',
        avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
        rating: 5.0,
        availableNow: true,
        nextSlot: 'Now',
        hourlyRate: 55,
      },
      {
        id: '4',
        name: 'Lisa Johnson',
        specialty: 'Breastfeeding Coach',
        avatar: 'https://randomuser.me/api/portraits/women/55.jpg',
        rating: 4.7,
        availableNow: false,
        nextSlot: '5:30 PM',
        hourlyRate: 40,
      },
    ]);
  };

  const renderMapView = () => (
    <View style={styles.mapContainer}>
      {/* Slate Black Map Background */}
      <View style={styles.mapBackground}>
        {/* Grid lines */}
        <View style={styles.gridLines}>
          {[...Array(8)].map((_, i) => (
            <View key={`h-${i}`} style={[styles.gridLineH, { top: (i + 1) * (height * 0.35) / 8 }]} />
          ))}
          {[...Array(6)].map((_, i) => (
            <View key={`v-${i}`} style={[styles.gridLineV, { left: (i + 1) * width / 6 }]} />
          ))}
        </View>

        {/* Map Pins with Pink Pulses */}
        {carts.map((cart) => (
          <View
            key={cart.id}
            style={[styles.mapPin, { left: cart.coordinates.x, top: cart.coordinates.y }]}
          >
            {/* Pink Pulse Ring */}
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [
                    {
                      scale: pulseAnims[cart.id]?.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2.5],
                      }) || 1,
                    },
                  ],
                  opacity: pulseAnims[cart.id]?.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 0],
                  }) || 0.6,
                },
              ]}
            />
            {/* Pin Content */}
            <View style={styles.pinContent}>
              <Ionicons name="cart" size={16} color={Colors.white} />
              <Text style={styles.pinDiscount}>-{cart.discount}%</Text>
            </View>

            {/* Cart Info Popup */}
            <View style={styles.pinPopup}>
              <Text style={styles.pinStore}>{cart.store}</Text>
              <Text style={styles.pinItem} numberOfLines={1}>{cart.item}</Text>
              <View style={styles.pinSpots}>
                <Ionicons name="people" size={16} color={Colors.deepPink} />
                <Text style={styles.pinSpotsText}>{cart.spotsLeft} spots left</Text>
              </View>
            </View>
          </View>
        ))}

        {/* User Location Indicator */}
        <View style={styles.userLocation}>
          <View style={styles.userDot} />
          <View style={styles.userPulse} />
        </View>
      </View>

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.mapButton}>
          <Ionicons name="navigate" size={20} color={Colors.charcoal} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapButton}>
          <Ionicons name="map" size={20} color={Colors.charcoal} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderActiveGrids = () => (
    <View style={styles.gridsSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active Group-Buys</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      {carts.map((cart) => (
        <TouchableOpacity
          key={cart.id}
          style={styles.gridCard}
          onPress={() => openJoinModal(cart.id)}
          activeOpacity={0.9}
        >
          <View style={styles.gridIconContainer}>
            <Ionicons name="cart" size={24} color={Colors.deepPink} />
          </View>
          <View style={styles.gridContent}>
            <Text style={styles.gridStore}>{cart.store}</Text>
            <Text style={styles.gridItem}>{cart.item}</Text>
            <View style={styles.gridMeta}>
              <Ionicons name="location" size={12} color={Colors.lightGray} />
              <Text style={styles.gridLocation}>{cart.location}</Text>
            </View>
          </View>
          <View style={styles.gridRight}>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{cart.discount}%</Text>
            </View>
            <View style={styles.spotsBadge}>
              <Text style={cart.spotsLeft <= 2 ? styles.urgentSpotsText : styles.spotsText}>
                {cart.spotsLeft} left
              </Text>
            </View>
            {joinedCartIds.has(cart.id) && (
              <View style={styles.joinedBadge}>
                <Text style={styles.joinedText}>Joined</Text>
              </View>
            )}
            {purchasedCartIds.has(cart.id) && (
              <View style={styles.purchasedBadge}>
                <Text style={styles.purchasedText}>Purchased</Text>
              </View>
            )}
            <View style={styles.timeRow}>
              <Ionicons name="time" size={12} color={Colors.lightGray} />
              <Text style={styles.timeText}>{cart.endTime}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.lightGray} style={styles.chevron} />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderExpertCorner = () => (
    <View style={styles.expertSection}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="star" size={20} color={Colors.gold} />
          <Text style={styles.sectionTitle}>Featured Mums</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.expertScroll}
      >
        {experts.map((expert) => (
          <TouchableOpacity key={expert.id} style={styles.expertCard}>
            <View style={styles.expertHeader}>
              <Image source={{ uri: expert.avatar }} style={styles.expertAvatar} />
              {expert.availableNow && (
                <View style={styles.onlineIndicator} />
              )}
            </View>
            <Text style={styles.expertName}>{expert.name}</Text>
            <Text style={styles.expertSpecialty} numberOfLines={2}>{expert.specialty}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={Colors.gold} />
              <Text style={styles.ratingText}>{expert.rating}</Text>
            </View>
            <View style={styles.nextSlotRow}>
              <Ionicons name="calendar" size={12} color={Colors.lightGray} />
              <Text style={styles.nextSlotText}>
                {expert.availableNow ? 'Available now' : `Next: ${expert.nextSlot}`}
              </Text>
            </View>
            <View style={styles.rateBadge}>
              <Text style={styles.rateText}>${expert.hourlyRate}/15min</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header with Toggle */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>The Village</Text>
          <Text style={styles.headerSubtitle}>Social Saving & Coaching</Text>
        </View>
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Map</Text>
          <Switch
            value={mapView}
            onValueChange={setMapView}
            trackColor={{ false: Colors.lightGray, true: Colors.deepPink }}
            thumbColor={Colors.white}
          />
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Map or List View */}
        {mapView ? renderMapView() : renderActiveGrids()}

        {/* Always show grids in list below map */}
        {mapView && (
          <View style={styles.nearbySection}>
            <Text style={styles.nearbyTitle}>Nearby Carts</Text>
            {carts.slice(0, 3).map((cart) => (
              <TouchableOpacity
                key={cart.id}
                style={styles.miniGridCard}
                onPress={() => openJoinModal(cart.id)}
                activeOpacity={0.9}
              >
                <View style={styles.miniGridLeft}>
                  <Text style={styles.miniGridStore}>{cart.store}</Text>
                  <Text style={styles.miniGridItem}>{cart.item}</Text>
                </View>
                <View style={styles.miniGridRight}>
                  <Text style={styles.miniSpots}>{cart.spotsLeft} spots</Text>
                  <Text style={styles.miniDiscount}>-{cart.discount}%</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Expert Corner */}
        {renderExpertCorner()}

        {/* Bottom spacing for thumb zone */}
        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={showJoinModal}
        transparent
        animationType="slide"
        onRequestClose={closeJoinModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Join a Cart</Text>
              <TouchableOpacity onPress={closeJoinModal} style={styles.modalClose}>
                <Ionicons name="close" size={22} color={Colors.charcoal} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {carts.map(cart => {
                const isJoined = joinedCartIds.has(cart.id);
                const isFull = cart.spotsLeft <= 0;
                const isSelected = selectedCartId ? cart.id === selectedCartId : true;
                if (!isSelected && selectedCartId) return null;

                return (
                  <View key={cart.id} style={styles.modalRow}>
                    <View style={styles.modalRowLeft}>
                      <Text style={styles.modalRowStore}>{cart.store}</Text>
                      <Text style={styles.modalRowItem}>{cart.item}</Text>
                      <Text style={styles.modalRowMeta}>{cart.spotsLeft} spots left · -{cart.discount}%</Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.modalJoinButton,
                        (isJoined || isFull) && styles.modalJoinButtonDisabled,
                      ]}
                      disabled={isJoined || isFull}
                      onPress={() => joinCart(cart.id)}
                    >
                      <Text style={styles.modalJoinText}>
                        {isJoined ? 'Joined' : isFull ? 'Full' : 'Join'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showTrackingModal}
        transparent
        animationType="slide"
        onRequestClose={closeTracking}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pickup Tracking</Text>
              <TouchableOpacity onPress={closeTracking} style={styles.modalClose}>
                <Ionicons name="close" size={22} color={Colors.charcoal} />
              </TouchableOpacity>
            </View>

            {trackingCartId ? (() => {
              const tracking = trackingByCartId[trackingCartId];
              const cart = carts.find(c => c.id === trackingCartId);
              if (!tracking) return null;
              return (
                <>
                  <View style={styles.trackingCard}>
                    <Text style={styles.trackingItem}>{cart?.item || 'Group-buy item'}</Text>
                    <View style={styles.trackingRow}>
                      <Ionicons name="location" size={16} color={Colors.deepPink} />
                      <Text style={styles.trackingText}>{tracking.pickupLocation}</Text>
                    </View>
                    <View style={styles.trackingRow}>
                      <Ionicons name="time" size={16} color={Colors.deepPink} />
                      <Text style={styles.trackingText}>{tracking.pickupWindow}</Text>
                    </View>
                    <View style={styles.trackingCodeBox}>
                      <Text style={styles.trackingCodeLabel}>Pickup code</Text>
                      <Text style={styles.trackingCode}>{tracking.pickupCode}</Text>
                    </View>
                  </View>

                  <View style={styles.timeline}>
                    <View style={styles.timelineRow}>
                      <Ionicons name="checkmark-circle" size={18} color={Colors.sageGreen} />
                      <Text style={styles.timelineText}>Purchased</Text>
                    </View>
                    <View style={styles.timelineRow}>
                      <Ionicons
                        name={tracking.status === 'purchased' ? 'time' : 'checkmark-circle'}
                        size={18}
                        color={tracking.status === 'purchased' ? Colors.lightGray : Colors.sageGreen}
                      />
                      <Text style={styles.timelineText}>Preparing order</Text>
                    </View>
                    <View style={styles.timelineRow}>
                      <Ionicons
                        name={tracking.status === 'ready' ? 'checkmark-circle' : 'ellipse-outline'}
                        size={18}
                        color={tracking.status === 'ready' ? Colors.sageGreen : Colors.lightGray}
                      />
                      <Text style={styles.timelineText}>Ready for pickup</Text>
                    </View>
                  </View>
                </>
              );
            })() : null}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCheckoutModal}
        transparent
        animationType="slide"
        onRequestClose={closeCheckout}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Checkout</Text>
              <TouchableOpacity onPress={closeCheckout} style={styles.modalClose}>
                <Ionicons name="close" size={22} color={Colors.charcoal} />
              </TouchableOpacity>
            </View>

            {checkoutCartId ? (() => {
              const cart = carts.find(c => c.id === checkoutCartId);
              if (!cart) return null;
              return (
                <>
                  <View style={styles.checkoutSummary}>
                    <Text style={styles.checkoutStore}>{cart.store}</Text>
                    <Text style={styles.checkoutItem}>{cart.item}</Text>
                    <Text style={styles.checkoutMeta}>{cart.location}</Text>
                    <View style={styles.checkoutBadges}>
                      <View style={styles.checkoutBadge}>
                        <Ionicons name="people" size={14} color={Colors.deepPink} />
                        <Text style={styles.checkoutBadgeText}>{cart.participants} joined</Text>
                      </View>
                      <View style={styles.checkoutBadge}>
                        <Ionicons name="pricetag" size={14} color={Colors.deepPink} />
                        <Text style={styles.checkoutBadgeText}>-{cart.discount}%</Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.purchaseButton}
                    onPress={completePurchase}
                    disabled={purchasedCartIds.has(cart.id)}
                  >
                    <Ionicons name={purchasedCartIds.has(cart.id) ? 'checkmark-done' : 'card'} size={18} color={Colors.white} />
                    <Text style={styles.purchaseButtonText}>
                      {purchasedCartIds.has(cart.id) ? 'Purchased' : 'Complete Purchase'}
                    </Text>
                  </TouchableOpacity>
                </>
              );
            })() : null}
          </View>
        </View>
      </Modal>

      {/* Floating Join Button - Thumb Zone */}
      <TouchableOpacity style={styles.joinCartButton} onPress={() => openJoinModal()}>
        <Ionicons name="people" size={20} color={Colors.white} />
        <Text style={styles.joinCartText}>Join a Cart</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.blushWhite,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.softDark,
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  toggleLabel: {
    fontSize: 14,
    color: Colors.softDark,
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  mapContainer: {
    marginHorizontal: Spacing.lg,
    height: height * 0.4,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  mapBackground: {
    flex: 1,
    backgroundColor: '#2D3436', // Slate Black
    position: 'relative',
  },
  gridLines: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  mapPin: {
    position: 'absolute',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.deepPink,
    top: -10,
    left: -10,
  },
  pinContent: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.deepPink,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: Colors.deepPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  pinDiscount: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
    marginTop: -2,
  },
  pinPopup: {
    position: 'absolute',
    top: 45,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 120,
    zIndex: 3,
  },
  pinStore: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  pinItem: {
    fontSize: 11,
    color: Colors.softDark,
    marginTop: 2,
  },
  pinSpots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  pinSpotsText: {
    fontSize: 10,
    color: Colors.deepPink,
    fontWeight: '600',
  },
  userLocation: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.sageGreen,
    zIndex: 2,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  userPulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.sageGreen,
    opacity: 0.3,
  },
  mapControls: {
    position: 'absolute',
    right: Spacing.md,
    top: Spacing.md,
    gap: Spacing.sm,
  },
  mapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  nearbySection: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.lg,
  },
  nearbyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.charcoal,
    marginBottom: Spacing.md,
  },
  miniGridCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  miniGridLeft: {
    flex: 1,
  },
  miniGridStore: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  miniGridItem: {
    fontSize: 12,
    color: Colors.softDark,
    marginTop: 2,
  },
  miniGridRight: {
    alignItems: 'flex-end',
  },
  miniSpots: {
    fontSize: 12,
    color: Colors.deepPink,
    fontWeight: '600',
  },
  miniDiscount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.deepPink,
    marginTop: 2,
  },
  gridsSection: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  seeAllText: {
    color: Colors.deepPink,
    fontSize: 14,
    fontWeight: '600',
  },
  gridCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  gridIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  gridContent: {
    flex: 1,
  },
  gridStore: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  gridItem: {
    fontSize: 14,
    color: Colors.softDark,
    marginTop: 2,
  },
  gridMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  gridLocation: {
    fontSize: 12,
    color: Colors.lightGray,
  },
  gridRight: {
    alignItems: 'flex-end',
    marginRight: Spacing.sm,
    gap: 4,
  },
  discountBadge: {
    backgroundColor: Colors.deepPink,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  discountText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  spotsBadge: {
    backgroundColor: Colors.softPink,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  joinedBadge: {
    backgroundColor: Colors.sageGreen,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  joinedText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  purchasedBadge: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  purchasedText: {
    color: Colors.charcoal,
    fontSize: 11,
    fontWeight: '800',
  },
  spotsText: {
    color: Colors.deepPink,
    fontSize: 11,
    fontWeight: '600',
  },
  urgentSpotsText: {
    color: Colors.powerPink,
    fontSize: 11,
    fontWeight: '700',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: Colors.lightGray,
  },
  chevron: {
    marginLeft: Spacing.sm,
  },
  expertSection: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  expertScroll: {
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.lg,
    gap: Spacing.md,
  },
  expertCard: {
    width: 160,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  expertHeader: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  expertAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 35,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.sageGreen,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  expertName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  expertSpecialty: {
    fontSize: 12,
    color: Colors.softDark,
    marginTop: 2,
    lineHeight: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: Colors.charcoal,
    fontWeight: '600',
  },
  nextSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  nextSlotText: {
    fontSize: 11,
    color: Colors.lightGray,
  },
  rateBadge: {
    backgroundColor: Colors.softPink,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
  },
  rateText: {
    color: Colors.deepPink,
    fontSize: 12,
    fontWeight: '700',
  },
  joinCartButton: {
    position: 'absolute',
    bottom: Spacing.lg + 50,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.deepPink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    shadowColor: Colors.deepPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  joinCartText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.lg,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  modalClose: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: Colors.blushWhite,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    gap: Spacing.md,
  },
  modalRowLeft: {
    flex: 1,
  },
  modalRowStore: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  modalRowItem: {
    fontSize: 13,
    color: Colors.softDark,
    marginTop: 2,
  },
  modalRowMeta: {
    fontSize: 12,
    color: Colors.lightGray,
    marginTop: 4,
  },
  modalJoinButton: {
    backgroundColor: Colors.deepPink,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
  },
  modalJoinButtonDisabled: {
    backgroundColor: Colors.lightGray,
  },
  modalJoinText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
  },

  checkoutSummary: {
    paddingVertical: Spacing.md,
  },
  checkoutStore: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.charcoal,
  },
  checkoutItem: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.softDark,
    marginTop: 6,
  },
  checkoutMeta: {
    fontSize: 13,
    color: Colors.lightGray,
    marginTop: 6,
  },
  checkoutBadges: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    flexWrap: 'wrap',
  },
  checkoutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.blushWhite,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  checkoutBadgeText: {
    color: Colors.charcoal,
    fontWeight: '700',
    fontSize: 12,
  },
  purchaseButton: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.deepPink,
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  purchaseButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },

  trackingCard: {
    backgroundColor: Colors.blushWhite,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  trackingItem: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.charcoal,
    marginBottom: Spacing.sm,
  },
  trackingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  trackingText: {
    flex: 1,
    color: Colors.softDark,
    fontWeight: '600',
    fontSize: 13,
  },
  trackingCodeBox: {
    marginTop: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  trackingCodeLabel: {
    color: Colors.lightGray,
    fontWeight: '700',
    fontSize: 12,
  },
  trackingCode: {
    marginTop: 6,
    color: Colors.charcoal,
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 1,
  },
  timeline: {
    marginTop: Spacing.lg,
    gap: 12,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timelineText: {
    color: Colors.charcoal,
    fontWeight: '700',
    fontSize: 13,
  },
});

export default VillageScreen;
