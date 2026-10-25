# Firebase Cloud Setup & Deployment Guide

**Project Title:** Cloud-Based Disaster Management & Emergency Response System  
**Description:** A cloud-based platform for reporting emergency incidents, managing disaster information, coordinating response teams, and tracking the status of rescue operations.

---

## 1. Firebase Project Setup Checklist

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/).
   - Click **Add Project** and name it (e.g., `disaster-response-system`).
   - Disable or enable Google Analytics according to group preference.

2. **Enable Cloud Firestore:**
   - In the left sidebar, navigate to **Build** → **Firestore Database**.
   - Click **Create Database**.
   - Select your preferred cloud region (e.g., `asia-south1` or `us-central1`).
   - Choose **Start in test mode** for initial setup, then deploy `firestore.rules`.

3. **Enable Firebase Authentication:**
   - In the sidebar, navigate to **Build** → **Authentication**.
   - Click **Get Started**.
   - Under Sign-in method, enable **Email/Password** provider.

4. **Register Web App:**
   - In Project Settings, click the **Web (</>)** icon.
   - Register the app name: `disaster-web-app`.
   - Copy the `firebaseConfig` object values.

---

## 2. Environment Configuration

Create a file named `.env` in the root of the project:
```env
VITE_FIREBASE_API_KEY=AIzaSy...YourActualKey...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

---

## 3. Secure Admin Provisioning Process

For security, public registration never grants administrator privileges. To create the primary administrator:

### Step 1: Register Account
Use the application registration page (`/login`) or Firebase Console Authentication tab to create an account with email (e.g., `admin@emergency.local`).

### Step 2: Elevate Role in Firestore
1. Open the Firebase Console → **Firestore Database**.
2. Navigate to the `users` collection.
3. Locate the document corresponding to the administrator's UID.
4. Set the field:
   ```json
   "role": "admin"
   ```
5. Save the document. The user now possesses administrator dispatch and verification capabilities governed by `firestore.rules`.

---

## 4. Deploying Security Rules & Firebase Hosting

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login & Initialize
```bash
firebase login
firebase use --add your-project-id
```

### Step 3: Deploy Firestore Security Rules
```bash
firebase deploy --only firestore:rules
```

### Step 4: Build & Deploy to Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```
Once completed, Firebase will provide the live hosting URL:
`https://your-project-id.web.app`

---

## 5. Running the Firebase Local Emulator Suite (Optional)

To test Firestore rules and authentication completely locally without consuming cloud quotas:
```bash
firebase init emulators
firebase emulators:start
```
The application will communicate with the local emulator on port 8080.
