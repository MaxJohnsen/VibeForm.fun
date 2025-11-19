import { Skeleton } from '@/components/ui/skeleton';

export const QuestionSkeleton = () => {
  return (
    <div className="max-w-3xl w-full mx-auto py-8 space-y-6">
      {/* Question label skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-3/4 bg-muted/40" />
        <Skeleton className="h-4 w-1/2 bg-muted/30" />
      </div>

      {/* Answer options skeleton */}
      <div className="space-y-3 mt-8">
        <Skeleton className="h-14 w-full bg-muted/40 rounded-xl" />
        <Skeleton className="h-14 w-full bg-muted/40 rounded-xl" />
        <Skeleton className="h-14 w-full bg-muted/40 rounded-xl" />
      </div>
    </div>
  );
};
