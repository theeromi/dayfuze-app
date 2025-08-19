import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useLocation } from 'wouter';
import { Loader2, Bell } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      await handleAuth(email, password, isLogin);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-day-blue via-primary to-fuse-orange p-4">
      <Card className="w-full max-w-md shadow-2xl">
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
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-password"
              />
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
              className="w-full bg-day-blue hover:bg-day-blue/90"
              disabled={loading}
              data-testid="button-submit"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
            
            <Button
              type="button"
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full"
              data-testid="button-toggle-auth"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}