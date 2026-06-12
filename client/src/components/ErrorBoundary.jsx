import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './ui';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-tertiary)] p-4 text-center">
          <AlertTriangle className="h-16 w-16 text-[var(--danger)] mb-4" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Something went wrong</h1>
          <p className="text-[var(--text-secondary)] max-w-md mb-8">
            The application encountered an unexpected error. Your encrypted data remains safe.
          </p>
          <div className="flex gap-4">
            <Button leftIcon={RefreshCcw} onClick={() => window.location.reload()}>Reload Page</Button>
            <Button variant="secondary" onClick={() => window.location.href = 'mailto:support@passwordsaver.com'}>Contact Support</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}