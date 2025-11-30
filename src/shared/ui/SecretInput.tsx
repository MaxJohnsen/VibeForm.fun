import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Check, X, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecretInputProps {
  label: string;
  value?: string;
  secretId?: string;
  onChange: (value: string, secretId?: string) => void;
  onSave: (value: string) => Promise<string>;
  onUpdate?: (secretId: string, value: string) => Promise<void>;
  onDelete?: (secretId: string) => Promise<void>;
  placeholder?: string;
  description?: string;
}

export const SecretInput = ({
  label,
  value,
  secretId,
  onChange,
  onSave,
  onUpdate,
  onDelete,
  placeholder,
  description,
}: SecretInputProps) => {
  const [isEditing, setIsEditing] = useState(!secretId);
  const [showSecret, setShowSecret] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const hasSavedSecret = !!secretId;

  const handleSave = async () => {
    if (!localValue.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a value',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      if (hasSavedSecret && onUpdate) {
        // Update existing secret
        await onUpdate(secretId!, localValue);
        toast({
          title: 'Success',
          description: 'Secret updated securely',
        });
      } else {
        // Create new secret
        const newSecretId = await onSave(localValue);
        onChange(localValue, newSecretId);
        toast({
          title: 'Success',
          description: 'Secret saved securely',
        });
      }
      setIsEditing(false);
      setShowSecret(false);
    } catch (error) {
      console.error('Error saving secret:', error);
      toast({
        title: 'Error',
        description: 'Failed to save secret. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!secretId || !onDelete) return;

    setIsSaving(true);
    try {
      await onDelete(secretId);
      onChange('', undefined);
      setLocalValue('');
      setIsEditing(true);
      toast({
        title: 'Success',
        description: 'Secret removed',
      });
    } catch (error) {
      console.error('Error deleting secret:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove secret. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalValue(value || '');
    setIsEditing(false);
    setShowSecret(false);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={label}>{label}</Label>
      
      {!isEditing && hasSavedSecret ? (
        // Display mode - secret is saved
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 rounded-md border border-border bg-muted/50 text-muted-foreground font-mono text-sm">
            ••••••••••••••••• Saved securely
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            disabled={isSaving}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Change
          </Button>
          {onDelete && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isSaving}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        // Edit mode
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                id={label}
                type={showSecret ? 'text' : 'password'}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                placeholder={placeholder}
                disabled={isSaving}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setShowSecret(!showSecret)}
                disabled={isSaving}
              >
                {showSecret ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !localValue.trim()}
            >
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
            {hasSavedSecret && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      )}
    </div>
  );
};
