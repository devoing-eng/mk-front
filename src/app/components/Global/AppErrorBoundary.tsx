// src/app/components/Global/AppErrorBoundary.tsx

'use client';
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Specific error detection React #31
    if (error.message.includes('Objects are not valid as a React child') || 
        error.message.includes('Minified React error #31')) {
      console.log('Detected corrupted state, clearing cache...');
      localStorage.clear();
      sessionStorage.clear();
      
      // Reload after clearing
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2>Update in progress...</h2>
            <p>Please wait...</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}