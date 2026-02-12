import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  Modal,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Colors, Spacing, BorderRadius } from '../theme';
import { apiService } from '../services/api';

// Icon wrapper for easier usage
const Icon = ({ name, size, color, style }: { name: keyof typeof Ionicons.glyphMap; size: number; color: string; style?: any }) => (
  <Ionicons name={name} size={size} color={color} style={style} />
);

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.lg * 2 - Spacing.sm) / 2;

interface MarketplaceItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  images: string[];
  seller: {
    userId: string;
    username: string;
    avatar: string;
    rating: number;
    location: string;
  };
  location: {
    type: string;
    coordinates: number[];
    address: string;
  };
  groupBuy?: {
    enabled: boolean;
    maxParticipants: number;
    currentParticipants: number;
    discountPercent: number;
    endTime: Date;
  };
  sustainability: {
    co2SavedKg: number;
    wasteDivertedKg: number;
  };
  status: string;
  views: number;
  likes: number;
  category: string;
}

interface GroupBuyDeal {
  id: string;
  title: string;
  discount: number;
  endTime: Date;
  participants: number;
  maxParticipants: number;
  imageUrl: string;
}

const MarketplaceScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['Furniture', 'Decor', 'Kitchen', 'Electronics']);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBuyDeals, setGroupBuyDeals] = useState<GroupBuyDeal[]>([]);
  const [momRecommendedDeals, setMomRecommendedDeals] = useState<MarketplaceItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [showGroupBuyModal, setShowGroupBuyModal] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');
  const categoriesFetched = useRef(false);

  // Notifications for new products
  interface ProductNotification {
    id: string;
    title: string;
    message: string;
    image: string;
    timestamp: number;
    productId: string;
  }
  const [notifications, setNotifications] = useState<ProductNotification[]>([]);
  const notificationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<MarketplaceItem | null>(null);

  // Purchase, Pickup, and Withdraw state
  const [purchasedItemIds, setPurchasedItemIds] = useState<Set<string>>(new Set());
  const [pickupInfoByItemId, setPickupInfoByItemId] = useState<Record<string, {
    pickupCode: string;
    pickupLocation: string;
    pickupTime: string;
    status: 'pending' | 'ready' | 'picked_up';
  }>>({});
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [selectedPickupItem, setSelectedPickupItem] = useState<MarketplaceItem | null>(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingItem, setTrackingItem] = useState<MarketplaceItem | null>(null);

  // Simulate new product notifications
  const simulateNewProductNotification = () => {
    const allMockItems = getMockItems();
    const randomItem = allMockItems[Math.floor(Math.random() * allMockItems.length)];
    const notification: ProductNotification = {
      id: Date.now().toString(),
      title: randomItem.title,
      message: `New ${randomItem.category} - $${randomItem.price}!`,
      image: randomItem.images[0],
      timestamp: Date.now(),
      productId: randomItem.id,
    };
    setNotifications(prev => [notification, ...prev].slice(0, 3));
    
    // Also trigger device notification
    schedulePushNotification(randomItem);
  };

  // Instant Pay functionality
  const handleInstantPay = (item: MarketplaceItem) => {
    Alert.alert(
      'Confirm Purchase',
      `Buy "${item.title}" for $${item.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Now',
          style: 'default',
          onPress: () => completePurchase(item)
        }
      ]
    );
  };

  const completePurchase = (item: MarketplaceItem) => {
    // Mark as purchased
    setPurchasedItemIds(prev => new Set([...prev, item.id]));
    
    // Generate pickup info
    const pickupCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const pickupInfo = {
      pickupCode,
      pickupLocation: `${item.seller.location} - Community Pickup Point`,
      pickupTime: 'Tomorrow, 10:00 AM - 6:00 PM',
      status: 'pending' as const,
    };
    
    setPickupInfoByItemId(prev => ({ ...prev, [item.id]: pickupInfo }));
    
    // Close product modal and show tracking
    setShowProductModal(false);
    setTrackingItem(item);
    setShowTrackingModal(true);
    
    // Show success
    Alert.alert('Purchase Complete!', `Your pickup code: ${pickupCode}`);
  };

  // Pickup functionality
  const handlePickup = (item: MarketplaceItem) => {
    const info = pickupInfoByItemId[item.id];
    if (info) {
      setSelectedPickupItem(item);
      setShowPickupModal(true);
    }
  };

  const confirmPickup = () => {
    if (selectedPickupItem) {
      setPickupInfoByItemId(prev => ({
        ...prev,
        [selectedPickupItem.id]: { ...prev[selectedPickupItem.id], status: 'picked_up' }
      }));
      setShowPickupModal(false);
      Alert.alert('Success!', 'Item picked up successfully!');
    }
  };

  // Withdraw/Cancel functionality
  const handleWithdraw = (item: MarketplaceItem) => {
    Alert.alert(
      'Cancel Order?',
      'This will cancel your purchase and refund will be processed.',
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Cancel & Refund',
          style: 'destructive',
          onPress: () => {
            setPurchasedItemIds(prev => {
              const newSet = new Set(prev);
              newSet.delete(item.id);
              return newSet;
            });
            setPickupInfoByItemId(prev => {
              const newInfo = { ...prev };
              delete newInfo[item.id];
              return newInfo;
            });
            setShowTrackingModal(false);
            Alert.alert('Cancelled', 'Your order has been cancelled and refunded.');
          }
        }
      ]
    );
  };

  const handleNotificationPress = (notification: ProductNotification) => {
    const product = items.find(item => item.id === notification.productId) || getMockItems().find(item => item.id === notification.productId);
    if (product) {
      setSelectedProductForModal(product);
      setShowProductModal(true);
      removeNotification(notification.id);
    }
  };

  // Device notification setup
  const schedulePushNotification = async (item: MarketplaceItem) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'New Product Alert!',
          body: `${item.title} - $${item.price}`,
          data: { productId: item.id },
        },
        trigger: { type: 'timeInterval', seconds: 1 } as any,
      });
    } catch (error) {
      console.log('Device notification failed:', error);
    }
  };

  useEffect(() => {
    // Request notification permissions
    const requestPermissions = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
      }
    };
    requestPermissions();
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Auto-simulate notifications periodically
  useEffect(() => {
    // Initial notification after 3 seconds
    const initialTimer = setTimeout(() => {
      simulateNewProductNotification();
    }, 3000);

    // Then every 15-25 seconds
    notificationTimerRef.current = setInterval(() => {
      simulateNewProductNotification();
    }, 20000);

    return () => {
      clearTimeout(initialTimer);
      if (notificationTimerRef.current) {
        clearInterval(notificationTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchItems();
  }, [selectedCategory]);

  useEffect(() => {
    if (categoriesFetched.current) return;
    categoriesFetched.current = true;
    fetchCategories();
    fetchGroupBuyDeals();
    fetchMomRecommendedDeals();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await apiService.getMarketplaceItems(selectedCategory);
      // Handle both response formats: {success: true, items: [...]} or direct array
      const data = response.items || response;
      setItems(data.map((item: any) => ({
        id: item._id?.toString() || item.id,
        title: item.title,
        price: item.price,
        originalPrice: item.originalPrice,
        images: item.images,
        seller: item.seller,
        location: item.location,
        groupBuy: item.groupBuy,
        sustainability: item.sustainability,
        status: item.status,
        views: item.views,
        likes: item.likes,
        category: item.category
      })));
    } catch (error) {
      console.error('Failed to fetch items:', error);
      // Use mock data when backend is unavailable
      setItems(getMockItems());
    }
  };

  const fetchGroupBuyDeals = async () => {
    // Mock data for now
    setGroupBuyDeals([
      {
        id: '1',
        title: 'Organic Baby Food Bundle',
        discount: 45,
        endTime: new Date(Date.now() + 17 * 60 * 60 * 1000),
        participants: 8,
        maxParticipants: 20,
        imageUrl: 'https://bloom-images.s3.amazonaws.com/deals/baby-food.jpg'
      },
      {
        id: '2',
        title: 'Eco-Friendly Diapers Pack',
        discount: 35,
        endTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
        participants: 15,
        maxParticipants: 25,
        imageUrl: 'https://bloom-images.s3.amazonaws.com/deals/diapers.jpg'
      }
    ]);
  };

  const fetchMomRecommendedDeals = async () => {
    // Mock data for now
    setMomRecommendedDeals(items.slice(0, 3));
  };

  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories();
      const cats = response.categories || response;
      console.log('Fetched categories:', cats);
      // Only add 'All' if it's not already in the list, and ensure no duplicates
      const newCategories = cats.includes('All') ? cats : ['All', ...cats];
      const uniqueCategories = [...new Set(newCategories)] as string[];
      console.log('Setting categories:', uniqueCategories);
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Don't update state if we already have categories with 'All'
      if (!categories.includes('All')) {
        setCategories(['All', 'appliances', 'furniture', 'electronics', 'clothing', 'books', 'home', 'sports']);
      }
    }
  };

  // Mock data for when backend is unavailable
  const getMockItems = (): MarketplaceItem[] => [
    {
      id: '1',
      title: 'Vintage Kitchen Mixer - Group Buy Special',
      price: 120,
      originalPrice: 299,
      images: ['https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=400'],
      seller: {
        userId: '1',
        username: 'sarah_bloom',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        rating: 4.8,
        location: 'Portland, OR'
      },
      location: {
        type: 'Point',
        coordinates: [-122.6765, 45.5231],
        address: 'Portland, OR'
      },
      groupBuy: {
        enabled: true,
        maxParticipants: 5,
        currentParticipants: 2,
        discountPercent: 20,
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      sustainability: { co2SavedKg: 12.5, wasteDivertedKg: 8.2 },
      status: 'active',
      views: 234,
      likes: 18,
      category: 'appliances'
    },
    {
      id: '2',
      title: 'Modern Office Chair - Ergonomic Design',
      price: 180,
      originalPrice: 450,
      images: ['https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=400'],
      seller: {
        userId: '2',
        username: 'mike_eco',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        rating: 4.9,
        location: 'Seattle, WA'
      },
      location: {
        type: 'Point',
        coordinates: [-122.3321, 47.6062],
        address: 'Seattle, WA'
      },
      sustainability: { co2SavedKg: 23.7, wasteDivertedKg: 15.3 },
      status: 'active',
      views: 156,
      likes: 12,
      category: 'furniture'
    },
    {
      id: '3',
      title: 'Smartphone Battery Pack - Group Buy',
      price: 25,
      originalPrice: 60,
      images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400'],
      seller: {
        userId: '2',
        username: 'mike_eco',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        rating: 4.9,
        location: 'Seattle, WA'
      },
      location: {
        type: 'Point',
        coordinates: [-122.3321, 47.6062],
        address: 'Seattle, WA'
      },
      groupBuy: {
        enabled: true,
        maxParticipants: 8,
        currentParticipants: 3,
        discountPercent: 25,
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      },
      sustainability: { co2SavedKg: 3.2, wasteDivertedKg: 1.8 },
      status: 'active',
      views: 445,
      likes: 31,
      category: 'electronics'
    },
    {
      id: '4',
      title: 'Vintage Coffee Table - Mid Century',
      price: 85,
      originalPrice: 220,
      images: ['https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400'],
      seller: {
        userId: '3',
        username: 'emma_vintage',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        rating: 4.7,
        location: 'Austin, TX'
      },
      location: {
        type: 'Point',
        coordinates: [-97.7431, 30.2672],
        address: 'Austin, TX'
      },
      sustainability: { co2SavedKg: 18.5, wasteDivertedKg: 12.0 },
      status: 'active',
      views: 189,
      likes: 24,
      category: 'furniture'
    },
    {
      id: '5',
      title: 'Designer Floor Lamp - Minimalist',
      price: 65,
      originalPrice: 180,
      images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400'],
      seller: {
        userId: '4',
        username: 'lisa_designs',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
        rating: 4.9,
        location: 'Denver, CO'
      },
      location: {
        type: 'Point',
        coordinates: [-104.9903, 39.7392],
        address: 'Denver, CO'
      },
      groupBuy: {
        enabled: true,
        maxParticipants: 6,
        currentParticipants: 4,
        discountPercent: 30,
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      },
      sustainability: { co2SavedKg: 8.3, wasteDivertedKg: 5.1 },
      status: 'active',
      views: 312,
      likes: 45,
      category: 'home'
    },
    {
      id: '6',
      title: 'Organic Cotton Bedding Set',
      price: 95,
      originalPrice: 200,
      images: ['https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=400'],
      seller: {
        userId: '5',
        username: 'organic_mom',
        avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656ec?w=100',
        rating: 5.0,
        location: 'San Francisco, CA'
      },
      location: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749],
        address: 'San Francisco, CA'
      },
      sustainability: { co2SavedKg: 15.2, wasteDivertedKg: 9.8 },
      status: 'active',
      views: 278,
      likes: 67,
      category: 'home'
    },
    {
      id: '7',
      title: 'Smart Home Thermostat',
      price: 75,
      originalPrice: 150,
      images: ['https://images.unsplash.com/photo-1563456023104-2428c4f62014?w=400'],
      seller: {
        userId: '6',
        username: 'tech_dad',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
        rating: 4.6,
        location: 'Chicago, IL'
      },
      location: {
        type: 'Point',
        coordinates: [-87.6298, 41.8781],
        address: 'Chicago, IL'
      },
      groupBuy: {
        enabled: true,
        maxParticipants: 10,
        currentParticipants: 7,
        discountPercent: 35,
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      },
      sustainability: { co2SavedKg: 45.0, wasteDivertedKg: 2.5 },
      status: 'active',
      views: 534,
      likes: 89,
      category: 'electronics'
    },
    {
      id: '8',
      title: 'Handmade Recycled Glass Vases',
      price: 35,
      originalPrice: 80,
      images: ['https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400'],
      seller: {
        userId: '7',
        username: 'artisan_crafts',
        avatar: 'https://images.unsplash.com/photo-1489424735102-74f6a6b2e6c6?w=100',
        rating: 4.8,
        location: 'Portland, OR'
      },
      location: {
        type: 'Point',
        coordinates: [-122.6765, 45.5231],
        address: 'Portland, OR'
      },
      sustainability: { co2SavedKg: 6.8, wasteDivertedKg: 8.5 },
      status: 'active',
      views: 145,
      likes: 22,
      category: 'home'
    },
    {
      id: '9',
      title: 'Vintage Leather Sofa - Restored',
      price: 320,
      originalPrice: 800,
      images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'],
      seller: {
        userId: '8',
        username: 'restore_pro',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        rating: 4.9,
        location: 'Brooklyn, NY'
      },
      location: {
        type: 'Point',
        coordinates: [-73.9442, 40.6782],
        address: 'Brooklyn, NY'
      },
      sustainability: { co2SavedKg: 85.0, wasteDivertedKg: 45.0 },
      status: 'active',
      views: 412,
      likes: 56,
      category: 'furniture'
    },
    {
      id: '10',
      title: 'Bamboo Baby Changing Table',
      price: 45,
      originalPrice: 120,
      images: ['https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400'],
      seller: {
        userId: '9',
        username: 'eco_parent',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        rating: 4.7,
        location: 'Miami, FL'
      },
      location: {
        type: 'Point',
        coordinates: [-80.1918, 25.7617],
        address: 'Miami, FL'
      },
      sustainability: { co2SavedKg: 12.0, wasteDivertedKg: 7.5 },
      status: 'active',
      views: 234,
      likes: 33,
      category: 'furniture'
    },
    {
      id: '11',
      title: 'Solar Garden Lights Set',
      price: 28,
      originalPrice: 65,
      images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
      seller: {
        userId: '10',
        username: 'green_garden',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100',
        rating: 4.5,
        location: 'Phoenix, AZ'
      },
      location: {
        type: 'Point',
        coordinates: [-112.0740, 33.4484],
        address: 'Phoenix, AZ'
      },
      groupBuy: {
        enabled: true,
        maxParticipants: 12,
        currentParticipants: 9,
        discountPercent: 40,
        endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
      },
      sustainability: { co2SavedKg: 25.0, wasteDivertedKg: 3.0 },
      status: 'active',
      views: 378,
      likes: 71,
      category: 'home'
    },
    {
      id: '12',
      title: 'Upcycled Denim Tote Bag',
      price: 22,
      originalPrice: 55,
      images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=400'],
      seller: {
        userId: '11',
        username: 'fashion_cycle',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
        rating: 4.8,
        location: 'Los Angeles, CA'
      },
      location: {
        type: 'Point',
        coordinates: [-118.2437, 34.0522],
        address: 'Los Angeles, CA'
      },
      sustainability: { co2SavedKg: 4.5, wasteDivertedKg: 1.8 },
      status: 'active',
      views: 156,
      likes: 28,
      category: 'clothing'
    },
    {
      id: '13',
      title: 'Children\'s Book Collection - 20 Books',
      price: 30,
      originalPrice: 80,
      images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400'],
      seller: {
        userId: '12',
        username: 'book_mom',
        avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100',
        rating: 5.0,
        location: 'Boston, MA'
      },
      location: {
        type: 'Point',
        coordinates: [-71.0589, 42.3601],
        address: 'Boston, MA'
      },
      sustainability: { co2SavedKg: 8.0, wasteDivertedKg: 12.0 },
      status: 'active',
      views: 267,
      likes: 44,
      category: 'books'
    },
    {
      id: '14',
      title: 'Electric Kettle - Energy Efficient',
      price: 18,
      originalPrice: 45,
      images: ['https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400'],
      seller: {
        userId: '13',
        username: 'kitchen_save',
        avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100',
        rating: 4.6,
        location: 'Atlanta, GA'
      },
      location: {
        type: 'Point',
        coordinates: [-84.3880, 33.7490],
        address: 'Atlanta, GA'
      },
      sustainability: { co2SavedKg: 5.5, wasteDivertedKg: 3.2 },
      status: 'active',
      views: 198,
      likes: 19,
      category: 'appliances'
    },
    {
      id: '15',
      title: 'Reclaimed Wood Dining Table',
      price: 275,
      originalPrice: 650,
      images: ['https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=400'],
      seller: {
        userId: '14',
        username: 'wood_craft',
        avatar: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=100',
        rating: 4.9,
        location: 'Nashville, TN'
      },
      location: {
        type: 'Point',
        coordinates: [-86.7816, 36.1627],
        address: 'Nashville, TN'
      },
      sustainability: { co2SavedKg: 62.0, wasteDivertedKg: 38.0 },
      status: 'active',
      views: 445,
      likes: 82,
      category: 'furniture'
    }
  ];

  const toggleLike = (id: string) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleJoinGroupBuy = async (item: MarketplaceItem) => {
    setSelectedItem(item);
    setShowGroupBuyModal(true);
    setJoinError('');
  };

  const confirmJoinGroupBuy = async () => {
    if (!selectedItem) return;
    
    setIsJoining(true);
    setJoinError('');
    
    try {
      // For demo, use a mock user ID - in production, get from auth context
      const userId = 'demo-user-id';
      const username = 'Demo User';
      
      const result = await apiService.joinGroupBuy(selectedItem.id, userId, username);
      
      if (result.success) {
        // Update the item in the list
        setItems(prev => prev.map(item => 
          item.id === selectedItem.id 
            ? { ...item, groupBuy: result.item.groupBuy }
            : item
        ));
        setShowGroupBuyModal(false);
        setSelectedItem(null);
      } else {
        setJoinError(result.error || 'Failed to join group buy');
      }
    } catch (error) {
      setJoinError('Network error. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const renderHeroSection = () => (
    <View style={styles.heroSection}>
      {/* Live Group-Buy Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.bannerContent}>
          <View style={styles.bannerLeft}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <Text style={styles.bannerTitle}>Flash Group-Buy</Text>
            <Text style={styles.bannerSubtitle}>Save up to 45% on mom-approved essentials</Text>
            <View style={styles.countdownContainer}>
              <Ionicons name="time" size={14} color={Colors.white} />
              <Text style={styles.countdownText}>Ends in 17:24:29</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.joinButton}>
            <Ionicons name="people" size={16} color={Colors.deepPink} />
            <Text style={styles.joinButtonText}>Join Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mom-Recommended Deals */}
      <View style={styles.recommendedSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Icon name="star" size={20} color={Colors.deepPink} />
            <Text style={styles.sectionTitle}>Mom-Recommended</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendedScroll}>
          {momRecommendedDeals.slice(0, 3).map((item) => (
            <TouchableOpacity key={item.id} style={styles.recommendedCard}>
              <Image source={{ uri: item.images[0] }} style={styles.recommendedImage} />
              <View style={styles.recommendedOverlay}>
                <Text style={styles.recommendedTitle}>{item.title}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.currentPrice}>${item.price}</Text>
                  {item.originalPrice && (
                    <Text style={styles.originalPrice}>${item.originalPrice}</Text>
                  )}
                </View>
                <View style={styles.discountBadge}>
                  <Icon name="trending-up" size={12} color={Colors.white} />
                  <Text style={styles.discountText}>
                    {Math.round((1 - item.price / (item.originalPrice || item.price)) * 100)}% OFF
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderMasonryItem = ({ item, index }: { item: MarketplaceItem; index: number }) => {
    const isEven = index % 2 === 0;
    const cardHeight = isEven ? 280 : 220;
    
    return (
      <TouchableOpacity 
        key={item.id}
        style={[styles.masonryCard, { height: cardHeight }]} 
        activeOpacity={0.9}
      >
        <View style={styles.masonryImageContainer}>
          <Image source={{ uri: item.images[0] }} style={styles.masonryImage} />
          {item.groupBuy?.enabled && (
            <TouchableOpacity 
              style={styles.groupBuyBadge}
              onPress={() => handleJoinGroupBuy(item)}
            >
              <Icon name="people" size={12} color={Colors.white} />
              <Text style={styles.groupBuyText}>-{item.groupBuy.discountPercent}%</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.heartButton} 
            onPress={() => toggleLike(item.id)}
          >
            <Icon 
              name={likedItems.has(item.id) ? "heart" : "heart-outline"} 
              size={16} 
              color={likedItems.has(item.id) ? Colors.deepPink : Colors.white} 
            />
          </TouchableOpacity>
        </View>
        <View style={styles.masonryContent}>
          <Text style={styles.masonryTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.masonrySeller}>
            <Image source={{ uri: item.seller.avatar }} style={styles.sellerAvatar} />
            <Text style={styles.sellerName}>{item.seller.username}</Text>
            <View style={styles.rating}>
              <Icon name="star" size={12} color={Colors.gold} />
              <Text style={styles.ratingText}>{item.seller.rating}</Text>
            </View>
          </View>
          <View style={styles.masonryFooter}>
            <Text style={styles.masonryPrice}>${item.price}</Text>
            <View style={styles.locationBadge}>
              <Icon name="location-outline" size={10} color={Colors.lightGray} />
              <Text style={styles.locationText}>2.5 km</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Top Bar with Search, Sell and Scan */}
      <View style={styles.topBar}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={Colors.lightGray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search local treasures..."
            placeholderTextColor={Colors.lightGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={styles.sellButton}
          onPress={() => navigation.navigate('SubmitProduct')}
        >
          <Icon name="add" size={20} color={Colors.deepPink} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.scanButton}>
          <Icon name="camera" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        {renderHeroSection()}

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category, index) => (
            <TouchableOpacity
              key={`${category}-${index}`}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Masonry Grid */}
        <View style={styles.masonryContainer}>
          {items.map((item, index) => (
            <View key={item.id}>
              {renderMasonryItem({ item, index })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Notification Toasts */}
      <View style={styles.notificationsContainer}>
        {notifications.map((notification, index) => (
          <TouchableOpacity
            key={notification.id}
            style={[styles.notificationToast, { top: 60 + index * 75 }]}
            onPress={() => handleNotificationPress(notification)}
            activeOpacity={0.9}
          >
            <Image source={{ uri: notification.image }} style={styles.notificationImage} />
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>New: {notification.title}</Text>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationClose}
              onPress={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
            >
              <Ionicons name="close" size={16} color={Colors.lightGray} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      {/* Group Buy Modal */}
      <Modal
        visible={showGroupBuyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGroupBuyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Join Group Buy</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowGroupBuyModal(false)}
              >
                <Icon name="close" size={24} color={Colors.charcoal} />
              </TouchableOpacity>
            </View>

            {selectedItem && (
              <ScrollView style={styles.modalBody}>
                <Image 
                  source={{ uri: selectedItem.images[0] }} 
                  style={styles.modalImage} 
                />
                <Text style={styles.modalItemTitle}>{selectedItem.title}</Text>
                
                <View style={styles.priceContainer}>
                  <Text style={styles.currentPriceModal}>${selectedItem.price}</Text>
                  {selectedItem.originalPrice && (
                    <Text style={styles.originalPriceModal}>${selectedItem.originalPrice}</Text>
                  )}
                </View>

                {selectedItem.groupBuy && (
                  <View style={styles.groupBuyInfo}>
                    <View style={styles.discountBadgeLarge}>
                      <Text style={styles.discountTextLarge}>
                        Save {selectedItem.groupBuy.discountPercent}%!
                      </Text>
                    </View>
                    
                    <View style={styles.participantsRow}>
                      <Icon name="people" size={20} color={Colors.deepPink} />
                      <Text style={styles.participantsText}>
                        {selectedItem.groupBuy.currentParticipants} / {selectedItem.groupBuy.maxParticipants} joined
                      </Text>
                    </View>

                    <View style={styles.progressBarContainer}>
                      <View 
                        style={[
                          styles.progressBar, 
                          { 
                            width: `${(selectedItem.groupBuy.currentParticipants / selectedItem.groupBuy.maxParticipants) * 100}%` 
                          }
                        ]} 
                      />
                    </View>

                    <Text style={styles.spotsLeftText}>
                      {selectedItem.groupBuy.maxParticipants - selectedItem.groupBuy.currentParticipants} spots remaining
                    </Text>
                  </View>
                )}

                {joinError ? (
                  <Text style={styles.errorText}>{joinError}</Text>
                ) : null}

                <TouchableOpacity 
                  style={[styles.joinGroupBuyButton, isJoining && styles.joinButtonDisabled]}
                  onPress={confirmJoinGroupBuy}
                  disabled={isJoining}
                >
                  {isJoining ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <>
                      <Icon name="cart" size={20} color={Colors.white} />
                      <Text style={styles.joinButtonTextModal}>Join Group Buy</Text>
                    </>
                  )}
                </TouchableOpacity>

                <Text style={styles.termsText}>
                  By joining, you agree to split the cost with other buyers. 
                  You'll be notified when the group is full.
                </Text>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Product Detail Modal - from Notification */}
      <Modal
        visible={showProductModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProductModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Product Details</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowProductModal(false)}
              >
                <Icon name="close" size={24} color={Colors.charcoal} />
              </TouchableOpacity>
            </View>

            {selectedProductForModal && (
              <ScrollView style={styles.modalBody}>
                <Image 
                  source={{ uri: selectedProductForModal.images[0] }} 
                  style={styles.modalImage} 
                />
                <Text style={styles.modalItemTitle}>{selectedProductForModal.title}</Text>
                
                <View style={styles.priceContainer}>
                  <Text style={styles.currentPriceModal}>${selectedProductForModal.price}</Text>
                  {selectedProductForModal.originalPrice && (
                    <Text style={styles.originalPriceModal}>${selectedProductForModal.originalPrice}</Text>
                  )}
                </View>

                <View style={styles.sellerRow}>
                  <Image source={{ uri: selectedProductForModal.seller.avatar }} style={styles.sellerAvatarModal} />
                  <View>
                    <Text style={styles.sellerNameModal}>{selectedProductForModal.seller.username}</Text>
                    <View style={styles.ratingRow}>
                      <Icon name="star" size={14} color={Colors.gold} />
                      <Text style={styles.ratingTextModal}>{selectedProductForModal.seller.rating}</Text>
                    </View>
                  </View>
                </View>

                {selectedProductForModal.groupBuy?.enabled && !purchasedItemIds.has(selectedProductForModal.id) && (
                  <View style={styles.groupBuyInfo}>
                    <View style={styles.discountBadgeLarge}>
                      <Text style={styles.discountTextLarge}>
                        Save {selectedProductForModal.groupBuy.discountPercent}%!
                      </Text>
                    </View>
                    
                    <View style={styles.participantsRow}>
                      <Icon name="people" size={20} color={Colors.deepPink} />
                      <Text style={styles.participantsText}>
                        {selectedProductForModal.groupBuy.currentParticipants} / {selectedProductForModal.groupBuy.maxParticipants} joined
                      </Text>
                    </View>

                    <TouchableOpacity 
                      style={styles.joinGroupBuyButton}
                      onPress={() => {
                        setShowProductModal(false);
                        handleJoinGroupBuy(selectedProductForModal);
                      }}
                    >
                      <Icon name="cart" size={20} color={Colors.white} />
                      <Text style={styles.joinButtonTextModal}>Join Group Buy</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Action Buttons */}
                {!purchasedItemIds.has(selectedProductForModal.id) ? (
                  <TouchableOpacity 
                    style={styles.instantPayButton}
                    onPress={() => handleInstantPay(selectedProductForModal)}
                  >
                    <Icon name="card" size={20} color={Colors.white} />
                    <Text style={styles.instantPayButtonText}>Instant Pay ${selectedProductForModal.price}</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.purchasedActions}>
                    <View style={styles.purchasedBadge}>
                      <Icon name="checkmark-circle" size={20} color={Colors.success} />
                      <Text style={styles.purchasedText}>Purchased</Text>
                    </View>
                    <View style={styles.actionRow}>
                      <TouchableOpacity 
                        style={styles.pickupButton}
                        onPress={() => handlePickup(selectedProductForModal)}
                      >
                        <Icon name="location" size={18} color={Colors.white} />
                        <Text style={styles.actionButtonText}>Pick Up</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.withdrawButton}
                        onPress={() => handleWithdraw(selectedProductForModal)}
                      >
                        <Icon name="close-circle" size={18} color={Colors.deepPink} />
                        <Text style={styles.withdrawButtonText}>Withdraw</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <TouchableOpacity 
                  style={styles.contactSellerButton}
                  onPress={() => Alert.alert('Contact', `Message ${selectedProductForModal.seller.username}`)}
                >
                  <Icon name="chatbubble" size={20} color={Colors.deepPink} />
                  <Text style={styles.contactButtonText}>Contact Seller</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Pickup Modal */}
      <Modal
        visible={showPickupModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPickupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pick Up Item</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowPickupModal(false)}
              >
                <Icon name="close" size={24} color={Colors.charcoal} />
              </TouchableOpacity>
            </View>

            {selectedPickupItem && pickupInfoByItemId[selectedPickupItem.id] && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.pickupCard}>
                  <Icon name="location" size={40} color={Colors.deepPink} />
                  <Text style={styles.pickupTitle}>Pickup Location</Text>
                  <Text style={styles.pickupLocation}>{pickupInfoByItemId[selectedPickupItem.id].pickupLocation}</Text>
                  
                  <View style={styles.pickupTimeRow}>
                    <Icon name="time" size={16} color={Colors.lightGray} />
                    <Text style={styles.pickupTime}>{pickupInfoByItemId[selectedPickupItem.id].pickupTime}</Text>
                  </View>
                </View>

                <View style={styles.codeCard}>
                  <Text style={styles.codeLabel}>Your Pickup Code</Text>
                  <Text style={styles.codeValue}>{pickupInfoByItemId[selectedPickupItem.id].pickupCode}</Text>
                  <Text style={styles.codeHint}>Show this code to the seller</Text>
                </View>

                <TouchableOpacity 
                  style={styles.confirmPickupButton}
                  onPress={confirmPickup}
                >
                  <Icon name="checkmark" size={20} color={Colors.white} />
                  <Text style={styles.confirmPickupText}>Confirm Pickup</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Tracking Modal */}
      <Modal
        visible={showTrackingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTrackingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Tracking</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowTrackingModal(false)}
              >
                <Icon name="close" size={24} color={Colors.charcoal} />
              </TouchableOpacity>
            </View>

            {trackingItem && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.trackingItemCard}>
                  <Image source={{ uri: trackingItem.images[0] }} style={styles.trackingImage} />
                  <View style={styles.trackingItemInfo}>
                    <Text style={styles.trackingItemTitle}>{trackingItem.title}</Text>
                    <Text style={styles.trackingItemPrice}>${trackingItem.price}</Text>
                  </View>
                </View>

                <View style={styles.timelineContainer}>
                  <View style={styles.timelineItem}>
                    <View style={[styles.timelineDot, styles.timelineDotCompleted]}>
                      <Icon name="checkmark" size={12} color={Colors.white} />
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>Order Placed</Text>
                      <Text style={styles.timelineTime}>Just now</Text>
                    </View>
                  </View>
                  <View style={styles.timelineLine} />
                  <View style={styles.timelineItem}>
                    <View style={[styles.timelineDot, styles.timelineDotActive]} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>Ready for Pickup</Text>
                      <Text style={styles.timelineTime}>Tomorrow</Text>
                    </View>
                  </View>
                  <View style={styles.timelineLine} />
                  <View style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>Picked Up</Text>
                      <Text style={styles.timelineTime}>Pending</Text>
                    </View>
                  </View>
                </View>

                {pickupInfoByItemId[trackingItem.id] && (
                  <View style={styles.trackingPickupCard}>
                    <Text style={styles.trackingPickupLabel}>Pickup Code</Text>
                    <Text style={styles.trackingPickupCode}>{pickupInfoByItemId[trackingItem.id].pickupCode}</Text>
                    <Text style={styles.trackingPickupLocation}>{pickupInfoByItemId[trackingItem.id].pickupLocation}</Text>
                  </View>
                )}

                <TouchableOpacity 
                  style={styles.withdrawButtonLarge}
                  onPress={() => handleWithdraw(trackingItem)}
                >
                  <Icon name="close-circle" size={20} color={Colors.deepPink} />
                  <Text style={styles.withdrawButtonLargeText}>Cancel Order & Refund</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.blushWhite,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.charcoal,
  },
  scanButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.deepPink,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.deepPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sellButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    marginBottom: Spacing.lg,
  },
  heroBanner: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.deepPink,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.deepPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerLeft: {
    flex: 1,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  liveDot: {
    width: 8,
    height: 8,
    backgroundColor: Colors.white,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  liveText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: Spacing.sm,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countdownText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  joinButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  joinButtonText: {
    color: Colors.deepPink,
    fontSize: 14,
    fontWeight: '600',
  },
  recommendedSection: {
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  seeAllText: {
    color: Colors.deepPink,
    fontSize: 14,
    fontWeight: '600',
  },
  recommendedScroll: {
    paddingLeft: Spacing.lg,
  },
  recommendedCard: {
    width: 200,
    height: 120,
    marginRight: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  recommendedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  recommendedOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  recommendedTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  currentPrice: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  originalPrice: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.deepPink,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    gap: 4,
  },
  discountText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    marginRight: Spacing.sm,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryButtonActive: {
    backgroundColor: Colors.deepPink,
  },
  categoryText: {
    color: Colors.softDark,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  masonryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
  },
  masonryCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
  },
  masonryImageContainer: {
    position: 'relative',
    height: '70%',
  },
  masonryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  groupBuyBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.deepPink,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  groupBuyText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  heartButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  masonryContent: {
    padding: Spacing.md,
  },
  masonryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.charcoal,
    marginBottom: Spacing.sm,
  },
  masonrySeller: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sellerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: Spacing.xs,
  },
  sellerName: {
    flex: 1,
    fontSize: 12,
    color: Colors.softDark,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    color: Colors.softDark,
  },
  masonryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  masonryPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.deepPink,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  locationText: {
    fontSize: 11,
    color: Colors.lightGray,
  },
  // Notification Styles
  notificationsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    pointerEvents: 'box-none',
  },
  notificationToast: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  notificationImage: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  notificationMessage: {
    fontSize: 12,
    color: Colors.softDark,
    marginTop: 2,
  },
  notificationClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.blushWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softPink,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.blushWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: Spacing.lg,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  modalItemTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.charcoal,
    marginBottom: Spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  currentPriceModal: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.deepPink,
  },
  originalPriceModal: {
    fontSize: 18,
    color: Colors.lightGray,
    textDecorationLine: 'line-through',
  },
  groupBuyInfo: {
    backgroundColor: Colors.blushWhite,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  discountBadgeLarge: {
    backgroundColor: Colors.deepPink,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  discountTextLarge: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  participantsText: {
    fontSize: 16,
    color: Colors.charcoal,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.deepPink,
    borderRadius: 4,
  },
  spotsLeftText: {
    fontSize: 14,
    color: Colors.softDark,
    textAlign: 'center',
  },
  errorText: {
    color: Colors.deepPink,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  joinGroupBuyButton: {
    backgroundColor: Colors.deepPink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  joinButtonDisabled: {
    opacity: 0.7,
  },
  joinButtonTextModal: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  termsText: {
    fontSize: 12,
    color: Colors.lightGray,
    textAlign: 'center',
    lineHeight: 18,
  },
  // Product Detail Modal Styles
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.blushWhite,
    borderRadius: BorderRadius.lg,
  },
  sellerAvatarModal: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: Spacing.md,
  },
  sellerNameModal: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingTextModal: {
    fontSize: 14,
    color: Colors.softDark,
  },
  contactSellerButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.deepPink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  contactButtonText: {
    color: Colors.deepPink,
    fontSize: 16,
    fontWeight: '700',
  },

  // Instant Pay & Purchase Actions
  instantPayButton: {
    backgroundColor: Colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  instantPayButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  purchasedActions: {
    marginBottom: Spacing.md,
  },
  purchasedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.lightPink,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  purchasedText: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  pickupButton: {
    flex: 1,
    backgroundColor: Colors.deepPink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  withdrawButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.deepPink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  withdrawButtonText: {
    color: Colors.deepPink,
    fontSize: 16,
    fontWeight: '700',
  },
  withdrawButtonLarge: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.softCoral,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
  },
  withdrawButtonLargeText: {
    color: Colors.softCoral,
    fontSize: 16,
    fontWeight: '700',
  },

  // Pickup Modal Styles
  pickupCard: {
    backgroundColor: Colors.blushWhite,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  pickupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.charcoal,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  pickupLocation: {
    fontSize: 14,
    color: Colors.softDark,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  pickupTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  pickupTime: {
    fontSize: 13,
    color: Colors.lightGray,
  },
  codeCard: {
    backgroundColor: Colors.deepPink,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  codeLabel: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: Spacing.sm,
  },
  codeValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 4,
    marginBottom: Spacing.sm,
  },
  codeHint: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.8,
  },
  confirmPickupButton: {
    backgroundColor: Colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  confirmPickupText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },

  // Tracking Modal Styles
  trackingItemCard: {
    flexDirection: 'row',
    backgroundColor: Colors.blushWhite,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  trackingImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
  },
  trackingItemInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'center',
  },
  trackingItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.charcoal,
    marginBottom: Spacing.xs,
  },
  trackingItemPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.deepPink,
  },
  timelineContainer: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.lightGray,
    marginRight: Spacing.md,
  },
  timelineDotCompleted: {
    backgroundColor: Colors.success,
  },
  timelineDotActive: {
    backgroundColor: Colors.deepPink,
  },
  timelineLine: {
    width: 2,
    height: 30,
    backgroundColor: Colors.lightGray,
    marginLeft: 9,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  timelineTime: {
    fontSize: 12,
    color: Colors.lightGray,
  },
  trackingPickupCard: {
    backgroundColor: Colors.blushWhite,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  trackingPickupLabel: {
    fontSize: 12,
    color: Colors.lightGray,
    marginBottom: Spacing.xs,
  },
  trackingPickupCode: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.deepPink,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  trackingPickupLocation: {
    fontSize: 14,
    color: Colors.softDark,
  },
});

export default MarketplaceScreen;
