# Plotway

**Private Land & Property Inventory Management for Real-Estate Brokers**

Plotway is a mobile-first Android application that helps real-estate brokers manage their property inventory, track buyer requirements, match properties with buyers, schedule site visits, and close deals efficiently.

## 🏗️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend UI | HTML5 + ES6 Modules + CSS3 | Lightweight SPA |
| Mobile Runtime | Capacitor 7 + @capacitor/android | Android APK |
| Database | Firebase / Cloud Firestore | Cloud database with offline sync |
| File Storage | GitHub REST API + jsDelivr CDN | Property image/file delivery |
| Build Tool | Vite | Fast bundling |
| CI/CD | GitHub Actions + Gradle + Java 21 | Automated APK build |
| Maps | Leaflet + OpenStreetMap | Location display & navigation |

## 📁 Project Structure

```
plotway/
├── src/
│   ├── index.html              # App shell
│   ├── css/
│   │   └── styles.css          # Complete design system
│   └── js/
│       ├── app.js              # Main entry point & router setup
│       ├── firebase.js         # Firebase initialization
│       ├── router.js           # Hash-based SPA router
│       ├── utils.js            # Utilities & constants
│       ├── config/
│       │   └── firebase-config.js  # Firebase configuration
│       ├── services/
│       │   ├── firestore.js    # Firestore CRUD operations
│       │   └── storage.js      # File storage abstraction
│       └── pages/
│           ├── dashboard.js    # Dashboard with stats
│           ├── inventory.js    # Property listing
│           ├── property-add.js # Add property form
│           ├── property-detail.js  # Property details
│           ├── property-edit.js    # Edit property
│           ├── buyers.js       # Buyers & requirements
│           ├── leads.js        # Lead management
│           ├── site-visits.js  # Site visit scheduling
│           └── more.js         # Settings & about
├── android/                    # Capacitor Android project
├── .github/
│   └── workflows/
│       └── android-build.yml   # CI/CD pipeline
├── firestore.rules             # Firestore security rules
├── capacitor.config.json       # Capacitor configuration
├── vite.config.js              # Vite build configuration
├── package.json                # Node.js dependencies
└── README.md                   # This file
```

## 🔥 Firebase Setup

### Firestore Collections

| Collection | Purpose |
|-----------|---------|
| `properties` | Property inventory |
| `buyers` | Buyer profiles |
| `buyerRequirements` | What buyers are looking for |
| `leads` | Incoming leads |
| `siteVisits` | Scheduled property visits |
| `activities` | Activity log |
| `settings` | App settings |

### Firebase Authentication

The app uses Firebase Anonymous Authentication for the initial version. This ensures all Firestore operations require authentication without adding a complex sign-in flow.

### Firestore Security Rules

Security rules are defined in `firestore.rules`. All collections require authentication. The default rule denies all access to undefined paths.

To deploy rules:
```bash
firebase deploy --only firestore:rules
```

### Firebase Console

- Project: `internal-valikatti`
- Console: https://console.firebase.google.com/project/internal-valikatti

Required Firebase features to enable:
1. **Cloud Firestore** — Create a database in production mode
2. **Authentication** — Enable Anonymous sign-in method
3. **Firestore Indexes** — Create composite indexes if query errors appear

## 🖥️ Local Development

### Prerequisites

- Node.js 20+
- npm 10+

### Setup

```bash
# Clone the repository
git clone https://github.com/LogisERP/plotway.git
cd plotway

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

## 📱 Android Development

### Prerequisites

- Android Studio (with Android SDK)
- Java 21

### Setup Android Project

```bash
# Build web assets
npm run build

# Sync with Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android
```

### Build APK Locally

```bash
# Full build pipeline
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

## 🚀 GitHub Actions

### Automated APK Build

Every push to `main` triggers an automated Android build:

1. Go to **GitHub → Actions → Android Build**
2. Wait for a successful run
3. Click on the run
4. Download the **plotway-android-apk** artifact
5. Extract the ZIP to get `app-debug.apk`
6. Install on your Android device

### Manual Trigger

You can also trigger a build manually:
1. Go to **GitHub → Actions → Android Build**
2. Click **Run workflow**
3. Select the `main` branch
4. Click **Run workflow**

## 📲 APK Download

After a successful GitHub Actions run:

```
GitHub → Actions → Android Build → Latest Run → Artifacts → plotway-android-apk → Download
```

The APK is a debug build that can be installed on any Android device with "Install from unknown sources" enabled.

## 🔐 Security

### What's Protected

- All Firestore data requires Firebase Authentication
- Anonymous authentication is used (can be upgraded to email/phone)
- No GitHub PATs or private keys in client code
- File storage abstraction keeps upload secure

### What's NOT a Secret

- Firebase Web API key (it's a public identifier, not a secret)
- Firebase project configuration

### File Upload Security

The file storage system is designed with a secure abstraction layer. Direct GitHub uploads require a Personal Access Token which **must not** be embedded in client code. Options for production:

1. **Firebase Cloud Functions** — Proxy uploads through a serverless function
2. **Server-side endpoint** — Use a secure backend to handle GitHub API calls
3. **Firebase Storage** — Switch to Firebase Storage for direct client uploads

## 🎯 Features

### Core
- ✅ Property inventory CRUD
- ✅ Dashboard with statistics
- ✅ Property search across all fields
- ✅ Status filter chips
- ✅ Filter drawer (type, status, size, budget, features)
- ✅ Property photo management
- ✅ GPS location capture
- ✅ Leaflet/OpenStreetMap integration

### Broker Workflow
- ✅ Buyer management
- ✅ Buyer requirements
- ✅ Property matching with scoring
- ✅ Lead tracking
- ✅ Site visit scheduling
- ✅ Call/WhatsApp deep links
- ✅ Property sharing (without owner info)

### Technical
- ✅ Offline support (Firestore persistence)
- ✅ Network state indicator
- ✅ Image compression
- ✅ Responsive design
- ✅ Dark theme
- ✅ Toast notifications
- ✅ Bottom sheets & modals
- ✅ Loading & empty states
- ✅ Error handling
- ✅ GitHub Actions CI/CD

## 🔮 Future Improvements

- [ ] Firebase email/phone authentication
- [ ] Secure file upload via serverless proxy
- [ ] Firebase Storage integration
- [ ] Push notifications for follow-ups
- [ ] Property comparison view
- [ ] Deal/transaction tracking
- [ ] Report generation
- [ ] Data export (CSV/PDF)
- [ ] Multi-language support
- [ ] Property timeline/history
- [ ] Advanced analytics dashboard

## 📄 License

Private application — not for public distribution.