import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme';

const { width, height } = Dimensions.get('window');

type ScanStep = 'camera' | 'analyzing' | 'preview' | 'pricing' | 'success';

interface AIAnalysis {
  itemName: string;
  category: string;
  condition: string;
  estimatedValue: number;
  marketPrice: number;
  confidence: number;
  suggestedPrice: number;
  description: string;
  keyFeatures: string[];
}

const ScanSellScreen: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanStep, setScanStep] = useState<ScanStep>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [customPrice, setCustomPrice] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    if (scanStep === 'analyzing') {
      // Scan line animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Simulate AI analysis
      setTimeout(() => {
        const mockAnalysis: AIAnalysis = {
          itemName: 'KitchenAid Stand Mixer',
          category: 'Appliances',
          condition: 'Like New',
          estimatedValue: 280,
          marketPrice: 450,
          confidence: 92,
          suggestedPrice: 299,
          description: 'Professional 5-quart stand mixer in excellent condition. Includes paddle, whisk, and dough hook attachments.',
          keyFeatures: ['5 Quart Bowl', '10 Speed Settings', 'Tilt-Head Design', '325 Watt Motor'],
        };
        setAnalysis(mockAnalysis);
        setTitle(mockAnalysis.itemName);
        setDescription(mockAnalysis.description);
        setCustomPrice(mockAnalysis.suggestedPrice.toString());
        setScanStep('preview');
      }, 3000);
    }
  }, [scanStep]);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync();
      setCapturedImage(photo.uri);
      setScanStep('analyzing');
    } catch (error) {
      console.error('Failed to capture photo:', error);
    }
  };

  const handlePost = () => {
    setScanStep('success');
    setTimeout(() => {
      onClose?.();
    }, 2000);
  };

  const handleSaveDraft = () => {
    // Save to drafts
    onClose?.();
  };

  const renderCameraView = () => (
    <View style={styles.cameraContainer}>
      <CameraView style={styles.cameraPreview} ref={cameraRef}>
        <View style={styles.cameraOverlay}>
          {/* Corner brackets */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          
          {/* Center reticle */}
          <View style={styles.reticle}>
            <View style={styles.reticleCrossH} />
            <View style={styles.reticleCrossV} />
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>
              Center item in frame
            </Text>
            <Text style={styles.subInstructionsText}>
              AI will auto-detect and price your item
            </Text>
          </View>
        </View>
      </CameraView>

      {/* Bottom Controls - Thumb Zone */}
      <View style={styles.cameraControls}>
        <TouchableOpacity style={styles.galleryButton}>
          <View style={styles.galleryThumbnail} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
          <View style={styles.captureInner} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAnalyzingView = () => (
    <View style={styles.analyzingContainer}>
      {capturedImage && (
        <Image source={{ uri: capturedImage }} style={styles.analyzingImage} />
      )}
      
      {/* Scan Line */}
      <Animated.View
        style={[
          styles.scanLine,
          {
            transform: [{
              translateY: scanLineAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, height * 0.5],
              }),
            }],
          },
        ]}
      />

      {/* AI Processing Overlay */}
      <View style={styles.analyzingOverlay}>
        <Animated.View
          style={[
            styles.aiPulse,
            {
              transform: [{
                scale: pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.5],
                }),
              }],
              opacity: pulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.6, 0],
              }),
            },
          ]}
        />
        <View style={styles.aiIconContainer}>
          <Ionicons name="sparkles" size={32} color={Colors.white} />
        </View>
        <Text style={styles.analyzingTitle}>AI Analyzing...</Text>
        <Text style={styles.analyzingSubtitle}>
          DeepSeek R1 is identifying your item and checking market prices
        </Text>

        {/* Progress indicators */}
        <View style={styles.progressContainer}>
          <View style={styles.progressItem}>
            <Ionicons name="checkmark" size={16} color={Colors.sageGreen} />
            <Text style={styles.progressText}>Image captured</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressItem}>
            <Ionicons name="checkmark" size={16} color={Colors.sageGreen} />
            <Text style={styles.progressText}>Object detected</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressItem}>
            <View style={styles.loadingDot} />
            <Text style={styles.progressTextActive}>Market analysis</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderPreviewView = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.previewContainer}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.previewHeader}>
          <TouchableOpacity onPress={() => setScanStep('camera')}>
            <Ionicons name="close" size={24} color={Colors.charcoal} />
          </TouchableOpacity>
          <Text style={styles.previewTitle}>Review Listing</Text>
          <TouchableOpacity onPress={handlePost}>
            <Text style={styles.postText}>Post</Text>
          </TouchableOpacity>
        </View>

        {/* Image Preview */}
        {capturedImage && (
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
        )}

        {/* AI Analysis Card */}
        {analysis && (
          <View style={styles.analysisCard}>
            <View style={styles.analysisHeader}>
              <Ionicons name="sparkles" size={20} color={Colors.deepPink} />
              <Text style={styles.analysisTitle}>AI Analysis</Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>{analysis.confidence}% match</Text>
              </View>
            </View>

            <View style={styles.analysisDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="pricetag" size={16} color={Colors.softDark} />
                <Text style={styles.detailLabel}>Category:</Text>
                <Text style={styles.detailValue}>{analysis.category}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="cube" size={16} color={Colors.softDark} />
                <Text style={styles.detailLabel}>Condition:</Text>
                <Text style={styles.detailValue}>{analysis.condition}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="cash" size={16} color={Colors.softDark} />
                <Text style={styles.detailLabel}>Market Price:</Text>
                <Text style={styles.detailValue}>${analysis.marketPrice}</Text>
              </View>
            </View>

            {/* Key Features */}
            <View style={styles.featuresContainer}>
              {analysis.keyFeatures.map((feature, index) => (
                <View key={index} style={styles.featureTag}>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Pricing Section */}
        <View style={styles.pricingCard}>
          <Text style={styles.pricingTitle}>Set Your Price</Text>
          <View style={styles.priceComparison}>
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>AI Suggested</Text>
              <Text style={styles.suggestedPrice}>${analysis?.suggestedPrice}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.lightGray} />
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>Your Price</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.priceInput}
                  value={customPrice}
                  onChangeText={setCustomPrice}
                  keyboardType="decimal-pad"
                  placeholder={analysis?.suggestedPrice.toString()}
                />
              </View>
            </View>
          </View>
          
          {/* Price recommendation */}
          <View style={styles.priceTip}>
            <Text style={styles.priceTipText}>
              💡 At ${customPrice || analysis?.suggestedPrice}, you'll sell 3x faster than market average
            </Text>
          </View>
        </View>

        {/* Title & Description */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Title</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Item title"
          />

          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your item..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Bottom Actions - Thumb Zone */}
        <View style={styles.previewActions}>
          <TouchableOpacity style={styles.saveDraftButton} onPress={handleSaveDraft}>
            <Ionicons name="bookmark" size={20} color={Colors.deepPink} />
            <Text style={styles.saveDraftText}>Save Draft</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.postNowButton} onPress={handlePost}>
            <Ionicons name="cloud-upload" size={20} color={Colors.white} />
            <Text style={styles.postNowText}>Post Now</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderSuccessView = () => (
    <View style={styles.successContainer}>
      <View style={styles.successCircle}>
        <Ionicons name="checkmark" size={48} color={Colors.white} />
      </View>
      <Text style={styles.successTitle}>Posted!</Text>
      <Text style={styles.successSubtitle}>
        Your item is now live in the marketplace
      </Text>
      <View style={styles.successStats}>
        <View style={styles.statItem}>
          <Ionicons name="time" size={20} color={Colors.deepPink} />
          <Text style={styles.statText}>Avg. sell time: 2.3 days</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={scanStep === 'camera' || scanStep === 'analyzing' ? 'light' : 'dark'} />
      
      {scanStep === 'camera' && renderCameraView()}
      {scanStep === 'analyzing' && renderAnalyzingView()}
      {scanStep === 'preview' && renderPreviewView()}
      {scanStep === 'success' && renderSuccessView()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.charcoal,
  },
  cameraContainer: {
    flex: 1,
  },
  cameraPreview: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.deepPink,
    borderWidth: 3,
  },
  cornerTL: {
    top: 80,
    left: 40,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTR: {
    top: 80,
    right: 40,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBL: {
    bottom: 200,
    left: 40,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBR: {
    bottom: 200,
    right: 40,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  reticle: {
    width: 60,
    height: 60,
    position: 'relative',
  },
  reticleCrossH: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginTop: -1,
  },
  reticleCrossV: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginLeft: -1,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 240,
    alignItems: 'center',
  },
  instructionsText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  subInstructionsText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 8,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  galleryThumbnail: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.white,
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.deepPink,
  },
  closeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzingContainer: {
    flex: 1,
    position: 'relative',
  },
  analyzingImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.5,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.deepPink,
    shadowColor: Colors.deepPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
    top: '25%',
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  aiPulse: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.deepPink,
  },
  aiIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.deepPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.deepPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  analyzingTitle: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  analyzingSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressLine: {
    width: 20,
    height: 2,
    backgroundColor: Colors.sageGreen,
    marginHorizontal: 8,
  },
  progressText: {
    color: Colors.sageGreen,
    fontSize: 12,
    fontWeight: '500',
  },
  progressTextActive: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.deepPink,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: Colors.blushWhite,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.softPink,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  postText: {
    color: Colors.deepPink,
    fontSize: 16,
    fontWeight: '700',
  },
  previewImage: {
    width: width - Spacing.lg * 2,
    height: 250,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    resizeMode: 'cover',
  },
  analysisCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  analysisTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  confidenceBadge: {
    backgroundColor: Colors.softPink,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  confidenceText: {
    color: Colors.deepPink,
    fontSize: 12,
    fontWeight: '600',
  },
  analysisDetails: {
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailLabel: {
    color: Colors.softDark,
    fontSize: 14,
    width: 100,
  },
  detailValue: {
    color: Colors.charcoal,
    fontSize: 14,
    fontWeight: '600',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  featureTag: {
    backgroundColor: Colors.softPink,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  featureText: {
    color: Colors.deepPink,
    fontSize: 12,
    fontWeight: '500',
  },
  pricingCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  pricingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.charcoal,
    marginBottom: Spacing.md,
  },
  priceComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceBox: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.softDark,
    marginBottom: Spacing.xs,
  },
  suggestedPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.sageGreen,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.deepPink,
  },
  dollarSign: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.deepPink,
  },
  priceInput: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.deepPink,
    minWidth: 80,
    padding: 0,
  },
  priceTip: {
    marginTop: Spacing.md,
    backgroundColor: Colors.softPink,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  priceTipText: {
    color: Colors.deepPink,
    fontSize: 13,
    fontWeight: '500',
  },
  inputCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.charcoal,
    marginBottom: Spacing.sm,
  },
  titleInput: {
    fontSize: 16,
    color: Colors.charcoal,
    borderWidth: 1,
    borderColor: Colors.softPink,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  descriptionInput: {
    fontSize: 14,
    color: Colors.charcoal,
    borderWidth: 1,
    borderColor: Colors.softPink,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 100,
  },
  previewActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  saveDraftButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 16,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.deepPink,
  },
  saveDraftText: {
    color: Colors.deepPink,
    fontSize: 16,
    fontWeight: '700',
  },
  postNowButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 16,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.deepPink,
    shadowColor: Colors.deepPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  postNowText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  successContainer: {
    flex: 1,
    backgroundColor: Colors.blushWhite,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.sageGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.sageGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.charcoal,
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    fontSize: 16,
    color: Colors.softDark,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  successStats: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statText: {
    fontSize: 14,
    color: Colors.softDark,
  },
});

export default ScanSellScreen;
