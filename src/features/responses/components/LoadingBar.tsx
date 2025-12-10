interface LoadingBarProps {
  isLoading: boolean;
}

export const LoadingBar = ({ isLoading }: LoadingBarProps) => {
  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent overflow-hidden">
      <div className="h-full bg-primary animate-loading-slide" />
    </div>
  );
};