import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from './button';
import { User, Menu, Home, CheckSquare, Calendar, Settings } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Header() {
  const { currentUser } = useAuth();
  const [, navigate] = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/timeline', label: 'Timeline', icon: Calendar },
  ];

  return (
    <header className="bg-background border-b border-border px-4 py-3" data-testid="nav-header">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-2xl font-bold p-0 hover:bg-transparent"
            data-testid="button-home"
          >
            <span className="text-day-blue">Day</span>
            <span className="text-fuse-orange">Fuse</span>
          </Button>
        </div>

        {currentUser && (
          <nav className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className="flex items-center space-x-2 text-muted-foreground hover:text-day-blue"
                  data-testid={`button-nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              );
            })}
          </nav>
        )}

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          {currentUser && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigate('/profile');
                  // Scroll to settings section after navigation
                  setTimeout(() => {
                    const settingsSection = document.querySelector('[data-section="app-settings"]');
                    if (settingsSection) {
                      settingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }}
                className="flex items-center space-x-2 text-gray-600 hover:text-day-blue dark:text-gray-300 dark:hover:text-day-blue"
                data-testid="button-settings"
                title="App Settings"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Settings</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 text-gray-600 hover:text-day-blue dark:text-gray-300 dark:hover:text-day-blue"
                data-testid="button-user-profile"
                title="Profile"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:inline text-sm">
                  {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                </span>
              </Button>
            </>
          )}
        </div>
      </div>


    </header>
  );
}