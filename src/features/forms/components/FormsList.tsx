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
      <div className="flex flex-wrap gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
            <Skeleton className="h-48 rounded-2xl" />
          </div>
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
    <div className="flex flex-wrap gap-6 animate-fade-in">
      {forms.map((form) => (
        <div key={form.id} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1.125rem)] 2xl:w-[calc(20%-1.2rem)]">
          <FormCard form={form} />
        </div>
      ))}
    </div>
  );
};
