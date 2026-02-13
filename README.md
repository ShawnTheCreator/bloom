# Bloom - Social Commerce Mobile App

A modern social commerce platform built with React Native and Expo, featuring AI-powered product scanning, group buying, and community-driven marketplace functionality.

![Expo SDK 51](https://img.shields.io/badge/Expo%20SDK-51.0.28-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.74.5-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Environment Variables](#environment-variables)
- [API Integration](#api-integration)
- [Contributing](#contributing)

## Overview

Bloom is a mobile-first social commerce application that connects buyers and sellers in a community-driven marketplace. The app features AI-powered product recognition, group buying capabilities, and a seamless mobile experience.

### Key Highlights

- **AI Product Scanning**: Upload product images for automatic recognition and listing
- **Group Buying**: Collaborate with others for bulk purchase discounts
- **Social Commerce**: Connect with sellers and buyers in your community
- **Admin Dashboard**: Powerful tools for creators and administrators
- **Subscription Model**: Premium features with RevenueCat integration

## Features

### Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Authentication** | Secure login/signup with role-based access | ✅ Active |
| **Marketplace** | Browse and search products with filters | ✅ Active |
| **AI Scanning** | Camera-based product recognition | ✅ Active |
| **Group Buying** | Create and join bulk purchase groups | ✅ Active |
| **Wallet** | In-app payment and transaction history | ✅ Active |
| **Messaging** | Real-time chat between buyers and sellers | ✅ Active |
| **Notifications** | Push notifications for orders and messages | ✅ Active |
| **Admin Panel** | Dashboard for admins, creators, and developers | ✅ Active |

### User Roles

- **User**: Standard buyer/seller access
- **Creator**: Enhanced selling capabilities
- **Developer**: Technical management access
- **Admin**: Full system administration

## Tech Stack

### Frontend (Mobile App)

| Technology | Version | Purpose |
|------------|---------|---------|
| [Expo SDK](https://expo.dev) | 51.0.28 | Development framework |
| [React Native](https://reactnative.dev) | 0.74.5 | Mobile UI framework |
| [React](https://react.dev) | 18.2.0 | UI library |
| [TypeScript](https://typescriptlang.org) | 5.3.3 | Type safety |
| [React Navigation](https://reactnavigation.org) | v6 | Navigation system |
| [Reanimated](https://docs.swmansion.com/react-native-reanimated/) | 3.10.1 | Animations |

### Backend

| Technology | Purpose |
|------------|---------|
| ASP.NET Core | API framework |
| MongoDB | Database |
| Docker | Containerization |
| RevenueCat | Subscription management |
| Cloudinary | Image storage |

### Cloud Services

- **EAS (Expo Application Services)**: Build and deployment
- **Google Cloud Vision**: AI image recognition
- **Firebase Cloud Messaging**: Push notifications
- **AWS S3**: File storage

## Project Structure

```
bloom/
├── Frontend/                    # React Native mobile app
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── contexts/           # React context providers
│   │   ├── screens/            # App screens
│   │   ├── services/           # API services
│   │   ├── theme/              # Colors, spacing, styles
│   │   └── types/              # TypeScript definitions
│   ├── assets/                 # Images, fonts, icons
│   ├── App.tsx                 # Main app entry
│   ├── index.js                # Bundle entry point
│   ├── app.json                # Expo configuration
│   ├── eas.json                # EAS build configuration
│   └── package.json            # Dependencies
│
├── bloombackend/               # ASP.NET Core API
│   ├── Controllers/            # API controllers
│   ├── Data/                   # Database context
│   ├── Models/                 # Data models
│   ├── Services/               # Business logic
│   └── Dockerfile              # Container config
│
├── backend/                    # Additional backend services
└── .gitignore                  # Git ignore rules
```

## Installation

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Expo CLI**: Latest version
- **EAS CLI**: For cloud builds
- **Git**: For version control

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bloom.git
   cd bloom/Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

4. **Start development server**
   ```bash
   npm start
   # Or specifically for Android/iOS
   npm run android
   npm run ios
   ```

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd bloombackend
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Set MongoDB URI and other secrets
   ```

3. **Run with Docker**
   ```bash
   docker build -t bloom-backend .
   docker run -p 8080:80 bloom-backend
   ```

## Development

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Start | `npm start` | Start Expo development server |
| Android | `npm run android` | Start Android emulator |
| iOS | `npm run ios` | Start iOS simulator |
| Web | `npm run web` | Start web version |
| Build APK | `npm run build:android` | Build Android APK via EAS |
| Build iOS | `npm run build:ios` | Build iOS archive via EAS |

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: 2-space indentation

## Building for Production

### Android APK (Installable)

```bash
npx eas-cli build -p android --profile preview
```

Output: APK file for direct installation on Android devices.

### Android AAB (Play Store)

```bash
npx eas-cli build -p android --profile production
```

Output: AAB file for Google Play Store submission.

### iOS

```bash
npx eas-cli build -p ios --profile preview
```

Requires Apple Developer account for device testing.

## Environment Variables

Create `.env` file in Frontend directory:

```env
# API Configuration
BACKEND_URL=https://your-api.com
LOCAL_BACKEND_URL=http://localhost:5000

# MongoDB
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=bloom

# AI Services
PHI4_API_KEY=your_phi4_key
PHI4_ENDPOINT=https://api.phi4.com
DEEPSEEK_API_KEY=your_deepseek_key
GOOGLE_VISION_API_KEY=your_google_key

# Payment & Subscriptions
REVENUECAT_PUBLIC_SDK_KEY=your_rc_key

# Push Notifications
FCM_SERVER_KEY=your_fcm_key

# Authentication
JWT_SECRET=your_jwt_secret
BCRYPT_SALT_ROUNDS=10

# Cloud Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_secret
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET_NAME=bloom-bucket
```

## API Integration

The frontend communicates with the ASP.NET Core backend via RESTful API endpoints.

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh

### Product Endpoints

- `GET /api/products` - List products
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### AI Scanning

- `POST /api/ai/analyze` - Analyze product image
- `POST /api/ai/generate-listing` - Generate product details

## Screenshots

| Marketplace | Scan Product | Wallet |
|-------------|------------|--------|
| ![Marketplace](docs/screenshots/marketplace.png) | ![Scan](docs/screenshots/scan.png) | ![Wallet](docs/screenshots/wallet.png) |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Commit Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation update
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test updates

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For support, email support@bloom.app or join our Discord community.

## Acknowledgments

- [Expo Team](https://expo.dev) for the amazing development platform
- [React Native Community](https://reactnative.dev) for the comprehensive framework
- Contributors and testers who helped shape Bloom

---

**Made with ❤️ by The Real Shawn**
