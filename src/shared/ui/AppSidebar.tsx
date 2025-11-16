import { Home, LayoutList, Folder, Settings, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';

export const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: FileText, path: ROUTES.FORMS_HOME, label: 'Forms' },
    { icon: Home, path: ROUTES.HOME, label: 'Home' },
    { icon: LayoutList, path: '#', label: 'Lists' },
    { icon: Folder, path: '#', label: 'Folder' },
    { icon: Settings, path: '#', label: 'Settings' },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-16 glass-panel border-r border-border/50 flex flex-col items-center py-6 gap-4">
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <button
            key={index}
            onClick={() => item.path !== '#' && navigate(item.path)}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200',
              isActive
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'hover:bg-accent text-muted-foreground hover:text-foreground'
            )}
            aria-label={item.label}
          >
            <Icon className="h-5 w-5" />
          </button>
        );
      })}
    </div>
  );
};
