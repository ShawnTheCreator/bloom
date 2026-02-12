import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Heart, MapPin } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius } from '../theme';
import { apiService } from '../services/api';

interface MarketplaceItem {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  sellerName: string;
  sellerDistance: string;
  category: string;
}

const MarketplaceScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All', 'Furniture', 'Decor', 'Kitchen', 'Electronics']);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [selectedCategory]);

  const fetchItems = async () => {
    try {
      const data = await apiService.getMarketplaceItems(selectedCategory);
      setItems(data.map((item: any) => ({
        id: item.id.toString(),
        title: item.title,
        price: item.price,
        imageUrl: item.imageUrl,
        sellerName: item.sellerName,
        sellerDistance: item.sellerDistance,
        category: item.category
      })));
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const toggleLike = (id: string) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const renderItem = ({ item }: { item: MarketplaceItem }) => (
    <TouchableOpacity style={styles.itemCard} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        <TouchableOpacity 
          style={styles.likeButton} 
          onPress={() => toggleLike(item.id)}
        >
          <Heart 
            size={18} 
            color={likedItems.has(item.id) ? Colors.powerPink : Colors.white} 
            fill={likedItems.has(item.id) ? Colors.powerPink : 'transparent'}
          />
        </TouchableOpacity>
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>${item.price}</Text>
        </View>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <View style={styles.sellerRow}>
          <Text style={styles.sellerText}>{item.sellerName}</Text>
          <View style={styles.distanceBadge}>
            <MapPin size={12} color={Colors.lightGray} />
            <Text style={styles.distanceText}>{item.sellerDistance}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marketplace</Text>
        <TouchableOpacity style={styles.listButton}>
          <Plus size={20} color={Colors.white} />
          <Text style={styles.listButtonText}>List Item</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
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

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  listButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.deepPink,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
  },
  listButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: Spacing.xs,
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
  listContent: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  itemCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 140,
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  likeButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceTag: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.deepPink,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.sm,
  },
  priceText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  itemInfo: {
    padding: Spacing.md,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.charcoal,
    marginBottom: Spacing.xs,
  },
  sellerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sellerText: {
    fontSize: 13,
    color: Colors.softDark,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    color: Colors.softDark,
  },
});

export default MarketplaceScreen;
