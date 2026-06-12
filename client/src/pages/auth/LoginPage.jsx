import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Input, PasswordInput, Button, Toggle, Card } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage = () => {
  const { login, isLoading, error, savedUsername } = useAuth();
  const [formData, setFormData] = useState({ username: savedUsername || '', password: '', rememberMe: !!savedUsername });
  const [failCount, setFailCount] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && !savedUsername) {
      inputRef.current.focus();
    }
  }, [savedUsername]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) return;

    const success = await login(formData);
    if (!success) {
      setFailCount(prev => prev + 1);
      setFormData(prev => ({ ...prev, password: '' })); // Clear password on fail
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-tertiary)] flex items-center justify-center px-4 py-6">     
<Card 
  className="w-full max-w-[380px] shadow-lg border-[var(--border)]"
  padding="md"
>
        <div className="flex flex-col items-center mb-5">
          <Link to="/" className="flex flex-col items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="Passwordsaver Logo" className="h-12 w-12 object-contain drop-shadow-md" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">passwordsaver</h1>
          </Link>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Sign in to your secure vault</p>
        </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          ref={inputRef}
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          autoComplete="username"
          required
          disabled={isLoading}
        />

        <PasswordInput
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="current-password"
          required
          disabled={isLoading}
        />

        <div className="flex items-center justify-between">
          <Toggle
            checked={formData.rememberMe}
            onChange={(checked) => setFormData(prev => ({ ...prev, rememberMe: checked }))}
            label="Remember me"
            size="sm"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="p-3 bg-[var(--danger-subtle)] border border-[var(--danger)] text-[var(--danger-text)] text-sm rounded-md animate-slideUp">
            {error}
          </div>
        )}

        {failCount >= 3 && (
          <p className="text-sm text-[var(--warning)] text-center animate-fadeIn">
            Having trouble? Check your username and try again.
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          className="w-full h-11 text-base font-semibold"
          loading={isLoading}
          disabled={!formData.username || !formData.password}
        >
          Sign in
        </Button>
      </form>

      <div className="mt-5 text-center text-sm text-[var(--text-secondary)] border-t border-[var(--border)] pt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-[var(--accent)] font-medium hover:underline focus:outline-none focus:underline">
          Create account
        </Link>
      </div>
    </Card>
    </div>
  );
};