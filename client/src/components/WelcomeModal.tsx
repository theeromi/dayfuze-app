import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTutorial } from '@/contexts/TutorialContext';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, BookOpen, X, CheckCircle2, ArrowRight, Star } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const { startTutorial } = useTutorial();
  const { currentUser } = useAuth();
  const [selectedOption, setSelectedOption] = useState<'tutorial' | 'explore' | null>(null);

  const handleStartTutorial = () => {
    startTutorial();
    onClose();
  };

  const handleExploreAlone = () => {
    // Mark that user has seen welcome but chose to explore alone
    localStorage.setItem('dayfuse-welcome-seen', 'true');
    localStorage.setItem('dayfuse-tutorial-skipped', 'true');
    onClose();
  };

  const getUserName = () => {
    if (currentUser?.displayName) return currentUser.displayName.split(' ')[0];
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return 'there';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 p-8">
          <DialogHeader className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-500 p-3 rounded-full">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <DialogTitle className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome to DayFuse, {getUserName()}!
            </DialogTitle>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
              Your new productivity companion is ready to help you manage tasks efficiently.
            </p>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                selectedOption === 'tutorial' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => setSelectedOption('tutorial')}
            >
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">Take the Tour</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Get a guided walkthrough of DayFuse features and learn how to maximize your productivity.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-blue-500" />
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Recommended</span>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                selectedOption === 'explore' 
                  ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => setSelectedOption('explore')}
            >
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">Explore on My Own</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Jump right in and discover DayFuse features at your own pace. You can always access help later.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium">Quick Start</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {selectedOption === 'tutorial' ? (
              <Button 
                onClick={handleStartTutorial}
                size="lg"
                className="bg-blue-500 hover:bg-blue-600 text-white px-8"
                data-testid="button-start-tutorial"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Start Interactive Tour
              </Button>
            ) : selectedOption === 'explore' ? (
              <Button 
                onClick={handleExploreAlone}
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white px-8"
                data-testid="button-explore-alone"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Let's Go!
              </Button>
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">
                Please select an option above to continue
              </p>
            )}
            
            <Button 
              onClick={onClose}
              variant="ghost"
              size="lg"
              className="text-gray-500"
              data-testid="button-maybe-later"
            >
              <X className="h-4 w-4 mr-2" />
              Maybe Later
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              You can start the tutorial anytime from your Profile → Help & Tutorial
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}