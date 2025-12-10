import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InlineLoader } from '@/shared/ui';

interface CreateWorkspaceFormProps {
  onSubmit: (name: string) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
  defaultName?: string;
}

export const CreateWorkspaceForm = ({ 
  onSubmit, 
  isLoading = false,
  submitLabel = 'Create Workspace',
  defaultName = ''
}: CreateWorkspaceFormProps) => {
  const [name, setName] = useState(defaultName);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (trimmedName.length < 3) {
      setError('Workspace name must be at least 3 characters');
      return;
    }
    if (trimmedName.length > 50) {
      setError('Workspace name must be at most 50 characters');
      return;
    }

    await onSubmit(trimmedName);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="workspace-name">Workspace Name</Label>
        <Input
          id="workspace-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Workspace"
          autoFocus
          disabled={isLoading}
          className="input-focus-glow"
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <p className="text-xs text-muted-foreground">
          3-50 characters
        </p>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || !name.trim()}
      >
        {isLoading ? (
          <>
            <InlineLoader size="sm" />
            Creating...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
};
