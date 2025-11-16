import { Home, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { useAuth } from '@/features/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-16 glass-panel border-r border-border/50 flex flex-col items-center py-6">
      {/* Top Navigation */}
      <div className="flex-1 flex flex-col gap-4">
        <button
          onClick={() => navigate(ROUTES.FORMS_HOME)}
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200',
            location.pathname === ROUTES.FORMS_HOME
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'hover:bg-accent text-muted-foreground hover:text-foreground'
          )}
          aria-label="Home"
        >
          <Home className="h-5 w-5" />
        </button>
      </div>

      {/* Bottom Account Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-200"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm">
            <div className="font-medium">Account</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
