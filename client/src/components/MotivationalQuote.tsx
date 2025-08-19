import { useState, useEffect } from "react";
import { Sparkles, Star, Zap, Trophy } from "lucide-react";

export interface MotivationalQuote {
  text: string;
  author?: string;
  category: 'completion' | 'encouragement' | 'milestone' | 'streak';
}

const motivationalQuotes: MotivationalQuote[] = [
  // Task completion quotes
  { text: "Every small step forward is progress worth celebrating!", category: 'completion' },
  { text: "You just turned intention into action. Well done!", category: 'completion' },
  { text: "Another task conquered. You're building momentum!", category: 'completion' },
  { text: "Progress, not perfection. You're doing great!", category: 'completion' },
  { text: "That's how you get things done. Keep it up!", category: 'completion' },
  { text: "Small wins lead to big victories. Nice work!", category: 'completion' },
  { text: "You're closer to your goals with each completed task.", category: 'completion' },
  { text: "Productivity looks good on you!", category: 'completion' },
  { text: "One task at a time, one win at a time.", category: 'completion' },
  { text: "You're writing your success story, one task at a time.", category: 'completion' },
  
  // Encouragement quotes
  { text: "You've got this! Every expert was once a beginner.", category: 'encouragement' },
  { text: "The hardest part is starting. You're already ahead!", category: 'encouragement' },
  { text: "Your future self will thank you for this effort.", category: 'encouragement' },
  { text: "Rome wasn't built in a day, but they were laying bricks every hour.", category: 'encouragement' },
  { text: "Consistency is your superpower. Keep going!", category: 'encouragement' },
  { text: "You're stronger than you think and more capable than you know.", category: 'encouragement' },
  { text: "Every challenge is an opportunity in disguise.", category: 'encouragement' },
  { text: "You're not behind – you're preparing for something great.", category: 'encouragement' },
  
  // Milestone quotes
  { text: "Look at you, crushing goals like a champion!", category: 'milestone' },
  { text: "This is what dedication looks like. Incredible work!", category: 'milestone' },
  { text: "You've reached another milestone. Your commitment is inspiring!", category: 'milestone' },
  { text: "Achievement unlocked! You're on fire!", category: 'milestone' },
  { text: "Your persistence is paying off in amazing ways.", category: 'milestone' },
  { text: "This level of productivity is extraordinary. Keep soaring!", category: 'milestone' },
  
  // Streak quotes
  { text: "You're on a roll! This streak is pure motivation.", category: 'streak' },
  { text: "Consistency champion alert! Your streak is impressive.", category: 'streak' },
  { text: "This momentum is unstoppable. Keep the streak alive!", category: 'streak' },
  { text: "Building habits like a pro. Your streak proves it!", category: 'streak' },
  { text: "Day after day, you show up. That's true strength.", category: 'streak' },
];

interface MotivationalQuoteProps {
  category: MotivationalQuote['category'];
  onClose?: () => void;
  autoHide?: boolean;
  duration?: number;
}

export function MotivationalQuote({ 
  category, 
  onClose, 
  autoHide = true, 
  duration = 3000 
}: MotivationalQuoteProps) {
  const [quote, setQuote] = useState<MotivationalQuote | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Get a random quote from the specified category
    const categoryQuotes = motivationalQuotes.filter(q => q.category === category);
    const randomQuote = categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)];
    
    setQuote(randomQuote);
    setIsVisible(true);

    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // Allow time for fade out
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [category, autoHide, duration, onClose]);

  if (!quote) return null;

  const getIcon = () => {
    switch (category) {
      case 'completion':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'milestone':
        return <Trophy className="w-5 h-5 text-yellow-600" />;
      case 'streak':
        return <Star className="w-5 h-5 text-purple-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (category) {
      case 'completion':
        return 'from-green-50 to-emerald-50 border-green-200';
      case 'milestone':
        return 'from-yellow-50 to-amber-50 border-yellow-200';
      case 'streak':
        return 'from-purple-50 to-pink-50 border-purple-200';
      default:
        return 'from-blue-50 to-cyan-50 border-blue-200';
    }
  };

  return (
    <div 
      className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg border-2 bg-gradient-to-br shadow-lg transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      } ${getBgColor()}`}
      data-testid="motivational-quote"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800 leading-snug">
            {quote.text}
          </p>
          {quote.author && (
            <p className="text-xs text-gray-600 mt-2 italic">
              — {quote.author}
            </p>
          )}
        </div>
        {!autoHide && onClose && (
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            data-testid="button-close-quote"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

// Hook for managing motivational quotes
export function useMotivationalQuote() {
  const [currentQuote, setCurrentQuote] = useState<{
    category: MotivationalQuote['category'];
    show: boolean;
  } | null>(null);

  const showQuote = (category: MotivationalQuote['category']) => {
    setCurrentQuote({ category, show: true });
  };

  const hideQuote = () => {
    setCurrentQuote(null);
  };

  return {
    currentQuote,
    showQuote,
    hideQuote,
  };
}