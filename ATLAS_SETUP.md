# Bloom MongoDB Atlas Setup Guide

Complete backend architecture for Bloom sustainable marketplace using MongoDB Atlas instead of Azure.

## 🏗️ Architecture Overview

```
React Native App
       │
       ├─► MongoDB Atlas Realm SDK (Real-time sync)
       │
       ├─► Atlas Data API (Simple HTTP requests)
       │
       └─► Atlas Functions (Serverless backend)
               │
               ├─► Google Vision AI (Image scanning)
               ├─► RevenueCat Webhook (Subscriptions)
               └─► FCM Notifications (Push notifications)
```

## 📁 Project Structure

```
atlas-backend/
├── functions/
│   ├── processImageScan.js      # AI image scanning
│   └── revenueCatWebhook.js     # Subscription handling
├── triggers/
│   └── onNewMessage.js          # FCM notifications
├── schemas.ts                    # MongoDB schemas
└── seed/
    └── seedData.js               # Sample data

Frontend/src/services/
├── realm.ts                      # Realm SDK integration
└── dataApi.ts                    # Data API integration
```

## 🚀 Quick Setup (24-Hour Sprint)

### Step 1: Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create new project "bloom"
3. Build new cluster (M0 free tier works for demo)
4. Add your IP to allowlist
5. Create database user

### Step 2: Set Up Atlas App Services

1. In Atlas, go to "App Services" tab
2. Create new App
3. Link to your cluster
4. Enable "Data Access" rules

### Step 3: Configure Environment Variables

Create `.env` in Frontend:
```env
# MongoDB Atlas
ATLAS_APP_ID=your-app-id
ATLAS_API_KEY=your-api-key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bloom

# External APIs
GOOGLE_VISION_API_KEY=your-vision-api-key
FCM_SERVER_KEY=your-fcm-key
REVENUECAT_WEBHOOK_SECRET=your-webhook-secret
```

### Step 4: Create Atlas Functions

1. Go to App Services → Functions
2. Create `processImageScan` function (paste from `functions/processImageScan.js`)
3. Create `revenueCatWebhook` function (paste from `functions/revenueCatWebhook.js`)
4. Set up Values (secrets):
   - `GOOGLE_VISION_API_KEY`
   - `FCM_SERVER_KEY`

### Step 5: Create Atlas Trigger

1. Go to App Services → Triggers
2. Create new Database Trigger
3. Name: `onNewMessage`
4. Collection: `bloom.conversations`
5. Event: `Insert` and `Update`
6. Function: `onNewMessage` (paste from `triggers/onNewMessage.js`)

### Step 6: Seed Database

```bash
cd atlas-backend/seed
npm install mongodb bcryptjs
node seedData.js
```

### Step 7: Install Frontend Dependencies

```bash
cd Frontend
npm install realm
npm install @realm/react
npm install bson
```

## 📊 Data Model

### Collections

| Collection | Purpose | Key Features |
|------------|---------|--------------|
| `users` | User profiles & preferences | Geospatial index on location |
| `conversations` | Real-time chat | Embedded messages array |
| `marketplaceitems` | Buy/sell listings | Group buy support, 2dsphere index |
| `scans` | AI scan history | Draft → Listed workflow |
| `grids` | Neighborhood groups | Geofenced communities |
| `hiveactivities` | Events & meetups | Real-time participation |

### Geospatial Queries

All location-based collections have `2dsphere` indexes:
```javascript
// Find items near user
db.marketplaceitems.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [lng, lat] },
      $maxDistance: 10000 // 10km
    }
  }
})
```

## 🔧 Atlas Functions Explained

### 1. processImageScan

Handles AI image scanning from React Native:

```javascript
// Called from React Native
const result = await user.functions.processImageScan({
  imageBase64: base64Image,
  userId: currentUser.id,
  location: { longitude, latitude, address }
});

// Returns:
{
  success: true,
  detectedItem: {
    name: "KitchenAid Mixer",
    category: "appliances",
    condition: "like-new",
    confidence: 0.95
  },
  estimatedValue: {
    originalPrice: 299,
    resaleValue: 120
  },
  sustainability: {
    co2SavedKg: 12.5,
    wasteDivertedKg: 8.2
  }
}
```

### 2. revenueCatWebhook

Automatically syncs subscriptions:

```javascript
// RevenueCat sends webhook to Atlas
// Atlas updates user.subscription.isMamaPro
// No backend code needed!
```

## 📱 Frontend Integration

### Option 1: Realm SDK (Recommended)

Real-time sync with offline support:

```typescript
import { app, realmAuth, chatService } from './services/realm';

// Login
await realmAuth.loginEmailPassword(email, password);

// Send message (syncs automatically)
await chatService.sendMessage(conversationId, "Hello!", "text");

// Real-time updates
const realm = await openRealm();
const conversations = realm.objects('Conversation');
conversations.addEventListener(() => {
  // UI updates automatically!
});
```

### Option 2: Data API (Simpler)

HTTP-based CRUD operations:

```typescript
import { dataApiItems, dataApiConversations } from './services/dataApi';

// Fetch nearby items
const items = await dataApiItems.findNearbyItems(
  -122.4194, // longitude
  37.7749,   // latitude
  10000      // radius in meters
);

// Send message
await dataApiConversations.addMessage(conversationId, {
  _id: new ObjectId(),
  senderId: userId,
  text: "Is this still available?",
  createdAt: new Date()
});
```

## 🎯 24-Hour Sprint Checklist

### Hour 1-2: Atlas Setup
- [ ] Create MongoDB Atlas cluster
- [ ] Set up App Services
- [ ] Configure environment variables
- [ ] Run seed data script

### Hour 3-4: Functions & Triggers
- [ ] Deploy `processImageScan` function
- [ ] Deploy `revenueCatWebhook` function
- [ ] Set up `onNewMessage` trigger
- [ ] Test FCM notifications

### Hour 5-8: Frontend Integration
- [ ] Install Realm SDK
- [ ] Configure Realm app
- [ ] Connect authentication
- [ ] Test real-time chat

### Hour 9-12: Mall Demo Prep
- [ ] Test AI scanning on real items
- [ ] Verify location-based queries
- [ ] Check offline functionality
- [ ] Prepare demo script

## 🎨 Power Pink Theme Integration

The MongoDB setup is designed to work with your pink floral theme:

```typescript
// Scan result UI colors
const sustainabilityColors = {
  co2Saved: Colors.sageGreen,      // Soft green
  wasteSaved: Colors.rosePink,     // Pink accent
  moneySaved: Colors.deepPink      // Power pink
};

// Group buy progress
const groupBuyGradient = [
  Colors.softPink,
  Colors.blushPink,
  Colors.rosePink
];
```

## 🔐 Security Rules

Atlas Data Access Rules (read/write permissions):

```javascript
// Users can only read/write their own data
{
  "roles": [{
    "name": "user",
    "apply_when": { "%%user.id": { "$exists": true } },
    "document_filters": {
      "read": { "userId": "%%user.id" },
      "write": { "userId": "%%user.id" }
    }
  }]
}
```

## 📈 Scaling Path

Current (M0 Free):
- 512MB storage
- Shared RAM
- Perfect for demo/testing

Growth (M10+):
- Dedicated RAM
- Auto-scaling
- Backups
- Monitoring

## 🆘 Troubleshooting

### Issue: Realm sync not working
**Fix**: Check network, verify App ID, enable "Development Mode" in Atlas

### Issue: Geospatial queries slow
**Fix**: Ensure `2dsphere` index created on location field

### Issue: FCM notifications not sending
**Fix**: Verify FCM_SERVER_KEY in Atlas Values, check device token registration

### Issue: Image scan timeout
**Fix**: Use smaller image sizes (<1MB), implement client-side compression

## 📚 Resources

- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Realm React Native SDK](https://www.mongodb.com/docs/realm/sdk/react-native/)
- [Atlas Triggers Guide](https://www.mongodb.com/docs/atlas/triggers/)
- [Atlas Functions](https://www.mongodb.com/docs/atlas/functions/)

## ✅ Success Metrics

After setup, you should have:

- ✅ Real-time chat with offline support
- ✅ AI image scanning (Google Vision)
- ✅ Push notifications (FCM)
- ✅ Geolocation-based marketplace
- ✅ Group buy functionality
- ✅ Subscription sync (RevenueCat)
- ✅ Offline-first architecture

---

**Ready for your mall demo!** 🛍️🌸
