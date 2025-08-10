import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { LogOut, Moon, Sun, UserRound } from 'lucide-react';
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
          <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-foreground/5 px-3 py-2 text-sm font-medium text-foreground/90 shadow-sm transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span className="hidden sm:inline">Theme</span>
          </button>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-950/[0.04] px-3 py-2 text-sm font-medium text-gray-900/90 shadow-sm transition-colors hover:bg-gray-950/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:border-gray-800 dark:bg-white/5 dark:text-gray-100/90 dark:hover:bg-white/10">
                <UserRound size={16} />
                <span className="hidden sm:inline">Profile</span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="min-w-[200px] rounded-xl border border-gray-200 bg-white p-1 text-sm shadow-xl dark:border-gray-800 dark:bg-gray-900">
                <DropdownMenu.Item className="rounded-lg px-3 py-2 outline-none hover:bg-accent">
                  Account
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-gray-200 dark:bg-gray-800" />
                {isAuthed && (
                  <DropdownMenu.Item
                    onSelect={onLogout}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-red-600 outline-none hover:bg-accent/60"
                  >
                    <LogOut size={14} /> Logout
                  </DropdownMenu.Item>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  );
}
