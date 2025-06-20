import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
// You'll need to replace these with your actual Firebase project values
const firebaseConfig = {

    apiKey: "AIzaSyAeFZ7bInJUADkK_r9l6CLmvlhi7GrxIwo",  
    authDomain: "littlesprout-pwa.firebaseapp.com",  
    projectId: "littlesprout-pwa",  
    storageBucket: "littlesprout-pwa.firebasestorage.app",  
    messagingSenderId: "306138978737",  
    appId: "1:306138978737:web:a3acfd9c8b9e0f013e8590"  
  };
  

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Storage service will be added in future upgrade
// export const storage = getStorage(app);

// Export the app instance for potential future use
export default app; 