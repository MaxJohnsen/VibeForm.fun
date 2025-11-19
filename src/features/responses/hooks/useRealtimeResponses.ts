import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useRealtimeResponses = (formId: string, onUpdate: () => void) => {
  useEffect(() => {
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
          onUpdate();
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
          onUpdate();
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
            onUpdate();
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
            onUpdate();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [formId, onUpdate]);
};
