import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Download, X, Clock, CheckCircle2, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { updateManager, type UpdateState } from '@/lib/updateManager';
import { useAuth } from '@/contexts/AuthContext';

export default function UpdatePrompt() {
  const { currentUser, loading } = useAuth();
  const [updateState, setUpdateState] = useState<UpdateState>({
    available: false,
    installing: false,
    ready: false,
    error: null
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    // Only initialize update manager when user is authenticated
    if (loading || !currentUser) return;

    // Initialize update manager
    updateManager.initialize();

    // Subscribe to update state changes
    const unsubscribe = updateManager.subscribe((state) => {
      setUpdateState(state);
      setShowUpdate(state.available || state.installing || state.ready || !!state.error);
    });

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      updateManager.destroy();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser, loading]);

  const handleUpdate = async () => {
    try {
      await updateManager.applyUpdate();
    } catch (error) {
      console.error('Update failed:', error);
      setUpdateState(prev => ({ 
        ...prev, 
        error: 'Update failed. Please try again or refresh the page manually.',
        installing: false 
      }));
    }
  };

  const handleDismiss = () => {
    updateManager.dismissUpdate();
    setShowUpdate(false);
  };

  const handleLater = () => {
    updateManager.dismissUpdate(30 * 60 * 1000); // Remind in 30 minutes
    setShowUpdate(false);
  };

  const handleRetry = () => {
    setUpdateState(prev => ({ ...prev, error: null }));
    updateManager.checkForUpdates();
  };

  const handleClearCache = async () => {
    try {
      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      
      // Unregister service worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      
      // Force reload
      window.location.href = window.location.href;
    } catch (error) {
      console.error('Cache clear failed:', error);
      window.location.reload();
    }
  };

  // Don't show update prompt on login screen or when not authenticated
  if (!showUpdate || !currentUser || loading) return null;

  const getIcon = () => {
    if (updateState.error) {
      return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
    }
    if (updateState.installing) {
      return <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />;
    }
    if (updateState.ready) {
      return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />;
    }
    if (updateState.available) {
      return <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    }
    return null;
  };

  const getTitle = () => {
    if (updateState.error) {
      return 'Update Error';
    }
    if (updateState.installing) {
      return 'Updating...';
    }
    if (updateState.ready) {
      return 'Update Complete';
    }
    if (updateState.available) {
      return 'Update Available';
    }
    return '';
  };

  const getMessage = () => {
    if (updateState.error) {
      return `${updateState.error}${!isOnline ? ' (You appear to be offline)' : ''}`;
    }
    if (updateState.installing) {
      return 'Applying update, please wait...';
    }
    if (updateState.ready) {
      return 'Update complete! The page will refresh shortly.';
    }
    if (updateState.available) {
      return 'A new version of DayFuse is available! Update when ready.';
    }
    return '';
  };

  const getBorderColor = () => {
    if (updateState.error) return 'border-red-200 dark:border-red-800';
    if (updateState.installing) return 'border-amber-200 dark:border-amber-800';
    if (updateState.ready) return 'border-green-200 dark:border-green-800';
    return 'border-blue-200 dark:border-blue-800';
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      <Card className={`shadow-lg transition-all duration-300 ${getBorderColor()}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              {getIcon()}
              <span>{getTitle()}</span>
              {!isOnline && (
                <WifiOff className="h-3 w-3 text-gray-400" />
              )}
            </div>
            
            {!updateState.installing && !updateState.ready && (
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Dismiss update notification"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {getMessage()}
          </p>
          
          {/* Network status indicator */}
          {!isOnline && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800">
              <WifiOff className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm text-amber-700 dark:text-amber-300">
                You're offline. Updates will be available when connected.
              </span>
            </div>
          )}
          
          {/* Available update actions */}
          {updateState.available && !updateState.installing && (
            <div className="flex gap-2">
              <Button 
                onClick={handleUpdate} 
                size="sm" 
                className="flex-1"
                disabled={!isOnline}
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Update Now
              </Button>
              <Button onClick={handleLater} variant="outline" size="sm">
                <Clock className="h-3 w-3 mr-1" />
                30min
              </Button>
            </div>
          )}
          
          {/* Error state actions */}
          {updateState.error && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button 
                  onClick={handleRetry} 
                  size="sm" 
                  variant="outline"
                  className="flex-1"
                  disabled={!isOnline}
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Retry
                </Button>
                <Button onClick={handleDismiss} variant="ghost" size="sm">
                  Dismiss
                </Button>
              </div>
              <Button 
                onClick={handleClearCache}
                size="sm"
                variant="destructive"
                className="w-full text-xs"
              >
                Clear Cache & Force Refresh
              </Button>
            </div>
          )}
          
          {/* Installing state */}
          {updateState.installing && (
            <div className="flex items-center justify-center py-2">
              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent" />
                Applying update, please wait...
              </div>
            </div>
          )}
          
          {/* Ready state */}
          {updateState.ready && (
            <div className="flex items-center justify-center py-2">
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                Update complete! Refreshing shortly...
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}