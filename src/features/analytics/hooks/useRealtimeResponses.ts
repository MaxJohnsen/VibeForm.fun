import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useRealtimeResponses = (formId: string, onUpdate: () => void) => {
  const onUpdateRef = useRef(onUpdate);
  
  // Keep ref up to date
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);
  
  useEffect(() => {
    // Verify auth session before setting up realtime
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        console.error('❌ No auth session found - realtime will not work');
        toast({
          title: 'Authentication Required',
          description: 'Please log in to see real-time updates',
          variant: 'destructive',
        });
        return;
      }
      
      console.log('✅ Auth session found:', session.user.id);
      
      const channel = supabase
        .channel('responses-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'responses',
            filter: `form_id=eq.${formId}`,
          },
          (payload) => {
            console.log('New response received:', payload);
            toast({
              title: 'New Response',
              description: 'Someone just started filling out your form!',
            });
            onUpdateRef.current();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'responses',
            filter: `form_id=eq.${formId}`,
          },
          (payload) => {
            console.log('Response updated:', payload);
            // Check if it's a completion
            if (payload.new && (payload.new as any).status === 'completed') {
              toast({
                title: 'Response Completed',
                description: 'Someone just completed your form!',
              });
            }
            onUpdateRef.current();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'answers',
          },
          async (payload) => {
            // Verify this answer belongs to our form
            const { data: response } = await supabase
              .from('responses')
              .select('form_id')
              .eq('id', (payload.new as any).response_id)
              .single();
            
            if (response?.form_id === formId) {
              console.log('New answer received for our form:', payload);
              onUpdateRef.current();
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'answers',
          },
          async (payload) => {
            // Verify this answer belongs to our form
            const { data: response } = await supabase
              .from('responses')
              .select('form_id')
              .eq('id', (payload.new as any).response_id)
              .single();
            
            if (response?.form_id === formId) {
              console.log('Answer updated for our form:', payload);
              onUpdateRef.current();
            }
          }
        )
        .subscribe((status, err) => {
          console.log('Realtime subscription status:', status, err);
          
          if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully subscribed to realtime updates');
            toast({
              title: 'Connected',
              description: 'Real-time updates are now active',
            });
          }
          
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('❌ Realtime subscription failed:', err);
            toast({
              title: 'Connection Error',
              description: 'Real-time updates are not working',
              variant: 'destructive',
            });
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    });
  }, [formId]);
};
