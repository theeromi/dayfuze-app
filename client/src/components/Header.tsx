import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick: () => void;
  onProfileClick: () => void;
}

export function Header({ onMenuClick, onProfileClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-soft sticky top-0 z-30" data-testid="header">
      <div className="flex items-center justify-between px-4 py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100"
          data-testid="button-menu"
        >
          <Menu className="text-gray-600 w-5 h-5" />
        </Button>
        
        <div className="flex items-center" data-testid="logo-dayfuse">
          <span className="text-xl font-bold text-day-blue">Day</span>
          <span className="text-xl font-bold text-fuse-orange">Fuse</span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onProfileClick}
          className="p-2 hover:bg-gray-100"
          data-testid="button-profile"
        >
          <User className="text-gray-600 w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
