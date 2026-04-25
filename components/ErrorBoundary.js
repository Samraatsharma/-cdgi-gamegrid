"use client";

import React from 'react';

/**
 * ErrorBoundary — catches React rendering errors and shows a clean fallback UI
 * instead of a blank white screen. Wraps the entire app in layout.js.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-8">
          <div className="max-w-lg w-full text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-error/10 border border-error/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-error text-4xl">error</span>
            </div>
            <h1 className="font-headline font-black italic text-3xl uppercase tracking-tighter text-on-surface mb-3">
              Something Went <span className="text-error">Wrong</span>
            </h1>
            <p className="text-on-surface-variant text-sm mb-8 max-w-md mx-auto">
              An unexpected error occurred. This has been logged automatically. 
              Please try refreshing the page.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-primary text-on-primary font-headline font-black italic uppercase text-sm tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg"
              >
                Refresh Page
              </button>
              <button
                onClick={() => { this.setState({ hasError: false, error: null }); window.history.back(); }}
                className="px-8 py-3 bg-surface-container-high text-on-surface font-headline font-bold uppercase text-sm tracking-widest rounded-xl border border-outline-variant/20 hover:border-primary/40 transition-all"
              >
                Go Back
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left bg-surface-container-high rounded-xl p-4 border border-outline-variant/10">
                <summary className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant cursor-pointer">
                  Error Details (Dev Only)
                </summary>
                <pre className="mt-3 text-xs text-error/80 overflow-auto max-h-40 whitespace-pre-wrap">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
