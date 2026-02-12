import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme';
import { apiService } from '../services/api';

interface SubmitProductScreenProps {
  navigation: any;
}

const CATEGORIES = [
  'appliances',
  'furniture',
  'electronics',
  'clothing',
  'books',
  'home',
  'sports',
  'accessories',
  'games',
  'toys',
  'other'
];

const CONDITIONS = ['new', 'like-new', 'good', 'fair', 'poor'];

const SubmitProductScreen: React.FC<SubmitProductScreenProps> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [enableGroupBuy, setEnableGroupBuy] = useState(false);
  const [groupBuyMaxParticipants, setGroupBuyMaxParticipants] = useState('5');
  const [groupBuyDiscount, setGroupBuyDiscount] = useState('20');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddImage = () => {
    // In production, this would open camera or image picker
    // For demo, we'll add a placeholder image
    if (images.length < 5) {
      setImages([...images, `https://via.placeholder.com/400x400/FF69B4/FFFFFF?text=Image+${images.length + 1}`]);
    } else {
      Alert.alert('Limit Reached', 'You can only upload up to 5 images');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!title.trim()) return 'Title is required';
    if (!description.trim()) return 'Description is required';
    if (!price.trim()) return 'Price is required';
    if (!category) return 'Category is required';
    if (!condition) return 'Condition is required';
    if (!location.trim()) return 'Location is required';
    if (images.length === 0) return 'At least one image is required';
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Missing Information', error);
      return;
    }

    setIsSubmitting(true);

    try {
      const itemData = {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        category: category.toLowerCase(),
        condition,
        images,
        location: {
          type: 'Point',
          coordinates: [-122.6765, 45.5231], // Default coordinates for demo
          address: location.trim(),
        },
        seller: {
          userId: 'demo-user-id',
          username: 'Demo User',
          avatar: 'https://via.placeholder.com/100',
          rating: 5.0,
          location: location.trim(),
        },
        groupBuy: enableGroupBuy ? {
          enabled: true,
          maxParticipants: parseInt(groupBuyMaxParticipants) || 5,
          currentParticipants: 0,
          discountPercent: parseInt(groupBuyDiscount) || 20,
          endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          participants: [],
        } : { enabled: false },
        sustainability: {
          co2SavedKg: 0,
          wasteDivertedKg: 0,
          localProduction: true,
        },
      };

      const result = await apiService.createItem(itemData);

      if (result.success) {
        Alert.alert(
          'Success!',
          'Your item has been listed successfully.',
          [
            { 
              text: 'View Item', 
              onPress: () => navigation.navigate('Home', { refresh: true }) 
            },
            { 
              text: 'List Another', 
              onPress: () => resetForm() 
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to list item');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setCategory('');
    setCondition('');
    setLocation('');
    setImages([]);
    setEnableGroupBuy(false);
    setGroupBuyMaxParticipants('5');
    setGroupBuyDiscount('20');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.charcoal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>List Your Item</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos ({images.length}/5)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.uploadedImage} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close" size={24} color={Colors.white} />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
                <Ionicons name="camera" size={24} color={Colors.deepPink} />
                <Text style={styles.addImageText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="What are you selling?"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your item (condition, features, etc.)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.characterCount}>{description.length}/500</Text>
          </View>
        </View>

        {/* Category & Condition */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category & Condition</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category *</Text>
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <Text style={category ? styles.dropdownText : styles.dropdownPlaceholder}>
                {category || 'Select category'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={Colors.deepPink} />
            </TouchableOpacity>
            
            {showCategoryDropdown && (
              <View style={styles.dropdownMenu}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setCategory(cat);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Condition *</Text>
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => setShowConditionDropdown(!showConditionDropdown)}
            >
              <Text style={condition ? styles.dropdownText : styles.dropdownPlaceholder}>
                {condition || 'Select condition'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={Colors.deepPink} />
            </TouchableOpacity>
            
            {showConditionDropdown && (
              <View style={styles.dropdownMenu}>
                {CONDITIONS.map((cond) => (
                  <TouchableOpacity
                    key={cond}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setCondition(cond);
                      setShowConditionDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>
                      {cond.charAt(0).toUpperCase() + cond.slice(1).replace('-', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Pricing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          
          <View style={styles.priceRow}>
            <View style={[styles.inputContainer, styles.priceInput]}>
              <Text style={styles.label}>Price *</Text>
              <View style={styles.priceInputContainer}>
                <Ionicons name="cash" size={20} color={Colors.deepPink} />
                <TextInput
                  style={styles.priceTextInput}
                  placeholder="0.00"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={[styles.inputContainer, styles.priceInput]}>
              <Text style={styles.label}>Original Price</Text>
              <View style={styles.priceInputContainer}>
                <Ionicons name="cash" size={20} color={Colors.lightGray} />
                <TextInput
                  style={styles.priceTextInput}
                  placeholder="0.00"
                  value={originalPrice}
                  onChangeText={setOriginalPrice}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pickup Location *</Text>
            <View style={styles.locationInputContainer}>
              <Ionicons name="location" size={20} color={Colors.deepPink} />
              <TextInput
                style={styles.locationInput}
                placeholder="Enter your address or city"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>
        </View>

        {/* Group Buy Section */}
        <View style={styles.section}>
          <View style={styles.groupBuyHeader}>
            <View style={styles.groupBuyTitleRow}>
              <Ionicons name="people" size={20} color={Colors.deepPink} />
              <Text style={styles.sectionTitle}>Enable Group Buy</Text>
            </View>
            <Switch
              value={enableGroupBuy}
              onValueChange={setEnableGroupBuy}
              trackColor={{ false: Colors.lightGray, true: Colors.softPink }}
              thumbColor={enableGroupBuy ? Colors.deepPink : Colors.white}
            />
          </View>
          
          {enableGroupBuy && (
            <View style={styles.groupBuyOptions}>
              <Text style={styles.groupBuyDescription}>
                Allow multiple buyers to join and get a discount when the group fills up!
              </Text>
              
              <View style={styles.priceRow}>
                <View style={[styles.inputContainer, styles.priceInput]}>
                  <Text style={styles.label}>Max Participants</Text>
                  <TextInput
                    style={styles.input}
                    value={groupBuyMaxParticipants}
                    onChangeText={setGroupBuyMaxParticipants}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={[styles.inputContainer, styles.priceInput]}>
                  <Text style={styles.label}>Discount %</Text>
                  <View style={styles.discountInputContainer}>
                    <TextInput
                      style={styles.discountInput}
                      value={groupBuyDiscount}
                      onChangeText={setGroupBuyDiscount}
                      keyboardType="number-pad"
                    />
                    <Text style={styles.percentSign}>%</Text>
                  </View>
                </View>
              </View>

              <View style={styles.previewContainer}>
                <Ionicons name="information-circle" size={16} color={Colors.softDark} />
                <Text style={styles.previewText}>
                  Group buy price: ${(parseFloat(price || '0') * (1 - parseInt(groupBuyDiscount) / 100)).toFixed(2)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Ionicons name="cloud-upload" size={24} color={Colors.white} />
              <Text style={styles.submitButtonText}>List Item</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softPink,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.blushWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.charcoal,
    marginBottom: Spacing.md,
  },
  imageScroll: {
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  imageContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.deepPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.deepPink,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.blushWhite,
  },
  addImageText: {
    marginTop: Spacing.xs,
    fontSize: 12,
    color: Colors.deepPink,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.charcoal,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.blushWhite,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: Colors.charcoal,
    borderWidth: 1,
    borderColor: Colors.softPink,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
  },
  characterCount: {
    fontSize: 12,
    color: Colors.lightGray,
    textAlign: 'right',
    marginTop: 4,
  },
  dropdown: {
    backgroundColor: Colors.blushWhite,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.softPink,
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.charcoal,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: Colors.lightGray,
  },
  dropdownMenu: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.softPink,
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softPink,
  },
  dropdownItemText: {
    fontSize: 16,
    color: Colors.charcoal,
  },
  priceRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  priceInput: {
    flex: 1,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blushWhite,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.softPink,
  },
  priceTextInput: {
    flex: 1,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: Colors.charcoal,
    marginLeft: Spacing.xs,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blushWhite,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.softPink,
  },
  locationInput: {
    flex: 1,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: Colors.charcoal,
    marginLeft: Spacing.xs,
  },
  groupBuyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  groupBuyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  groupBuyOptions: {
    marginTop: Spacing.sm,
  },
  groupBuyDescription: {
    fontSize: 14,
    color: Colors.softDark,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  discountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blushWhite,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.softPink,
  },
  discountInput: {
    flex: 1,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: Colors.charcoal,
  },
  percentSign: {
    fontSize: 16,
    color: Colors.charcoal,
    fontWeight: '600',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.paleRose,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  previewText: {
    fontSize: 14,
    color: Colors.deepPink,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: Colors.deepPink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.deepPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  bottomPadding: {
    height: 100,
  },
});

export default SubmitProductScreen;
