import { useEffect, useState } from 'react';
import { MessageSquare, Mail, Webhook, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { SlackIcon } from '@/shared/ui/icons';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'response' | 'email' | 'webhook' | 'slack' | 'zapier';
  formTitle: string;
  formId: string;
  timestamp: string;
  description: string;
}

interface ActivityFeedProps {
  workspaceId: string | undefined;
}

const getActivityStyle = (type: ActivityItem['type']) => {
  switch (type) {
    case 'response':
      return {
        bg: 'bg-primary/10',
        icon: 'text-primary',
      };
    case 'email':
      return {
        bg: 'bg-emerald-500/10',
        icon: 'text-emerald-600 dark:text-emerald-400',
      };
    case 'slack':
      return {
        bg: 'bg-amber-500/10',
        icon: 'text-amber-600 dark:text-amber-400',
      };
    case 'webhook':
      return {
        bg: 'bg-sky-500/10',
        icon: 'text-sky-600 dark:text-sky-400',
      };
    case 'zapier':
      return {
        bg: 'bg-orange-500/10',
        icon: 'text-orange-600 dark:text-orange-400',
      };
    default:
      return {
        bg: 'bg-muted',
        icon: 'text-muted-foreground',
      };
  }
};

export const ActivityFeed = ({ workspaceId }: ActivityFeedProps) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!workspaceId) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch recent responses with form titles
        const { data: responses } = await supabase
          .from('responses')
          .select(`
            id,
            completed_at,
            started_at,
            status,
            form_id,
            forms!inner(title, workspace_id)
          `)
          .eq('forms.workspace_id', workspaceId)
          .order('started_at', { ascending: false })
          .limit(10);

        const responseActivities: ActivityItem[] = (responses || []).map((r: any) => ({
          id: r.id,
          type: 'response',
          formTitle: r.forms?.title || 'Unknown Form',
          formId: r.form_id,
          timestamp: r.completed_at || r.started_at,
          description: r.status === 'completed' ? 'New response' : 'Started response',
        }));

        // Fetch recent integration logs
        const { data: logs } = await supabase
          .from('integration_logs')
          .select(`
            id,
            executed_at,
            status,
            form_integrations!inner(
              type,
              form_id,
              forms!inner(title, workspace_id)
            )
          `)
          .eq('form_integrations.forms.workspace_id', workspaceId)
          .eq('status', 'success')
          .order('executed_at', { ascending: false })
          .limit(5);

        const logActivities: ActivityItem[] = (logs || []).map((l: any) => ({
          id: l.id,
          type: l.form_integrations?.type || 'webhook',
          formTitle: l.form_integrations?.forms?.title || 'Unknown Form',
          formId: l.form_integrations?.form_id,
          timestamp: l.executed_at,
          description: getIntegrationDescription(l.form_integrations?.type),
        }));

        // Combine and sort by timestamp
        const allActivities = [...responseActivities, ...logActivities]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 8);

        setActivities(allActivities);
      } catch (error) {
        console.error('Failed to fetch activity:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
  }, [workspaceId]);

  const getIntegrationDescription = (type: string) => {
    switch (type) {
      case 'email': return 'Email sent';
      case 'slack': return 'Slack notification';
      case 'webhook': return 'Webhook triggered';
      case 'zapier': return 'Zap triggered';
      default: return 'Integration ran';
    }
  };

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'response': return MessageSquare;
      case 'email': return Mail;
      case 'slack': return SlackIcon;
      case 'webhook': return Webhook;
      case 'zapier': return Zap;
      default: return MessageSquare;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const Icon = getIcon(activity.type);
        const style = getActivityStyle(activity.type);
        return (
          <div key={activity.id} className="flex gap-3 group">
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
              style.bg
            )}>
              <Icon className={cn("h-3.5 w-3.5", style.icon)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{activity.formTitle}</p>
              <p className="text-xs text-muted-foreground">
                {activity.description} · {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};