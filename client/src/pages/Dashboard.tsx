import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTask } from '@/contexts/TaskContext';
import { useLocation } from 'wouter';
import { WelcomeMessageGenerator, WelcomeMessage } from '@/lib/welcomeMessage';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import TaskSummary from '@/components/ui/TaskSummary';
import SearchBar from '@/components/ui/SearchBar';
import TodaysTasksHorizontal from '@/components/ui/TodaysTasksHorizontal';
import AddTaskModal from '@/components/AddTaskModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, CheckSquare, Clock, List } from 'lucide-react';

export default function Dashboard() {
  const { currentUser, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading } = useTask();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState<WelcomeMessage | null>(null);
  const [loadingWelcome, setLoadingWelcome] = useState(true);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, authLoading, navigate]);

  // Generate personalized welcome message
  useEffect(() => {
    const generateWelcomeMessage = async () => {
      if (currentUser && !authLoading) {
        setLoadingWelcome(true);
        try {
          const message = await WelcomeMessageGenerator.generateWelcomeMessage(
            currentUser.uid,
            currentUser.displayName || undefined
          );
          setWelcomeMessage(message);
        } catch (error) {
          console.error('Error generating welcome message:', error);
          // Fallback message
          setWelcomeMessage({
            greeting: `Good day, ${currentUser.displayName || 'there'}!`,
            message: "Ready to make today productive? Let's get started! 🚀",
            timeBasedGreeting: "Good day",
            joinMessage: "Welcome to DayFuse! Let's organize your day! 📅"
          });
        } finally {
          setLoadingWelcome(false);
        }
      }
    };

    generateWelcomeMessage();
  }, [currentUser, authLoading]);

  if (authLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-day-blue mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background" data-testid="page-dashboard">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Personalized Welcome Section */}
        <div className="space-y-4">
          {loadingWelcome ? (
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
            </div>
          ) : welcomeMessage ? (
            <>
              <div className="space-y-2">
                <h2 className="text-lg text-muted-foreground">{welcomeMessage.timeBasedGreeting.split(' ')[0]},</h2>
                <h1 className="text-4xl font-bold text-foreground" data-testid="text-welcome">
                  {currentUser?.displayName?.split(' ')[0] || 'there'}!
                </h1>
                <p className="text-lg text-muted-foreground">
                  {welcomeMessage.message}
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800 max-w-2xl">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {welcomeMessage.joinMessage}
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <h2 className="text-lg text-muted-foreground">Good day,</h2>
              <h1 className="text-4xl font-bold text-foreground" data-testid="text-welcome">
                {displayName}!
              </h1>
            </div>
          )}
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            onClick={() => navigate('/tasks')}
            data-testid="card-tasks"
          >
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
              <List className="h-8 w-8 text-day-blue" />
              <span className="font-medium">Tasks</span>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
            onClick={() => navigate('/timeline')}
            data-testid="card-timeline"
          >
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
              <Clock className="h-8 w-8 text-fuse-orange" />
              <span className="font-medium">Timeline</span>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-105">
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
              <CheckSquare className="h-8 w-8 text-accent-green" />
              <span className="font-medium">Completed</span>
              <span className="text-sm text-muted-foreground">
                {tasks.filter(t => t.completed).length}
              </span>
            </CardContent>
          </Card>

          <AddTaskModal 
            trigger={
              <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-105">
                <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                  <PlusCircle className="h-8 w-8 text-accent-red" />
                  <span className="font-medium">Add Task</span>
                </CardContent>
              </Card>
            }
          />
        </div>

        {/* Task Summary */}
        <TaskSummary />

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search your tasks..."
        />

        {/* Today's Tasks */}
        <TodaysTasksHorizontal 
          tasks={tasks}
          onTaskClick={(task) => navigate('/tasks')}
        />

        {/* Quick Actions */}
        <div className="flex justify-center pt-8">
          <Button 
            size="lg"
            className="bg-day-blue hover:bg-day-blue/90 text-white px-8"
            onClick={() => navigate('/tasks')}
            data-testid="button-view-all-tasks"
          >
            View All Tasks
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}