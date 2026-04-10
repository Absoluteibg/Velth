# Quick Start: Build Velth APK

## Fastest Way to Build APK (5 minutes)

### Prerequisites

```bash
# Install Node.js (v22+) and pnpm (v9.12+)
node --version  # Should be v22+
pnpm --version  # Should be v9.12+

# Install EAS CLI
npm install -g eas-cli
```

### Build Steps

```bash
# 1. Navigate to project
cd /home/ubuntu/velth-app

# 2. Install dependencies
pnpm install

# 3. Authenticate with Expo
eas login

# 4. Build APK
eas build --platform android --profile beta

# 5. Download APK from Expo Dashboard
# Visit: https://expo.dev/builds
```

### Install & Test

```bash
# Install on device/emulator
adb install -r velth-beta.apk

# Launch app
adb shell am start -n space.manus.velth/.MainActivity
```

---

## Alternative: Local Build (Requires Android SDK)

```bash
# 1. Install dependencies
pnpm install

# 2. Generate native Android project
npx expo prebuild --platform android --clean

# 3. Build APK
cd android
./gradlew assembleRelease

# 4. APK location
# android/app/build/outputs/apk/release/app-release.apk
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `pnpm install failed` | `rm -rf node_modules && pnpm install --force` |
| `eas login required` | Run `eas login` and authenticate |
| `APK installation fails` | `adb uninstall space.manus.velth && adb install -r app.apk` |
| `App crashes on launch` | Check `adb logcat` for errors |

---

## Testing Checklist

- [ ] App launches without crashes
- [ ] Can create envelope with budget
- [ ] Can add transaction to cashbook
- [ ] Reports display charts correctly
- [ ] Settings page loads
- [ ] Currency can be changed
- [ ] Data persists after restart

---

For detailed guide, see: `BETA_BUILD_GUIDE.md`
