import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

const motivationalQuotes = [
  "Every small step forward is progress worth celebrating!",
  "You just turned intention into action. Well done!",
  "Another task conquered. You're building momentum!",
  "Progress, not perfection. You're doing great!",
  "That's how you get things done. Keep it up!",
  "Small wins lead to big victories. Nice work!",
  "You're closer to your goals with each completed task.",
  "Productivity looks good on you!",
  "One task at a time, one win at a time.",
  "You're writing your success story, one task at a time.",
  "Achievement unlocked! You're on fire!",
  "This is what dedication looks like. Incredible work!",
  "Your persistence is paying off in amazing ways.",
  "You're on a roll! This streak is pure motivation.",
  "Building habits like a pro. Keep it up!"
];

interface MotivationalQuoteProps {
  show: boolean;
  onHide: () => void;
}

export function MotivationalQuote({ show, onHide }: MotivationalQuoteProps) {
  const [currentQuote, setCurrentQuote] = useState('');

  useEffect(() => {
    if (show) {
      const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      setCurrentQuote(randomQuote);

      const timer = setTimeout(() => {
        onHide();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!show) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-80 p-4 bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-400 rounded-lg shadow-lg transition-all duration-300 ${
      show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      <div className="flex items-start gap-3">
        <Star className="text-yellow-500 mt-1 flex-shrink-0" size={20} fill="currentColor" />
        <p className="text-sm font-medium text-gray-900 leading-relaxed">
          {currentQuote}
        </p>
      </div>
    </div>
  );
}