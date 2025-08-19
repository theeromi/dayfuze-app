import { useEffect, useState } from "react";
import { Trophy, Crown, Flame, Star } from "lucide-react";
import { useCelebration, CelebrationType } from "@/contexts/CelebrationContext";

export function MilestoneCelebration() {
  const { currentCelebration, closeCelebration, showMilestoneCelebration } = useCelebration();
  const [stage, setStage] = useState<'enter' | 'celebrate' | 'exit'>('enter');

  useEffect(() => {
    if (!currentCelebration) return;

    const timer1 = setTimeout(() => setStage('celebrate'), 100);
    const timer2 = setTimeout(() => setStage('exit'), 3000);
    const timer3 = setTimeout(() => closeCelebration(), 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [currentCelebration, closeCelebration]);

  // Listen for milestone events from TaskContext
  useEffect(() => {
    const handleMilestone = (event: CustomEvent) => {
      showMilestoneCelebration(event.detail.count);
    };

    window.addEventListener('milestone-reached', handleMilestone as EventListener);
    return () => window.removeEventListener('milestone-reached', handleMilestone as EventListener);
  }, [showMilestoneCelebration]);

  if (!currentCelebration) return null;

  const getIcon = (celebration: CelebrationType) => {
    if (celebration.type === 'streak') {
      return <Flame className="w-16 h-16 text-orange-500" />;
    }
    
    // Milestone icons based on count
    if (celebration.count >= 100) return <Crown className="w-16 h-16 text-purple-500" />;
    if (celebration.count >= 25) return <Trophy className="w-16 h-16 text-yellow-500" />;
    if (celebration.count >= 10) return <Star className="w-16 h-16 text-blue-500" />;
    return <Trophy className="w-16 h-16 text-green-500" />;
  };

  const getBackgroundGradient = (celebration: CelebrationType) => {
    if (celebration.type === 'streak') {
      return 'from-orange-500/20 via-red-500/20 to-yellow-500/20';
    }
    
    if (celebration.count >= 100) return 'from-purple-500/20 via-pink-500/20 to-purple-500/20';
    if (celebration.count >= 25) return 'from-yellow-500/20 via-orange-500/20 to-yellow-500/20';
    if (celebration.count >= 10) return 'from-blue-500/20 via-cyan-500/20 to-blue-500/20';
    return 'from-green-500/20 via-emerald-500/20 to-teal-500/20';
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Enhanced backdrop with gradient animation */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${getBackgroundGradient(currentCelebration)} transition-opacity duration-700 ${
          stage === 'celebrate' ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {/* Multiple confetti layers */}
      {stage === 'celebrate' && (
        <>
          {[...Array(12)].map((_, i) => (
            <div
              key={`confetti-${i}`}
              className={`absolute w-4 h-4 rounded-full animate-confetti-${(i % 4) + 1}`}
              style={{
                background: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][i % 6],
                left: `${10 + (i * 7)}%`,
                top: `${5 + (i * 8)}%`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </>
      )}

      {/* Main celebration card with enhanced styling */}
      <div 
        className={`relative bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-2xl border-4 border-gradient-to-r ${
          currentCelebration.type === 'streak' ? 'border-orange-500' : 'border-yellow-500'
        } transition-all duration-700 ${
          stage === 'enter' ? 'scale-50 opacity-0 rotate-12' : 
          stage === 'celebrate' ? 'scale-100 opacity-100 rotate-0' : 
          'scale-120 opacity-0 rotate-6'
        }`}
      >
        {/* Animated icon container */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-white to-gray-100 dark:from-gray-700 dark:to-gray-800 shadow-inner transition-transform duration-500 ${
            stage === 'celebrate' ? 'animate-bounce scale-110' : ''
          }`}>
            {getIcon(currentCelebration)}
          </div>
        </div>

        {/* Enhanced success message */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            {currentCelebration.type === 'streak' ? '🔥 Streak!' : '🏆 Milestone!'}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-sm">
            {currentCelebration.message}
          </p>
          
          {/* Number display */}
          <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
            {currentCelebration.count}
          </div>
          
          {/* Animated emojis */}
          <div className="flex justify-center space-x-2 text-3xl">
            <span className="animate-bounce" style={{ animationDelay: '0s' }}>🎉</span>
            <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>✨</span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🎊</span>
          </div>
        </div>

        {/* Enhanced progress visualization */}
        <div className="mt-8 space-y-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r transition-all duration-2000 ease-out ${
                currentCelebration.type === 'streak' 
                  ? 'from-orange-500 to-red-500' 
                  : 'from-green-500 to-emerald-500'
              } ${stage === 'celebrate' ? 'w-full' : 'w-0'}`}
            />
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Keep up the amazing work!
          </p>
        </div>
      </div>
    </div>
  );
}