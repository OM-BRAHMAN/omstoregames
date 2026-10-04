# OMSTORE.COM - Alternative Android App Store

A full-stack Android Game & Application Store inspired by the Google Play Store, featuring instant APK downloads, categories, detailed game sheets, an Admin Publisher Panel, Express file storage, and integrated Firebase Firestore & Storage support.

---

## 📁 Directory Structure

```text
├── data/
│   └── games.json                 # Persistent local database seed with 8+ preloaded games
├── uploads/                       # Storage for uploaded APKs, icons, and screenshots
├── src/
│   ├── components/
│   │   ├── Header.tsx             # Play Store style top navigation & live search bar
│   │   ├── HeroBanner.tsx         # Featured Editor's Choice carousel banner
│   │   ├── CategoryPills.tsx      # Category pills (Action, Racing, Puzzle, RPG, etc.)
│   │   ├── GameCard.tsx           # Play Store style card with rating, size & download
│   │   ├── GameDetailModal.tsx    # Comprehensive modal with screenshots, specs & reviews
│   │   ├── AdminPanel.tsx         # Dedicated publisher panel to upload and manage games
│   │   └── FirebaseGuideModal.tsx # Interactive Firebase credentials connection & guide
│   ├── services/
│   │   ├── api.ts                 # Express REST API client (Fetch, Upload, Download APK)
│   │   └── firebase.ts            # Cloud Firestore real-time sync & Firebase Storage
│   ├── types/
│   │   └── game.ts                # TypeScript data models for Games, Categories & Reviews
│   ├── App.tsx                    # Main controller & layout
│   ├── index.css                  # Custom styling & scrollbars
│   └── main.tsx                   # React root mount
├── server.ts                      # Full-stack Node.js + Express backend server
├── .env.example                   # Environment variable template including Firebase
├── package.json                   # Dependencies and scripts
└── tsconfig.json                  # TypeScript configuration
```

---

## 🚀 Features

1. **Modern Play Store UI**:
   - Google Play Store inspired dark-mode interface.
   - Live search with instant keyboard shortcut (`/`) and matching dropdown suggestions.
   - Featured Editor's Choice spotlight carousel with auto-rotation.
   - Categories filter: Action, Racing, Puzzle, RPG, Strategy, Casual, Tools, Adventure, Sports.
   - Top Charts leaderboard ranking games by verified APK installations.

2. **Game Cards & Detailed Modal**:
   - Displays Game Title, squircle icon, brief pitch, developer, rating, downloads, and APK size.
   - Detailed modal with screenshots slider, Android package specifications (Package name, Min OS, Arch), verified malware scan badge, and user review submission with star ratings.

3. **Admin Publisher Panel (`/admin` or `#admin`)**:
   - Text inputs: Game Name, Category, Developer, Version, Package Name, Short Description, and Long Description.
   - Asset uploads: Game Icon file, Header Banner file, and actual `.apk` binary file.
   - Progress bar during uploads.
   - Instantly publishes to the store catalog without restarting the server.
   - Catalog management table with delete and test download actions.

4. **Real-time Download Pipeline**:
   - Clicking "Download APK" increments the download counter in real time.
   - Streams the physical `.apk` file with `application/vnd.android.package-archive` MIME type and `Content-Disposition: attachment`.

5. **Firebase Integration (Dual-Mode)**:
   - **Out-of-the-Box Mode**: Uses the built-in Express backend and `data/games.json` with `/uploads` file storage. No setup needed to start using the store immediately!
   - **Firebase Mode**: Connect your Firebase project to enable real-time Cloud Firestore synchronization and Firebase Storage bucket uploads for heavy APKs.

---

## 🔑 How to Connect Your Firebase Credentials

You can connect Firebase in two easy ways:

### Method 1: Using the In-App Modal (Easiest)
1. Click the **"Setup FB"** or **"Firebase Keys"** button in the top bar or footer.
2. In the modal, either paste your `firebaseConfig` snippet from the Firebase Console or fill in:
   - **API Key** (`AIzaSy...`)
   - **Project ID** (`my-project-id`)
   - **Auth Domain** (`my-project-id.firebaseapp.com`)
   - **Storage Bucket** (`my-project-id.appspot.com`)
   - **App ID** (`1:123456789:web:abcdef`)
3. Click **"Save & Activate Firebase"**. The app will test the connection and switch to real-time Firestore sync!

### Method 2: Via `.env` Variables
Add the following to your `.env` file:
```bash
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="my-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="my-project"
VITE_FIREBASE_STORAGE_BUCKET="my-project.appspot.com"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"
```

---

## 🛡️ Recommended Firebase Security Rules

### Firestore Rules (`firestore.rules`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /games/{gameId} {
      allow read: if true;
      allow write: if true; // Or restrict to admin in production
    }
  }
}
```

### Firebase Storage Rules (`storage.rules`):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /apks/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
    match /images/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```
