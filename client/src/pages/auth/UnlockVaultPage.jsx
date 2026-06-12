import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { PasswordInput, Button, Card } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { unlockVault } from '../../crypto';

export const UnlockVaultPage = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError('');

    // Wait for the heavy PBKDF2 derivation
    // In Phase 2/3 vaultKeySalt was defined. Make sure it is passed into user state on auth store initialization.
    const success = await unlockVault(password, user?.vaultKeySalt);

    setLoading(false);

    if (success) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } else {
      setError('Incorrect password. Try again.');
      setPassword('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-tertiary)] flex items-center justify-center p-4">
      <Card className="w-full max-w-[400px] shadow-lg border-[var(--border)]" padding="lg">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-12 w-12 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center border border-[var(--border)] mb-4">
            <Lock className="h-6 w-6 text-[var(--text-secondary)]" />
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Vault Locked</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Welcome back, <span className="font-medium text-[var(--text-primary)]">{user?.username}</span>. <br />
            Enter your password to decrypt your vault.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <PasswordInput
            ref={inputRef}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            error={error}
          />

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full h-11 text-base font-semibold"
            loading={loading}
            disabled={!password}
          >
            Unlock Vault
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={logout}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors focus:outline-none focus:underline"
          >
            Not you? Sign out
          </button>
        </div>
      </Card>
    </div>
  );
};