import { useState, useEffect } from 'react';

export interface OnlineStatus {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnline: Date | null;
  lastOffline: Date | null;
}

export const useOnlineStatus = (): OnlineStatus => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [lastOnline, setLastOnline] = useState<Date | null>(null);
  const [lastOffline, setLastOffline] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnline(new Date());
      if (wasOffline) {
        // User has come back online after being offline
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setLastOffline(new Date());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return {
    isOnline,
    wasOffline,
    lastOnline,
    lastOffline,
  };
};

export default useOnlineStatus; 