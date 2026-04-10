# Velth Beta Build & Testing Guide

## Overview

Velth is a personal finance app focused on mindful money management for users in India. This guide provides instructions for building the Android APK for beta testing and deployment.

---

## Prerequisites

Before building the APK, ensure you have:

- **Node.js** (v22+) and **pnpm** (v9.12+) installed
- **Android SDK** (API level 31+) for local builds
- **Java Development Kit (JDK)** 17 or higher
- **Expo CLI** (`npm install -g expo-cli`)
- **EAS CLI** (`npm install -g eas-cli`)

---

## Build Methods

### Method 1: Using EAS Build (Recommended for Production)

EAS Build is Expo's managed build service that handles all compilation and signing.

#### Step 1: Authenticate with Expo

```bash
cd /home/ubuntu/velth-app
eas login
```

#### Step 2: Configure Credentials

```bash
eas credentials
```

Select Android and follow the prompts to set up signing credentials.

#### Step 3: Build APK

```bash
eas build --platform android --profile beta
```

The build will be processed in the cloud. Monitor progress at https://expo.dev/builds

#### Step 4: Download APK

Once complete, download the APK from the Expo dashboard or use:

```bash
eas build:list
```

---

### Method 2: Local Build with Gradle

For faster local builds during development:

#### Step 1: Install Dependencies

```bash
cd /home/ubuntu/velth-app
pnpm install
```

#### Step 2: Generate Native Android Project

```bash
npx expo prebuild --platform android --clean
```

#### Step 3: Build APK

```bash
cd android
./gradlew assembleRelease
```

The APK will be generated at: `android/app/build/outputs/apk/release/app-release.apk`

---

### Method 3: Using Expo CLI (Simplest)

For quick beta builds without full Android setup:

```bash
cd /home/ubuntu/velth-app
npx expo export --platform android
```

Then use Expo's web-based builder or upload to EAS.

---

## Build Profiles

The project includes multiple build profiles in `eas.json`:

| Profile | Type | Use Case |
|---------|------|----------|
| `preview` | APK | Quick testing |
| `preview2` | APK | Alternative testing |
| `preview3` | APK | Alternative testing |
| `beta` | APK | Beta release testing |
| `production` | AAB | Google Play Store release |

---

## APK Installation & Testing

### Install on Physical Device

```bash
# Using ADB (Android Debug Bridge)
adb install -r app-release.apk

# Or transfer via USB and install manually
```

### Install on Emulator

```bash
# List available emulators
emulator -list-avds

# Start emulator
emulator -avd <emulator_name>

# Install APK
adb install -r app-release.apk
```

### Launch App

```bash
adb shell am start -n space.manus.velth/.MainActivity
```

---

## Beta Testing Checklist

### Core Features

- [ ] **Envelope Budgeting**
  - [ ] Create envelope with name, budget, opening balance, goal
  - [ ] Edit envelope details
  - [ ] Delete envelope
  - [ ] Add/reduce balance
  - [ ] View progress bars and goal tracking
  - [ ] Test alert thresholds

- [ ] **Cashbook**
  - [ ] Add transaction with amount, category, date, notes
  - [ ] Edit transaction
  - [ ] Delete transaction
  - [ ] Date picker functionality
  - [ ] Category dropdown
  - [ ] Transaction history display

- [ ] **Reports & Insights**
  - [ ] View monthly overview
  - [ ] Category-wise breakdown chart
  - [ ] Monthly spending trends
  - [ ] Total spent vs remaining
  - [ ] Empty state handling

### Settings & Configuration

- [ ] **Settings Tab**
  - [ ] Edit user profile (name, email)
  - [ ] Change currency (INR, USD, EUR, GBP, JPY, AUD, CAD, SGD)
  - [ ] Verify currency updates app-wide
  - [ ] Export data as JSON
  - [ ] Import data from JSON
  - [ ] Delete all data with confirmation

### Advanced Features

- [ ] **Multi-Currency Support**
  - [ ] Switch between 8 supported currencies
  - [ ] Verify all amounts display with correct symbol
  - [ ] Test currency persistence across app restart

- [ ] **Auto-Save**
  - [ ] Create envelope and verify auto-save
  - [ ] Add transaction and verify auto-save
  - [ ] Close and reopen app to confirm data persists

- [ ] **Recurring Transactions**
  - [ ] Create recurring transaction (daily, weekly, monthly, yearly)
  - [ ] Verify auto-generation on correct dates
  - [ ] Edit/delete recurring transaction

- [ ] **Budget Alerts**
  - [ ] Set alert threshold (e.g., 80%)
  - [ ] Verify alert triggers when spending exceeds threshold
  - [ ] Check alert display in UI

- [ ] **Donate Tab**
  - [ ] View developer notes
  - [ ] Verify donation options display
  - [ ] Test payment method selection

### Performance & Stability

- [ ] App launches without crashes
- [ ] No memory leaks during extended use
- [ ] Smooth scrolling in transaction lists
- [ ] Charts render correctly
- [ ] No UI lag when adding/editing data
- [ ] App survives background/foreground transitions

### Data Integrity

- [ ] Data persists after app restart
- [ ] No data loss on force close
- [ ] Calculations are accurate
- [ ] Budget totals match transaction sums
- [ ] Currency conversions (if applicable) are correct

### UI/UX

- [ ] Light theme displays correctly
- [ ] All text is readable
- [ ] Buttons are responsive
- [ ] Forms validate input properly
- [ ] Error messages are clear
- [ ] Empty states are helpful

---

## Known Issues & Limitations

### Current Limitations

1. **No Cloud Sync** — Data is stored locally on device only
2. **No Multi-Device Sync** — Cannot sync between devices
3. **No Bank Integration** — Transactions must be entered manually
4. **Limited Export** — CSV/PDF export not yet implemented in APK
5. **No Push Notifications** — Budget alerts are in-app only

### Known Issues

- Server TypeScript errors (non-critical for mobile app)
- Some deprecated dependencies (will be updated in next release)

---

## Troubleshooting

### Build Fails with "pnpm install failed"

```bash
# Clean and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install --force
```

### APK Installation Fails

```bash
# Uninstall existing version
adb uninstall space.manus.velth

# Clear app data
adb shell pm clear space.manus.velth

# Reinstall APK
adb install -r app-release.apk
```

### App Crashes on Launch

1. Check logcat for errors: `adb logcat | grep velth`
2. Verify app permissions are granted
3. Clear app cache: `adb shell pm clear space.manus.velth`
4. Reinstall APK

### Data Not Persisting

1. Verify AsyncStorage is initialized
2. Check device storage is not full
3. Clear app data and restart
4. Check app has write permissions

---

## Reporting Issues

When reporting bugs, include:

1. **Device Info** — Model, OS version, Android version
2. **Steps to Reproduce** — Exact steps that cause the issue
3. **Expected Behavior** — What should happen
4. **Actual Behavior** — What actually happened
5. **Screenshots/Logs** — Visual proof and error logs

---

## Release Notes (Beta v1.0.0)

### Features Included

✅ Envelope Budgeting System
✅ Cashbook Transaction Tracking
✅ Reports & Insights with Charts
✅ Settings with Profile Management
✅ Multi-Currency Support (8 currencies)
✅ Auto-Save Functionality
✅ Recurring Transactions
✅ Budget Alerts
✅ Data Export/Import
✅ Donate Tab with Developer Notes

### What's Next

🔄 Cloud Sync & Cross-Device Support
🔄 Bank Account Integration
🔄 Advanced Analytics & Forecasting
🔄 Collaborative Budgeting
🔄 Push Notifications
🔄 CSV/PDF Export

---

## Support

For issues or questions:

1. Check this guide's troubleshooting section
2. Review app logs: `adb logcat`
3. Contact development team with detailed bug reports

---

## Build Configuration

**App Details:**
- **Name:** Velth
- **Bundle ID:** space.manus.velth
- **Version:** 1.0.0
- **Minimum SDK:** API 31
- **Target SDK:** API 34

**Tech Stack:**
- React Native 0.81.5
- Expo SDK 54
- TypeScript 5.9
- NativeWind 4.2 (Tailwind CSS)

---

## File Structure

```
velth-app/
├── app/                          # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx            # Dashboard
│   │   ├── envelopes.tsx        # Envelope Budgeting
│   │   ├── cashbook.tsx         # Transaction Tracking
│   │   ├── reports.tsx          # Reports & Insights
│   │   ├── settings.tsx         # Settings
│   │   └── donate.tsx           # Donate Tab
│   ├── _layout.tsx              # Root layout
│   └── oauth/                   # Auth callbacks
├── lib/
│   ├── types.ts                 # TypeScript types
│   ├── storage.ts               # AsyncStorage utilities
│   ├── finance-context.tsx      # State management
│   ├── validators.ts            # Input validation
│   ├── error-handler.ts         # Error handling
│   └── currency.ts              # Currency formatting
├── components/                  # Reusable components
├── hooks/                       # Custom hooks
├── tests/                       # Test suites (124 tests)
├── eas.json                     # EAS Build config
├── app.config.ts                # Expo config
├── tailwind.config.js           # Tailwind config
└── package.json                 # Dependencies
```

---

## Version History

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 1.0.0 | 2026-04-10 | Beta | Initial beta release with all core features |

---

Generated: 2026-04-10
Last Updated: 2026-04-10
