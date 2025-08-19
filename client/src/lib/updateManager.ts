/**
 * Graceful Background Update Manager
 * 
 * Handles PWA updates with user-friendly notifications and background processing
 */

export interface UpdateState {
  available: boolean;
  installing: boolean;
  ready: boolean;
  error: string | null;
}

export interface UpdateManagerConfig {
  checkInterval: number; // milliseconds
  showNotificationDelay: number; // milliseconds
  autoCheckOnFocus: boolean;
  maxRetries: number;
}

export class UpdateManager {
  private config: UpdateManagerConfig;
  private registration: ServiceWorkerRegistration | null = null;
  private state: UpdateState = {
    available: false,
    installing: false,
    ready: false,
    error: null,
  };
  private listeners: Array<(state: UpdateState) => void> = [];
  private checkInterval: number | null = null;
  private retryCount = 0;

  constructor(config: Partial<UpdateManagerConfig> = {}) {
    this.config = {
      checkInterval: 15 * 60 * 1000, // 15 minutes
      showNotificationDelay: 5000, // 5 seconds
      autoCheckOnFocus: true,
      maxRetries: 3,
      ...config,
    };
  }

  /**
   * Initialize the update manager
   */
  async initialize(): Promise<void> {
    if (!('serviceWorker' in navigator) || process.env.NODE_ENV !== 'production') {
      console.log('UpdateManager: Service Worker not available or not in production');
      return;
    }

    try {
      // Wait for service worker to be ready
      this.registration = await navigator.serviceWorker.ready;
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Start periodic checks
      this.startPeriodicChecks();
      
      // Check for updates immediately
      this.checkForUpdates();
      
      console.log('UpdateManager: Initialized successfully');
    } catch (error) {
      this.updateState({ error: `Failed to initialize: ${error}` });
      console.error('UpdateManager: Initialization failed', error);
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: UpdateState) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get current update state
   */
  getState(): UpdateState {
    return { ...this.state };
  }

  /**
   * Manually check for updates
   */
  async checkForUpdates(): Promise<void> {
    if (!this.registration) return;

    try {
      console.log('UpdateManager: Checking for updates...');
      await this.registration.update();
      this.retryCount = 0; // Reset retry count on successful check
    } catch (error) {
      this.retryCount++;
      const errorMessage = `Update check failed (attempt ${this.retryCount}/${this.config.maxRetries})`;
      
      if (this.retryCount >= this.config.maxRetries) {
        this.updateState({ error: errorMessage });
      }
      
      console.warn('UpdateManager:', errorMessage, error);
    }
  }

  /**
   * Apply pending update
   */
  async applyUpdate(): Promise<void> {
    if (!this.registration?.waiting) {
      console.warn('UpdateManager: No update waiting to apply');
      return;
    }

    try {
      this.updateState({ installing: true, error: null });
      
      // Tell the waiting service worker to skip waiting
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Set up controller change listener
      const handleControllerChange = () => {
        console.log('UpdateManager: New service worker took control');
        this.updateState({ ready: true, installing: false });
        
        // Auto-refresh after a short delay for better UX
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
      
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      
    } catch (error) {
      this.updateState({ 
        installing: false, 
        error: `Failed to apply update: ${error}` 
      });
      console.error('UpdateManager: Failed to apply update', error);
    }
  }

  /**
   * Dismiss current update notification
   */
  dismissUpdate(remindIn?: number): void {
    this.updateState({ available: false });
    
    if (remindIn && remindIn > 0) {
      setTimeout(() => {
        if (this.registration?.waiting) {
          this.updateState({ available: true });
        }
      }, remindIn);
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    this.listeners = [];
    
    if (this.config.autoCheckOnFocus) {
      window.removeEventListener('focus', this.handleWindowFocus);
    }
  }

  private setupEventListeners(): void {
    if (!this.registration) return;

    // Listen for new service worker installations
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration!.installing;
      if (!newWorker) return;

      console.log('UpdateManager: New service worker installing');
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version is ready but waiting
          console.log('UpdateManager: New version ready, showing notification');
          
          setTimeout(() => {
            this.updateState({ available: true, error: null });
          }, this.config.showNotificationDelay);
        }
      });
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SW_UPDATE_AVAILABLE') {
        this.updateState({ available: true, error: null });
      } else if (event.data?.type === 'SW_UPDATING') {
        this.updateState({ installing: true });
      } else if (event.data?.type === 'SW_UPDATED') {
        this.updateState({ ready: true, installing: false });
      }
    });

    // Auto-check on window focus (user returned to app)
    if (this.config.autoCheckOnFocus) {
      window.addEventListener('focus', this.handleWindowFocus);
    }
  }

  private handleWindowFocus = (): void => {
    // Debounce focus events
    clearTimeout(this.checkInterval || 0);
    this.checkInterval = window.setTimeout(() => {
      this.checkForUpdates();
    }, 1000);
  };

  private startPeriodicChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    this.checkInterval = window.setInterval(() => {
      this.checkForUpdates();
    }, this.config.checkInterval);
  }

  private updateState(partialState: Partial<UpdateState>): void {
    this.state = { ...this.state, ...partialState };
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        console.error('UpdateManager: Listener error', error);
      }
    });
  }
}

// Global update manager instance
export const updateManager = new UpdateManager({
  checkInterval: 15 * 60 * 1000, // Check every 15 minutes
  showNotificationDelay: 3000, // Wait 3 seconds before showing notification
  autoCheckOnFocus: true, // Check when user returns to app
  maxRetries: 3, // Max retry attempts for failed checks
});