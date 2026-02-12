# Bloom - Community-Powered Resale & Savings App

A modern, sleek React Native app that helps users turn their existing clutter and community into a growing financial ecosystem.

## The Bloom Brand

- **Name**: Bloom - Short, sophisticated, bridging the gap between fintech and lifestyle
- **Vibe**: Growth, energy, and clarity
- **Palette**: Power Pink (#FF2D55) paired with Deep Slate (#1A1A1B)
- **Icon**: A minimalist, geometric flower that looks like a growing sprout

## Features

### 1. The Greenhouse (Home Dashboard)
- Pulsing pink ring showing total earnings/savings
- Dynamic header that shrinks on scroll
- Quick "Scan & Grow" floating action button with haptic feedback
- Recent activity feed and savings statistics

### 2. The Marketplace (Community Resell)
- Clean two-column grid of items
- Power Pink price tags
- Category filtering
- Heart/favorite functionality
- "List Item" button for AI scanner integration

### 3. The Hive (Group-Buy & Community)
- Live feed of neighbor activities
- Map view with pink activity pulses
- Join group buys (Costco runs, bulk splits, shared deliveries)
- Activity cards showing savings potential

### 4. Bloom-Pro Paywall (RevenueCat Integration)
- "Ready for Full Bloom?" messaging
- Feature list with checkmarks
- Monthly and yearly plan selection
- Vibrating CTA button for attention
- 7-day free trial messaging

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Bottom Tabs + Native Stack)
- **Icons**: Lucide React Native
- **Haptics**: Expo Haptics
- **Animations**: React Native Animated API
- **RevenueCat**: Ready for integration

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd bloom

# Install dependencies
npm install

# Start the development server
npx expo start
```

## Running the App

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web
npm run web
```

## Project Structure

```
bloom/
├── App.js                 # Main entry with navigation
├── app.json              # Expo configuration
├── babel.config.js       # Babel configuration
├── package.json          # Dependencies
├── assets/              # Images, icons, splash screen
└── src/
    ├── theme/
    │   └── index.js      # Colors, fonts, spacing, global styles
    ├── components/
    │   └── BloomLogo.js  # Logo and RingProgress components
    └── screens/
        ├── SplashScreen.js      # Pulsing logo loading screen
        ├── GreenhouseScreen.js  # Home dashboard
        ├── MarketplaceScreen.js # Community marketplace
        ├── HiveScreen.js        # Group-buy community
        └── PaywallScreen.js     # Pro subscription
```

## Key Implementation Details

### Haptic Feedback
The AI scanner provides haptic feedback on completion using `expo-haptics`:
```javascript
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```

### Dynamic Headers
Headers shrink as users scroll using React Native's Animated API with scroll event interpolation.

### Vibrating CTA
The "Start Free Trial" button pulses continuously to draw attention, implemented with an Animated loop.

### Activity Pulse Map
The Hive screen features animated pink dots representing active community members.

## RevenueCat Integration

The app is structured for easy RevenueCat integration:
1. The Paywall screen accepts `onSubscribe` and `onClose` callbacks
2. Monthly/Yearly plans are pre-configured
3. Product IDs can be added to fetch offerings from RevenueCat

## Azure Integration

The app structure supports Azure Functions for:
- AI image scanning for resale items
- User authentication
- Marketplace listings API
- Community activity feed

## Customization

### Colors
All colors are defined in `src/theme/index.js`:
- `powerPink`: #FF2D55
- `deepSlate`: #1A1A1B
- `darkCharcoal`: #2C2C2E
- `lightGray`: #8E8E93

### Typography
Font sizes and weights are consistent across the app, optimized for readability on mobile devices.

## Demo Script

When presenting Bloom:
> "I built **Bloom** to help mums turn their existing clutter and community into a growing financial ecosystem. The app combines AI-powered resale scanning, a local marketplace, and group-buying features to maximize household savings."

## Next Steps for Production

1. Integrate RevenueCat SDK for in-app purchases
2. Connect Azure Functions for AI scanning
3. Add real-time chat for Hive activities
4. Implement push notifications
5. Add user authentication
6. Create onboarding flow
7. Add analytics (Firebase/Amplitude)

## License

MIT

## Pitch for Hackathon Judges

**Bloom** transforms the way families approach household savings by combining:
- **Resale Intelligence**: AI scanning to instantly price items
- **Community Commerce**: Local marketplace with zero fees for Pro users
- **Collective Buying**: Group purchasing power for bulk savings

Built in 24 hours with React Native, Expo, and a focus on premium UX with haptic feedback and dynamic animations.
