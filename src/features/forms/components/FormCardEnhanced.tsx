import { useState, useEffect } from 'react';
import { MoreHorizontal, Share2, Eye, Settings, Zap, MessageSquare, HelpCircle } from 'lucide-react';
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
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { ShareDialog } from './ShareDialog';
import { FormSparkline } from './FormSparkline';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface FormCardEnhancedProps {
  form: Form;
}

interface FormStats {
  responseCount: number;
  questionCount: number;
  integrationCount: number;
  dailyResponses: number[];
  lastResponseAt: string | null;
}

export const FormCardEnhanced = ({ form }: FormCardEnhancedProps) => {
  const navigate = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);
  const [stats, setStats] = useState<FormStats>({
    responseCount: 0,
    questionCount: 0,
    integrationCount: 0,
    dailyResponses: [],
    lastResponseAt: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch all stats in parallel
      const [
        { count: responseCount },
        { count: questionCount },
        { count: integrationCount },
        { data: lastResponse },
        { data: dailyData },
      ] = await Promise.all([
        supabase.from('responses').select('*', { count: 'exact', head: true }).eq('form_id', form.id),
        supabase.from('questions').select('*', { count: 'exact', head: true }).eq('form_id', form.id),
        supabase.from('form_integrations').select('*', { count: 'exact', head: true }).eq('form_id', form.id).eq('enabled', true),
        supabase.from('responses').select('completed_at').eq('form_id', form.id).eq('status', 'completed').order('completed_at', { ascending: false }).limit(1).maybeSingle(),
        // Get responses from last 7 days for sparkline
        supabase.from('responses').select('started_at').eq('form_id', form.id).gte('started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      // Process daily responses for sparkline
      const dailyResponses = Array(7).fill(0);
      (dailyData || []).forEach((r: any) => {
        const dayIndex = 6 - Math.floor((Date.now() - new Date(r.started_at).getTime()) / (24 * 60 * 60 * 1000));
        if (dayIndex >= 0 && dayIndex < 7) {
          dailyResponses[dayIndex]++;
        }
      });

      setStats({
        responseCount: responseCount || 0,
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
      case 'active': return 'bg-green-500';
      case 'draft': return 'bg-blue-400';
      case 'archived': return 'bg-orange-400';
      default: return 'bg-muted-foreground';
    }
  };

  return (
    <>
      <GlassCard 
        className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group"
        onClick={() => navigate(ROUTES.getBuilderRoute(form.id))}
      >
        {/* Title Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn('w-2 h-2 rounded-full shrink-0', getStatusColor(form.status))} />
            <h3 className="font-heading font-semibold text-foreground truncate">{form.title}</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
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

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{stats.responseCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>{stats.questionCount}</span>
          </div>
          {stats.integrationCount > 0 && (
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              <span>{stats.integrationCount}</span>
            </div>
          )}
        </div>

        {/* Bottom Row: Sparkline + Last Updated */}
        <div className="flex items-center justify-between">
          <FormSparkline data={stats.dailyResponses} />
          <div className="text-xs text-muted-foreground">
            {stats.lastResponseAt ? (
              <span>Last {formatDistanceToNow(new Date(stats.lastResponseAt), { addSuffix: true })}</span>
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
