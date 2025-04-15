import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkStatus {
  isConnected: boolean;
  connectionType?: string | null;
  isInternetReachable?: boolean | null;
}

export const useNetworkStatus = (): NetworkStatus => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    connectionType: null,
    isInternetReachable: true,
  });

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setNetworkStatus({
        isConnected: state.isConnected !== null ? state.isConnected : true,
        connectionType: state.type,
        isInternetReachable: state.isInternetReachable,
      });
    });

    // Fetch initial network state
    NetInfo.fetch().then((state: NetInfoState) => {
      setNetworkStatus({
        isConnected: state.isConnected !== null ? state.isConnected : true,
        connectionType: state.type,
        isInternetReachable: state.isInternetReachable,
      });
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return networkStatus;
}; 