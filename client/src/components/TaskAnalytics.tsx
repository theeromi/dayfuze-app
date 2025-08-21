import React, { useMemo } from 'react';
import { useTask } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  Target,
  CheckCircle2,
  Circle,
  AlertCircle,
} from 'lucide-react';
import { isToday, startOfWeek, endOfWeek } from 'date-fns';

interface TaskAnalyticsProps {
  className?: string;
}

interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  highPriority: number;
  completionRate: number;
  productivityScore: number;
}

export default function TaskAnalytics({ className }: TaskAnalyticsProps) {
  const { tasks } = useTask();

  const stats: TaskStats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'progress').length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    
    const overdue = tasks.filter(task => {
      if (task.status === 'done') return false;
      const dueDate = task.dueDate.toDate();
      if (task.dueTime) {
        const [hours, minutes] = task.dueTime.split(':').map(Number);
        dueDate.setHours(hours, minutes);
      }
      return dueDate < now;
    }).length;

    const dueToday = tasks.filter(task => {
      if (task.status === 'done') return false;
      return isToday(task.dueDate.toDate());
    }).length;

    const dueThisWeek = tasks.filter(task => {
      if (task.status === 'done') return false;
      const dueDate = task.dueDate.toDate();
      return dueDate >= weekStart && dueDate <= weekEnd;
    }).length;

    const highPriority = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Productivity score based on completion rate, overdue tasks, and priority handling
    let productivityScore = completionRate;
    if (overdue > 0) productivityScore -= Math.min(30, overdue * 5);
    if (highPriority === 0 && tasks.filter(t => t.priority === 'high').length > 0) {
      productivityScore += 10; // Bonus for handling all high priority tasks
    }
    productivityScore = Math.max(0, Math.min(100, productivityScore));

    return {
      total,
      completed,
      inProgress,
      todo,
      overdue,
      dueToday,
      dueThisWeek,
      highPriority,
      completionRate,
      productivityScore,
    };
  }, [tasks]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { text: 'Excellent', variant: 'default' as const };
    if (score >= 80) return { text: 'Great', variant: 'secondary' as const };
    if (score >= 60) return { text: 'Good', variant: 'outline' as const };
    return { text: 'Needs Focus', variant: 'destructive' as const };
  };

  if (stats.total === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Task Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No tasks yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first task to see analytics
          </p>
        </CardContent>
      </Card>
    );
  }

  const scoreBadge = getScoreBadge(stats.productivityScore);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Task Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Productivity Score */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Productivity Score</span>
          </div>
          <div className={`text-3xl font-bold ${getScoreColor(stats.productivityScore)}`}>
            {stats.productivityScore}%
          </div>
          <Badge variant={scoreBadge.variant}>{scoreBadge.text}</Badge>
        </div>

        {/* Progress Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Completion Rate</span>
            <span className="font-medium">{stats.completionRate}%</span>
          </div>
          <Progress value={stats.completionRate} className="h-2" />
          <div className="text-xs text-muted-foreground text-center">
            {stats.completed} of {stats.total} tasks completed
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium">Done</span>
            </div>
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {stats.completed}
            </div>
          </div>
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-xs font-medium">Progress</span>
            </div>
            <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
              {stats.inProgress}
            </div>
          </div>
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Circle className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium">Todo</span>
            </div>
            <div className="text-lg font-semibold text-muted-foreground">
              {stats.todo}
            </div>
          </div>
        </div>

        {/* Important Metrics */}
        <div className="space-y-2 pt-2 border-t border-border">
          {stats.overdue > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <AlertCircle className="h-3 w-3" />
                <span>Overdue Tasks</span>
              </div>
              <Badge variant="destructive" className="text-xs">
                {stats.overdue}
              </Badge>
            </div>
          )}
          
          {stats.dueToday > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <Calendar className="h-3 w-3" />
                <span>Due Today</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {stats.dueToday}
              </Badge>
            </div>
          )}

          {stats.highPriority > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <Target className="h-3 w-3" />
                <span>High Priority</span>
              </div>
              <Badge variant="outline" className="text-xs border-orange-200">
                {stats.highPriority}
              </Badge>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>This Week</span>
            <span>{stats.dueThisWeek} due</span>
          </div>
        </div>

        {/* Tips */}
        {stats.productivityScore < 70 && (
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-xs font-medium mb-1">💡 Productivity Tip:</p>
            <p className="text-xs text-muted-foreground">
              {stats.overdue > 0
                ? 'Focus on completing overdue tasks to boost your score.'
                : stats.highPriority > 0
                ? 'Prioritize high-importance tasks for better productivity.'
                : 'Try to complete more tasks to improve your completion rate.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}