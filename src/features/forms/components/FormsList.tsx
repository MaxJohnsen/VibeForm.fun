import { FormCard } from './FormCard';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Form } from '../api/formsApi';
import { FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface FormsListProps {
  forms: Form[];
  isLoading: boolean;
  onCreateNew: () => void;
}

export const FormsList = ({ forms, isLoading, onCreateNew }: FormsListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (forms.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No forms yet"
        description="Create your first form to start collecting responses"
        actionLabel="Create New Form"
        onAction={onCreateNew}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      {forms.map((form) => (
        <FormCard key={form.id} form={form} />
      ))}
    </div>
  );
};
