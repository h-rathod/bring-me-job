import { LogOut, Moon, Sun, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '../theme/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import { clearToken, getToken } from '../../lib/storage';

export function Header() {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const isAuthed = Boolean(getToken());

  const onLogout = () => {
    clearToken();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-gray-800 dark:bg-gray-900/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="text-base font-semibold tracking-tight sm:text-lg">
          Bring Me Job
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={toggle} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span className="ml-2 hidden sm:inline">Theme</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <UserRound size={16} />
                <span className="ml-2 hidden sm:inline">Profile</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Account</DropdownMenuItem>
              {isAuthed && (
                <DropdownMenuItem onSelect={onLogout} className="text-red-600">
                  <LogOut size={14} className="mr-2" /> Logout
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
