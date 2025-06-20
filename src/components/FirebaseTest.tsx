import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/firebase';
import { BabyProfile } from '../store/store';
import { motion } from 'framer-motion';
import { Database, User, LogIn, LogOut, Plus, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const FirebaseTest = () => {
  const { currentUser, login, signup, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<{
    auth: boolean;
    database: boolean;
    realtime: boolean;
  }>({
    auth: false,
    database: false,
    realtime: false
  });

  // Test data
  const testProfile: BabyProfile = {
    id: 'test-profile-' + Date.now(),
    userName: 'Test Parent',
    babyName: 'Test Baby',
    dob: '2024-01-01',
    createdAt: new Date().toISOString()
  };

  // Test authentication
  const testAuth = async () => {
    setIsLoading(true);
    try {
      // Try to create a test account
      const email = `test-${Date.now()}@littlesprout.test`;
      const password = 'testpassword123';
      
      await signup(email, password);
      toast.success('Authentication test passed!');
      setTestResults(prev => ({ ...prev, auth: true }));
    } catch (error: any) {
      console.error('Auth test error:', error);
      toast.error(`Auth test failed: ${error.message}`);
      setTestResults(prev => ({ ...prev, auth: false }));
    } finally {
      setIsLoading(false);
    }
  };

  // Test database operations
  const testDatabase = async () => {
    if (!currentUser) {
      toast.error('Please login first to test database');
      return;
    }

    setIsLoading(true);
    try {
      // Test creating a profile
      await DatabaseService.createProfile(currentUser.uid, testProfile);
      toast.success('Profile created successfully!');

      // Test reading profiles
      const profiles = await DatabaseService.getProfiles(currentUser.uid);
      console.log('Retrieved profiles:', profiles);

      // Test updating profile
      await DatabaseService.updateProfile(currentUser.uid, testProfile.id, {
        babyName: 'Updated Test Baby'
      });

      // Test deleting profile
      await DatabaseService.deleteProfile(currentUser.uid, testProfile.id);

      toast.success('Database test passed!');
      setTestResults(prev => ({ ...prev, database: true }));
    } catch (error: any) {
      console.error('Database test error:', error);
      toast.error(`Database test failed: ${error.message}`);
      setTestResults(prev => ({ ...prev, database: false }));
    } finally {
      setIsLoading(false);
    }
  };

  // Test real-time listeners
  const testRealtime = async () => {
    if (!currentUser) {
      toast.error('Please login first to test real-time features');
      return;
    }

    setIsLoading(true);
    try {
      // Create a test profile for real-time testing
      const realtimeProfile: BabyProfile = {
        id: 'realtime-test-' + Date.now(),
        userName: 'Realtime Test',
        babyName: 'Realtime Baby',
        dob: '2024-01-01',
        createdAt: new Date().toISOString()
      };

      await DatabaseService.createProfile(currentUser.uid, realtimeProfile);

      // Set up real-time listener
      const unsubscribe = DatabaseService.subscribeToProfile(
        currentUser.uid,
        realtimeProfile.id,
        (profile) => {
          if (profile) {
            console.log('Real-time update received:', profile);
            toast.success('Real-time test passed!');
            setTestResults(prev => ({ ...prev, realtime: true }));
            unsubscribe(); // Clean up listener
          }
        }
      );

      // Clean up test profile after 5 seconds
      setTimeout(async () => {
        try {
          await DatabaseService.deleteProfile(currentUser.uid, realtimeProfile.id);
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      }, 5000);

    } catch (error: any) {
      console.error('Real-time test error:', error);
      toast.error(`Real-time test failed: ${error.message}`);
      setTestResults(prev => ({ ...prev, realtime: false }));
    } finally {
      setIsLoading(false);
    }
  };

  // Quick login for testing
  const quickLogin = async () => {
    setIsLoading(true);
    try {
      const email = 'test@littlesprout.test';
      const password = 'testpassword123';
      await login(email, password);
      toast.success('Quick login successful!');
    } catch (error: any) {
      // If login fails, try to create account
      try {
        const email = 'test@littlesprout.test';
        const password = 'testpassword123';
        await signup(email, password);
        toast.success('Account created and logged in!');
      } catch (signupError: any) {
        toast.error(`Login failed: ${signupError.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
    >
      <div className="text-center mb-6">
        <Database className="w-12 h-12 mx-auto mb-4 text-green-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Firebase Configuration Test
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Test your Firebase setup and verify all services are working
        </p>
      </div>

      {/* Current User Status */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center space-x-3">
          {currentUser ? (
            <>
              <User className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Logged in as: {currentUser.email}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  UID: {currentUser.uid}
                </p>
              </div>
            </>
          ) : (
            <>
              <LogOut className="w-5 h-5 text-red-500" />
              <p className="text-gray-600 dark:text-gray-400">Not logged in</p>
            </>
          )}
        </div>
      </div>

      {/* Test Results */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg border ${
          testResults.auth 
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700' 
            : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
        }`}>
          <div className="flex items-center space-x-2">
            {testResults.auth ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-400" />
            )}
            <span className="font-medium">Authentication</span>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${
          testResults.database 
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700' 
            : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
        }`}>
          <div className="flex items-center space-x-2">
            {testResults.database ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-400" />
            )}
            <span className="font-medium">Database</span>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${
          testResults.realtime 
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700' 
            : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
        }`}>
          <div className="flex items-center space-x-2">
            {testResults.realtime ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-400" />
            )}
            <span className="font-medium">Real-time</span>
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="space-y-4">
        {!currentUser ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={quickLogin}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Quick Login</span>
            </button>
            <button
              onClick={testAuth}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Test Auth</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={testDatabase}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Database className="w-4 h-4" />
              <span>Test Database</span>
            </button>
            <button
              onClick={testRealtime}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Database className="w-4 h-4" />
              <span>Test Real-time</span>
            </button>
            <button
              onClick={logout}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Test Instructions:
        </h3>
        <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>1. Click "Quick Login" to sign in with a test account</li>
          <li>2. Click "Test Database" to verify CRUD operations</li>
          <li>3. Click "Test Real-time" to verify live updates</li>
          <li>4. Check the browser console for detailed logs</li>
        </ol>
      </div>
    </motion.div>
  );
};

export default FirebaseTest; 