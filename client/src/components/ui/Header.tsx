import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { User, Menu, Home, CheckSquare, Calendar, Timeline, Settings } from 'lucide-react';

export default function Header() {
  const { currentUser } = useAuth();
  const [, navigate] = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/timeline', label: 'Timeline', icon: Calendar },
    { path: '/profile', label: 'Profile', icon: Settings },
  ];

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
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
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-day-blue"
                  data-testid={`button-nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </nav>
        )}

        <div className="flex items-center space-x-4">
          {currentUser && (
            <>
              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600"
                  data-testid="button-mobile-menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <User className="h-6 w-6 text-gray-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile navigation - shown when menu is open */}
      {currentUser && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 mt-3 pt-3">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className="justify-start flex items-center space-x-2 text-gray-600 hover:text-day-blue"
                  data-testid={`button-mobile-nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}