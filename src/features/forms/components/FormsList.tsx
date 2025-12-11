import { useMemo } from 'react';
import { FormCardEnhanced } from './FormCardEnhanced';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Form } from '../api/formsApi';
import { Skeleton } from '@/components/ui/skeleton';
import { useFormStats } from '../hooks/useFormStats';

interface FormsListProps {
  forms: Form[];
  isLoading: boolean;
  memberEmailMap?: Record<string, string>;
}

export const FormsList = ({ forms, isLoading, memberEmailMap }: FormsListProps) => {
  const formIds = useMemo(() => forms.map(f => f.id), [forms]);
  const { data: statsMap = {} } = useFormStats(formIds);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (forms.length === 0) {
    return (
      <EmptyState
        icon="fa-solid fa-wand-magic-sparkles"
        title="Ready to create something great?"
        description="Build beautiful forms in minutes. Drag, drop, and publish – click 'Create New Form' above to start."
      />
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {forms.map((form) => (
        <FormCardEnhanced 
          key={form.id} 
          form={form} 
          creatorEmail={memberEmailMap?.[form.created_by]}
          stats={statsMap[form.id]}
        />
      ))}
    </div>
  );
};
