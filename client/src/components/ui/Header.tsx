import { Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [location, navigate] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-black">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <Button variant="ghost" size="icon" onClick={onMenuClick}>
              <Menu className="h-6 w-6" />
            </Button>
          )}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">
              <span className="text-day-blue">Day</span>
              <span className="text-fuse-orange">Fuse</span>
            </h1>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/profile')}
          className="rounded-full"
        >
          <User className="h-6 w-6" />
        </Button>
      </div>
    </header>
  );
}