import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  RefreshCw,
  Database
} from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { 
  getOfflineQueueStatus, 
  manualSync, 
  clearFailedOperations, 
  retryFailedOperations 
} from '../utils/offlineQueue';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface OfflineIndicatorProps {
  position?: 'top' | 'bottom';
  showOnlineStatus?: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  position = 'top', 
  showOnlineStatus = true 
}) => {
  const isOnline = useOnlineStatus();
  const { currentUser } = useAuth();
  const [queueStatus, setQueueStatus] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  // Update queue status periodically
  useEffect(() => {
    const updateQueueStatus = () => {
      setQueueStatus(getOfflineQueueStatus());
    };

    updateQueueStatus();
    const interval = setInterval(updateQueueStatus, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Handle manual sync
  const handleManualSync = async () => {
    if (!currentUser) {
      toast.error('Please log in to sync data');
      return;
    }

    setIsManualSyncing(true);
    try {
      await manualSync(currentUser.uid);
      setQueueStatus(getOfflineQueueStatus());
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsManualSyncing(false);
    }
  };

  // Handle retry failed operations
  const handleRetryFailed = () => {
    retryFailedOperations();
    setQueueStatus(getOfflineQueueStatus());
  };

  // Handle clear failed operations
  const handleClearFailed = () => {
    clearFailedOperations();
    setQueueStatus(getOfflineQueueStatus());
  };

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    if (queueStatus?.failed > 0) return 'bg-yellow-500';
    if (queueStatus?.pending > 0) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (queueStatus?.isProcessing) return 'Syncing...';
    if (queueStatus?.failed > 0) return `${queueStatus.failed} failed`;
    if (queueStatus?.pending > 0) return `${queueStatus.pending} pending`;
    return 'Online';
  };

  const getStatusIcon = () => {
    if (!isOnline) return WifiOff;
    if (queueStatus?.isProcessing || isManualSyncing) return Loader2;
    if (queueStatus?.failed > 0) return AlertCircle;
    if (queueStatus?.pending > 0) return Clock;
    return CheckCircle;
  };

  const shouldShow = !isOnline || showOnlineStatus || (queueStatus?.total > 0);

  if (!shouldShow) return null;

  const StatusIcon = getStatusIcon();
  const positionClasses = position === 'top' ? 'top-4' : 'bottom-4';

  return (
    <div className={`fixed ${positionClasses} left-1/2 transform -translate-x-1/2 z-50`}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === 'top' ? -20 : 20 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          {/* Main Status Indicator */}
          <div
            className={`flex items-center px-4 py-2 rounded-full shadow-lg backdrop-blur-sm ${getStatusColor()} cursor-pointer`}
            onClick={() => setShowDetails(!showDetails)}
          >
            <StatusIcon 
              className={`w-4 h-4 text-white mr-2 ${
                (queueStatus?.isProcessing || isManualSyncing) ? 'animate-spin' : ''
              }`} 
            />
            <span className="text-white text-sm font-medium">
              {getStatusText()}
            </span>
            {queueStatus?.total > 0 && (
              <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs text-white">
                {queueStatus.total}
              </span>
            )}
          </div>

          {/* Detailed Status Panel */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: position === 'top' ? -10 : 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: position === 'top' ? -10 : 10 }}
                transition={{ duration: 0.2 }}
                className={`absolute ${position === 'top' ? 'top-12' : 'bottom-12'} left-1/2 transform -translate-x-1/2 
                  bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 min-w-64 border border-gray-200 dark:border-gray-700`}
              >
                <div className="space-y-3">
                  {/* Connection Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {isOnline ? (
                        <Wifi className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {isOnline ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>

                  {/* Queue Status */}
                  {queueStatus && (
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Database className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Sync Queue
                        </span>
                      </div>
                      
                      <div className="pl-6 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Pending:</span>
                          <span className="font-medium">{queueStatus.pending}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Failed:</span>
                          <span className="font-medium text-red-600">{queueStatus.failed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total:</span>
                          <span className="font-medium">{queueStatus.total}</span>
                        </div>
                      </div>

                      {/* Priority Breakdown */}
                      {queueStatus.priorityCount && (
                        <div className="pl-6 space-y-1 text-xs text-gray-500 dark:text-gray-500">
                          <div className="flex justify-between">
                            <span>High Priority:</span>
                            <span>{queueStatus.priorityCount.high}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Medium Priority:</span>
                            <span>{queueStatus.priorityCount.medium}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Low Priority:</span>
                            <span>{queueStatus.priorityCount.low}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    {isOnline && queueStatus?.pending > 0 && (
                      <button
                        onClick={handleManualSync}
                        disabled={isManualSyncing}
                        className="flex-1 flex items-center justify-center px-3 py-1.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        {isManualSyncing ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        ) : (
                          <RefreshCw className="w-3 h-3 mr-1" />
                        )}
                        Sync Now
                      </button>
                    )}
                    
                    {queueStatus?.failed > 0 && (
                      <>
                        <button
                          onClick={handleRetryFailed}
                          className="flex-1 flex items-center justify-center px-3 py-1.5 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 transition-colors"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Retry
                        </button>
                        <button
                          onClick={handleClearFailed}
                          className="flex-1 flex items-center justify-center px-3 py-1.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                        >
                          Clear Failed
                        </button>
                      </>
                    )}
                  </div>

                  {/* Status Information */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                    {queueStatus?.isProcessing && (
                      <div className="flex items-center">
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        Processing sync queue...
                      </div>
                    )}
                    {queueStatus?.oldestOperation && (
                      <div>
                        Oldest item: {new Date(queueStatus.oldestOperation).toLocaleString()}
                      </div>
                    )}
                    {!isOnline && (
                      <div className="text-yellow-600 dark:text-yellow-400">
                        Changes will sync when back online
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OfflineIndicator; 