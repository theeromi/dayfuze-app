import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { useLocation } from 'wouter';
import { Loader2, Bell, Eye, EyeOff } from 'lucide-react';
import Footer from '../components/ui/Footer';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { currentUser, handleAuth } = useAuth();
  const { notificationsEnabled, requestPermission } = useNotification();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await handleAuth(email, password, isLogin, name);
      // Request notification permission after successful login
      if (!notificationsEnabled) {
        await requestPermission();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-day-blue via-primary to-fuse-orange relative overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-fuse-orange rounded-full animate-bounce"></div>
        <div className="absolute top-3/4 left-1/2 w-32 h-32 bg-white rounded-full animate-pulse delay-1000"></div>
      </div>
      
      <Card className="w-full max-w-md shadow-2xl backdrop-blur-sm bg-white/95 border-0 relative z-10 transform hover:scale-105 transition-transform duration-300">
        <CardHeader className="text-center space-y-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-day-blue">Day</span>
              <span className="text-fuse-orange">Fuse</span>
            </h1>
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription>
              Your productivity companion
            </CardDescription>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
            
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  required={!isLogin}
                  className="transition-all duration-200 focus:ring-2 focus:ring-day-blue"
                  data-testid="input-name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-day-blue"
                data-testid="input-email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required
                  className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-day-blue"
                  data-testid="input-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent active:scale-90 transition-all duration-150"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-day-blue transition-colors" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-day-blue transition-colors" />
                  )}
                </Button>
              </div>
            </div>

            {!notificationsEnabled && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
                <Bell className="h-4 w-4" />
                <span>Enable notifications to get task reminders</span>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white active:scale-95 transition-all duration-200 h-12 text-lg font-semibold shadow-lg"
              disabled={loading}
              data-testid="button-submit"
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : null}
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setName('');
                setEmail('');
                setPassword('');
              }}
              className="w-full text-blue-600 border-blue-600 hover:bg-blue-50 active:scale-95 transition-all duration-200 h-12 text-base font-medium"
              data-testid="button-toggle-auth"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      </div>
      
      <Footer className="bg-transparent border-t-0" />
    </div>
  );
}