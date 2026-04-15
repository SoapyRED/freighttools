'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches runtime errors in child components and renders a fallback
 * instead of crashing the entire React tree. Wrap interactive sections
 * (calculators, search, mode toggles) so one broken component doesn't
 * kill interactivity for the whole page.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[FreightUtils Error Boundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{
          padding: '16px 20px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          color: 'var(--text-muted)',
          fontSize: 14,
          textAlign: 'center',
        }}>
          Something went wrong loading this section.{' '}
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              color: 'var(--accent)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'underline',
              fontFamily: 'inherit',
            }}
          >
            Try again
          </button>
          {' '}or refresh the page.
        </div>
      );
    }
    return this.props.children;
  }
}
