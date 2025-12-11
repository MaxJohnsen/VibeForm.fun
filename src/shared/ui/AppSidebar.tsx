import { Home, LogOut, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { useAuth } from '@/features/auth';
import { PendingInvitesNotification } from '@/features/workspaces';
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
    try {
      await signOut();
    } catch (error) {
      console.warn('Sign out error (proceeding anyway):', error);
    }
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full h-16 border-t md:top-0 md:h-screen md:w-16 md:border-t-0 md:border-r border-border/50 glass-panel flex flex-row md:flex-col items-center justify-around md:justify-start py-2 md:py-4 z-50">
      {/* Brand Logo */}
      <div className="hidden md:flex mb-6 w-full justify-center">
        <div className="relative">
          <span 
            className="text-3xl font-black tracking-tight text-primary"
            style={{ 
              textShadow: '0 1px 2px rgba(0,0,0,0.1), 0 2px 8px hsl(24 85% 48% / 0.3)' 
            }}
          >
            FF
          </span>
          <div className="absolute -inset-2 bg-primary/25 blur-xl -z-10" />
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex flex-row md:flex-col gap-2 md:flex-1">
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

        <button
          onClick={() => navigate(ROUTES.WORKSPACE_SETTINGS)}
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200',
            location.pathname === ROUTES.WORKSPACE_SETTINGS
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'hover:bg-accent text-muted-foreground hover:text-foreground'
          )}
          aria-label="Workspace Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {/* Pending Invites Notification */}
      <div className="md:mb-2">
        <PendingInvitesNotification />
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
        <DropdownMenuContent side="top" align="end" className="w-56 md:mb-0 mb-2">
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
