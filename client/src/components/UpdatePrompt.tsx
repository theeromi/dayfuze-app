import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Download, X } from 'lucide-react';

export default function UpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    // Only register service worker in production
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SW_UPDATED') {
          setUpdateMessage(event.data.message);
          setShowUpdate(true);
        }
      });

      // Check for updates every 30 minutes
      const checkForUpdates = () => {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.update();
          });
        });
      };

      const updateInterval = setInterval(checkForUpdates, 30 * 60 * 1000); // 30 minutes
      
      // Check immediately
      checkForUpdates();

      return () => clearInterval(updateInterval);
    }
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowUpdate(false);
    // Show again in 1 hour if not updated
    setTimeout(() => setShowUpdate(true), 60 * 60 * 1000);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      <Card className="border-blue-200 dark:border-blue-800 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Update Available
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {updateMessage}
          </p>
          <div className="flex gap-2">
            <Button onClick={handleUpdate} size="sm" className="flex-1">
              <RefreshCw className="h-3 w-3 mr-2" />
              Update Now
            </Button>
            <Button onClick={handleDismiss} variant="outline" size="sm">
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}