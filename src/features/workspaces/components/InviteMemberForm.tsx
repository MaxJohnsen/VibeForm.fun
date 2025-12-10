import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail } from 'lucide-react';
import { InlineLoader } from '@/shared/ui';

interface InviteMemberFormProps {
  onSubmit: (email: string, role: 'admin' | 'member') => Promise<void>;
  isLoading?: boolean;
}

export const InviteMemberForm = ({ onSubmit, isLoading = false }: InviteMemberFormProps) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    
    // Basic email validation
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await onSubmit(trimmedEmail, role);
      setEmail('');
      setRole('member');
    } catch (err: any) {
      setError(err.message || 'Failed to send invite');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 space-y-2">
          <Label htmlFor="invite-email">Email address</Label>
          <Input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@company.com"
            disabled={isLoading}
            className="input-focus-glow"
          />
        </div>
        
        <div className="w-full sm:w-32 space-y-2">
          <Label htmlFor="invite-role">Role</Label>
          <Select value={role} onValueChange={(v) => setRole(v as 'admin' | 'member')}>
            <SelectTrigger id="invite-role" disabled={isLoading}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" disabled={isLoading || !email.trim()}>
        {isLoading ? (
          <>
            <InlineLoader size="sm" className="mr-2" />
            Sending...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4 mr-2" />
            Send Invite
          </>
        )}
      </Button>
    </form>
  );
};
