import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from './button';
import { User, Menu, Home, CheckSquare, Calendar, Settings } from 'lucide-react';

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
          <nav className="flex items-center space-x-1">
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
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              );
            })}
          </nav>
        )}

        <div className="flex items-center space-x-4">
          {currentUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-2 text-gray-600 hover:text-day-blue"
              data-testid="button-user-profile"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline text-sm">
                {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
              </span>
            </Button>
          )}
        </div>
      </div>


    </header>
  );
}