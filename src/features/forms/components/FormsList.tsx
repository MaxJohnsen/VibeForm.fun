import { FormCardEnhanced } from './FormCardEnhanced';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Form } from '../api/formsApi';
import { FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface FormsListProps {
  forms: Form[];
  isLoading: boolean;
  memberEmailMap?: Record<string, string>;
  onCreateNew: () => void;
}

export const FormsList = ({ forms, isLoading, memberEmailMap, onCreateNew }: FormsListProps) => {
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
        icon={FileText}
        title="Ready to create something great?"
        description="Build beautiful forms in minutes. Drag, drop, and publish – it's that simple."
        actionLabel="Create New Form"
        onAction={onCreateNew}
        buttonClassName="rounded-full"
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
        />
      ))}
    </div>
  );
};
