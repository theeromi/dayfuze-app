import { useEffect, useState } from "react";
import { CheckCircle, Sparkles, Star } from "lucide-react";

interface TaskCompletionCelebrationProps {
  show: boolean;
  taskTitle: string;
  onComplete: () => void;
}

export function TaskCompletionCelebration({ show, taskTitle, onComplete }: TaskCompletionCelebrationProps) {
  const [stage, setStage] = useState<'enter' | 'celebrate' | 'exit'>('enter');

  useEffect(() => {
    if (!show) return;

    const timer1 = setTimeout(() => setStage('celebrate'), 100);
    const timer2 = setTimeout(() => setStage('exit'), 2000);
    const timer3 = setTimeout(() => onComplete(), 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Backdrop with subtle animation */}
      <div 
        className={`absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 transition-opacity duration-500 ${
          stage === 'celebrate' ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {/* Main celebration card */}
      <div 
        className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border-2 border-green-500 transition-all duration-500 ${
          stage === 'enter' ? 'scale-50 opacity-0' : 
          stage === 'celebrate' ? 'scale-100 opacity-100' : 
          'scale-110 opacity-0'
        }`}
      >
        {/* Confetti particles */}
        {stage === 'celebrate' && (
          <>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-3 h-3 rounded-full animate-confetti-${i % 4 + 1}`}
                style={{
                  background: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][i % 4],
                  left: `${20 + (i * 10)}%`,
                  top: `${10 + (i * 5)}%`,
                }}
              />
            ))}
          </>
        )}

        {/* Success icon with pulse animation */}
        <div className="text-center mb-4">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 transition-transform duration-300 ${
            stage === 'celebrate' ? 'animate-pulse scale-110' : ''
          }`}>
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {/* Success message */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500 animate-spin" />
            Task Complete!
            <Star className="w-6 h-6 text-yellow-500 animate-bounce" />
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-xs">
            "{taskTitle}" has been completed
          </p>
          <div className="text-4xl animate-bounce">🎉</div>
        </div>

        {/* Progress bar animation */}
        <div className="mt-6 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000 ease-out ${
              stage === 'celebrate' ? 'w-full' : 'w-0'
            }`}
          />
        </div>
      </div>
    </div>
  );
}