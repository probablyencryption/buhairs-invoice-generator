import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface PasswordPromptProps {
  onAuthenticated: () => void;
}

export default function PasswordPrompt({ onAuthenticated }: PasswordPromptProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ password }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem('bu_authenticated', 'true');
        onAuthenticated();
      } else {
        setError('Invalid password. Please try again.');
        setPassword('');
      }
    } catch (err) {
      setError('Invalid password. Please try again.');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Bu Luxury Hairs</h1>
          <p className="text-sm text-muted-foreground text-center">
            Enter your password to access the invoice maker
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              autoFocus
              data-testid="input-password"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" data-testid="text-error">
              {error}
            </p>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
            data-testid="button-login"
          >
            {isLoading ? 'Verifying...' : 'Access Invoice Maker'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
