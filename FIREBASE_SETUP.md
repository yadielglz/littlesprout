# Firebase Setup Guide for LittleSprout

## 🚀 Quick Start

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "littlesprout-app")
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create project"

### 2. Enable Firebase Services

In your Firebase project console, enable these services:

#### Authentication
1. Go to "Authentication" → "Get started"
2. Click "Sign-in method"
3. Enable "Email/Password"
4. Enable "Google" (optional but recommended)
5. Save

#### Firestore Database
1. Go to "Firestore Database" → "Create database"
2. Choose "Start in test mode" (for development)
3. Select a location (choose closest to your users)
4. Click "Done"

#### Storage
1. Go to "Storage" → "Get started"
2. Choose "Start in test mode" (for development)
3. Select a location (same as Firestore)
4. Click "Done"

### 3. Get Your Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → "Web"
4. Register your app with a nickname (e.g., "LittleSprout Web")
5. Copy the configuration object

### 4. Configure Environment Variables

1. Copy `env.example` to `.env.local`:
```bash
cp env.example .env.local
```

2. Replace the placeholder values in `.env.local` with your actual Firebase config:
```env
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 5. Set Up Firestore Security Rules

In Firebase Console → Firestore Database → Rules, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow access to user's profiles
      match /profiles/{profileId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
        
        // Allow access to profile data
        match /{document=**} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
  }
}
```

### 6. Set Up Storage Security Rules

In Firebase Console → Storage → Rules, replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only access their own files
    match /photos/{userId}/{profileId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /documents/{userId}/{profileId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🔧 Integration Steps

### 1. Wrap Your App with AuthProvider

Update your `src/main.tsx`:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
```

### 2. Test the Configuration

Create a simple test component to verify Firebase is working:

```typescript
// src/components/FirebaseTest.tsx
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/firebase';

const FirebaseTest = () => {
  const { currentUser, login, signup, logout } = useAuth();

  const testFirebase = async () => {
    try {
      // Test database connection
      if (currentUser) {
        const profiles = await DatabaseService.getProfiles(currentUser.uid);
        console.log('Profiles:', profiles);
      }
    } catch (error) {
      console.error('Firebase test error:', error);
    }
  };

  return (
    <div className="p-4">
      <h2>Firebase Test</h2>
      <p>Current user: {currentUser?.email || 'Not logged in'}</p>
      <button onClick={testFirebase}>Test Firebase Connection</button>
    </div>
  );
};

export default FirebaseTest;
```

## 🚨 Important Security Notes

1. **Never commit `.env.local`** - It contains sensitive API keys
2. **Use proper security rules** - The rules above ensure users can only access their own data
3. **Test in production** - Make sure to test with real Firebase project before deploying
4. **Monitor usage** - Keep an eye on Firebase usage in the console

## 📱 Next Steps

After setting up Firebase, you can:

1. **Add authentication UI** - Create login/signup forms
2. **Migrate existing data** - Import localStorage data to Firestore
3. **Add real-time features** - Use Firestore listeners for live updates
4. **Implement photo uploads** - Use Firebase Storage for baby photos
5. **Add push notifications** - Use Firebase Cloud Messaging

## 🆘 Troubleshooting

### Common Issues:

1. **"Firebase App named '[DEFAULT]' already exists"**
   - Make sure you're only initializing Firebase once
   - Check that you're not importing firebase config multiple times

2. **"Permission denied" errors**
   - Check your Firestore security rules
   - Make sure the user is authenticated
   - Verify the user ID matches the document path

3. **Environment variables not working**
   - Make sure the file is named `.env.local` (not `.env`)
   - Restart your development server after adding environment variables
   - Check that variable names start with `VITE_`

4. **Storage upload fails**
   - Check Storage security rules
   - Verify the file size is within limits
   - Make sure the user is authenticated

## 📞 Support

If you encounter issues:

1. Check the [Firebase Documentation](https://firebase.google.com/docs)
2. Review the [Firebase Console](https://console.firebase.google.com/) for error logs
3. Check the browser console for detailed error messages
4. Verify your Firebase project settings and configuration

---

🎉 **Congratulations!** Your LittleSprout app is now configured with Firebase and ready for cloud features! 