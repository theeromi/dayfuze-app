import { Moon, Sun, Monitor, Eye, BookOpen, Zap, Waves, TreePine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-border/40"
          data-testid="button-theme-toggle"
        >
          {actualTheme === 'light' && <Sun className="h-4 w-4" />}
          {actualTheme === 'dark' && <Moon className="h-4 w-4" />}
          {actualTheme === 'high-contrast' && <Eye className="h-4 w-4" />}
          {actualTheme === 'sepia' && <BookOpen className="h-4 w-4" />}
          {actualTheme === 'midnight' && <Zap className="h-4 w-4" />}
          {actualTheme === 'ocean' && <Waves className="h-4 w-4" />}
          {actualTheme === 'forest' && <TreePine className="h-4 w-4" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className={theme === 'light' ? 'bg-accent' : ''}
          data-testid="theme-light"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className={theme === 'dark' ? 'bg-accent' : ''}
          data-testid="theme-dark"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className={theme === 'system' ? 'bg-accent' : ''}
          data-testid="theme-system"
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
        <div className="my-1 h-px bg-border" />
        <DropdownMenuItem 
          onClick={() => setTheme('high-contrast')}
          className={theme === 'high-contrast' ? 'bg-accent' : ''}
          data-testid="theme-high-contrast"
        >
          <Eye className="mr-2 h-4 w-4" />
          <span>High Contrast</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('sepia')}
          className={theme === 'sepia' ? 'bg-accent' : ''}
          data-testid="theme-sepia"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          <span>Sepia</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('midnight')}
          className={theme === 'midnight' ? 'bg-accent' : ''}
          data-testid="theme-midnight"
        >
          <Zap className="mr-2 h-4 w-4" />
          <span>Midnight</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('ocean')}
          className={theme === 'ocean' ? 'bg-accent' : ''}
          data-testid="theme-ocean"
        >
          <Waves className="mr-2 h-4 w-4" />
          <span>Ocean Blue</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('forest')}
          className={theme === 'forest' ? 'bg-accent' : ''}
          data-testid="theme-forest"
        >
          <TreePine className="mr-2 h-4 w-4" />
          <span>Forest Green</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}