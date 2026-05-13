'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '24px',
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '12px',
          color: 'var(--color-danger)',
          margin: '20px 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <AlertTriangle size={24} />
            <h3 style={{ margin: 0, fontWeight: 'bold' }}>{this.props.fallbackTitle || 'Component Error'}</h3>
          </div>
          <p style={{ fontSize: '14px', margin: '0 0 16px 0', opacity: 0.8 }}>
            An unexpected error occurred while rendering this module.
          </p>
          <pre style={{ 
            fontSize: '12px', 
            backgroundColor: 'rgba(0,0,0,0.2)', 
            padding: '12px', 
            borderRadius: '6px',
            overflow: 'auto',
            maxHeight: '150px'
          }}>
            {this.state.error?.message}
          </pre>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: 'var(--color-danger)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
