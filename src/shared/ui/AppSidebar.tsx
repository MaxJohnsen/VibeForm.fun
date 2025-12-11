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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavButton = ({ icon, label, isActive, onClick }: NavButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        onClick={onClick}
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200',
          isActive
            ? 'bg-coral text-coral-foreground shadow-lg'
            : 'hover:bg-accent text-muted-foreground hover:text-foreground'
        )}
        aria-label={label}
      >
        {icon}
      </button>
    </TooltipTrigger>
    <TooltipContent side="right" sideOffset={12} className="font-medium">
      {label}
    </TooltipContent>
  </Tooltip>
);

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

  const userInitials = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <TooltipProvider delayDuration={100}>
      <div className="fixed bottom-0 left-0 w-full h-16 border-t md:top-0 md:h-screen md:w-16 md:border-t-0 md:border-r border-border/50 glass-panel flex flex-row md:flex-col items-center justify-around md:justify-start py-2 md:py-4 z-50">
        {/* Brand Icon */}
        <div className="hidden md:flex items-center justify-center mb-6 w-full">
          <i className="fa-solid fa-comment-dot text-2xl text-coral" />
        </div>

        {/* Navigation Items */}
        <div className="flex flex-row md:flex-col gap-2 md:flex-1">
          <NavButton
            icon={<Home className="h-5 w-5" />}
            label="Home"
            isActive={location.pathname === ROUTES.FORMS_HOME}
            onClick={() => navigate(ROUTES.FORMS_HOME)}
          />
          <NavButton
            icon={<Settings className="h-5 w-5" />}
            label="Workspace Settings"
            isActive={location.pathname === ROUTES.WORKSPACE_SETTINGS}
            onClick={() => navigate(ROUTES.WORKSPACE_SETTINGS)}
          />
        </div>

        {/* Pending Invites Notification */}
        <div className="md:mb-2">
          <PendingInvitesNotification />
        </div>

        {/* Bottom Account Menu */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button
                  className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-200"
                  aria-label="Account"
                >
                  <User className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={12} className="font-medium">
              Account
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent 
            side="right" 
            align="end" 
            sideOffset={16}
            className="w-60 ml-2 glass-panel border-border/50"
          >
            <div className="px-3 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">Account</div>
                <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem 
              onClick={handleSignOut} 
              className="text-destructive cursor-pointer mx-1 my-1 rounded-lg focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
};
