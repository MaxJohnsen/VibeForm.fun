import { useState, useEffect } from 'react';
import { MoreHorizontal, Share2, Eye, Settings, Zap, MessageSquare, HelpCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { GlassCard } from '@/shared/ui/GlassCard';
import { Form } from '../api/formsApi';
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { ShareDialog } from './ShareDialog';
import { FormSparkline } from './FormSparkline';
import { CircularProgress } from './CircularProgress';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface FormCardEnhancedProps {
  form: Form;
  creatorEmail?: string;
}

interface FormStats {
  responseCount: number;
  completedCount: number;
  questionCount: number;
  integrationCount: number;
  dailyResponses: number[];
  lastResponseAt: string | null;
}

export const FormCardEnhanced = ({ form, creatorEmail }: FormCardEnhancedProps) => {
  const navigate = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);
  const [stats, setStats] = useState<FormStats>({
    responseCount: 0,
    completedCount: 0,
    questionCount: 0,
    integrationCount: 0,
    dailyResponses: [],
    lastResponseAt: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [
        { count: responseCount },
        { count: completedCount },
        { count: questionCount },
        { count: integrationCount },
        { data: lastResponse },
        { data: dailyData },
      ] = await Promise.all([
        supabase.from('responses').select('*', { count: 'exact', head: true }).eq('form_id', form.id),
        supabase.from('responses').select('*', { count: 'exact', head: true }).eq('form_id', form.id).eq('status', 'completed'),
        supabase.from('questions').select('*', { count: 'exact', head: true }).eq('form_id', form.id),
        supabase.from('form_integrations').select('*', { count: 'exact', head: true }).eq('form_id', form.id).eq('enabled', true),
        supabase.from('responses').select('completed_at').eq('form_id', form.id).eq('status', 'completed').order('completed_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('responses').select('started_at').eq('form_id', form.id).gte('started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      const dailyResponses = Array(7).fill(0);
      (dailyData || []).forEach((r: any) => {
        const dayIndex = 6 - Math.floor((Date.now() - new Date(r.started_at).getTime()) / (24 * 60 * 60 * 1000));
        if (dayIndex >= 0 && dayIndex < 7) {
          dailyResponses[dayIndex]++;
        }
      });

      setStats({
        responseCount: responseCount || 0,
        completedCount: completedCount || 0,
        questionCount: questionCount || 0,
        integrationCount: integrationCount || 0,
        dailyResponses,
        lastResponseAt: lastResponse?.completed_at || null,
      });
    };

    fetchStats();
  }, [form.id]);

  const handlePreview = () => {
    window.open(ROUTES.getRespondentRoute(form.id), '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-[hsl(var(--status-active))]';
      case 'draft': return 'bg-[hsl(var(--status-draft))]';
      case 'archived': return 'bg-[hsl(var(--palladium))]';
      default: return 'bg-muted-foreground';
    }
  };

  // Get avatar color cycling through palette
  const getAvatarColor = (email: string | null) => {
    const colors = [
      'bg-primary/20 text-primary',
      'bg-[hsl(var(--peach))]/40 text-[hsl(var(--peach-foreground))]',
      'bg-[hsl(var(--lavender))] text-[hsl(var(--lavender-foreground))]',
      'bg-[hsl(var(--charcoal))]/10 text-[hsl(var(--charcoal))]',
    ];
    if (!email) return colors[0];
    const hash = email.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Get initials from email
  const getInitials = (email: string | null) => {
    if (!email) return 'U';
    const local = email.split('@')[0];
    if (!local) return 'U';
    // Take first two letters or first letter of each word part
    const parts = local.split(/[._-]/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return local.slice(0, 2).toUpperCase();
  };

  // Get display email (truncated if needed)
  const getDisplayEmail = (email: string | null) => {
    if (!email) return 'Unknown';
    if (email.includes('@')) {
      const [local, domain] = email.split('@');
      if (local.length > 12) {
        return `${local.slice(0, 10)}...@${domain}`;
      }
      return email;
    }
    // It's a UUID - show truncated
    return `${email.slice(0, 8)}...`;
  };

  const completionRate = stats.responseCount > 0 
    ? Math.round((stats.completedCount / stats.responseCount) * 100) 
    : 0;

  return (
    <>
      <GlassCard 
        className={cn(
          "p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group",
          form.status === 'active' && "border-l-4 border-l-[hsl(var(--status-active))]",
          form.status === 'draft' && "border-l-4 border-l-[hsl(var(--peach))]",
        )}
        onClick={() => navigate(ROUTES.getBuilderRoute(form.id))}
      >
        {/* Row 1: Title + Stats + Sparkline + Progress */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            {/* Title with status dot */}
            <div className="flex items-center gap-2.5 mb-2">
              <div className={cn('w-2 h-2 rounded-full shrink-0', getStatusColor(form.status))} />
              <h3 className="font-heading font-semibold text-foreground truncate">{form.title}</h3>
            </div>
            
            {/* Stats with full labels */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>{stats.questionCount} questions</span>
              {stats.integrationCount > 0 && (
                <>
                  <span className="mx-1.5">·</span>
                  <Zap className="h-3.5 w-3.5" />
                  <span>{stats.integrationCount} integrations</span>
                </>
              )}
            </div>
          </div>
          
          {/* Right side: Submission count + Sparkline + Circular Progress + Menu */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Prominent submission count */}
            <div className="text-right pr-3 border-r border-border/50">
              <p className="text-lg font-semibold text-foreground leading-none">
                {stats.responseCount}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                submissions
              </p>
            </div>
            
            <FormSparkline data={stats.dailyResponses} />
            <CircularProgress value={completionRate} size={44} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuLabel className="text-xs text-muted-foreground">Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={handlePreview} className="cursor-pointer">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShareOpen(true)} className="cursor-pointer">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => navigate(ROUTES.getFormSettingsRoute(form.id))} 
                  className="cursor-pointer"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-border/50 my-3" />

        {/* Row 2: Creator info + Last response */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {/* Avatar with initials */}
            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium", getAvatarColor(creatorEmail))}>
              {getInitials(creatorEmail)}
            </div>
            <span className="truncate max-w-[180px]">{getDisplayEmail(creatorEmail)}</span>
            <span className="text-muted-foreground/50">·</span>
            <span>Created {format(new Date(form.created_at || new Date()), 'MMM d, yyyy')}</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {stats.lastResponseAt ? (
              <span>Last response {formatDistanceToNow(new Date(stats.lastResponseAt), { addSuffix: false })} ago</span>
            ) : (
              <span>No responses yet</span>
            )}
          </div>
        </div>
      </GlassCard>

      <ShareDialog
        formId={form.id}
        formTitle={form.title}
        formStatus={form.status}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
    </>
  );
};
