import React from 'react';

interface Props {
  children: React.ReactNode;
}
interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('LifePlanner OS crashed:', error, info);
  }

  handleReset = async () => {
    try {
      const { db } = await import('../db/db');
      await db.delete();
      localStorage.clear();
    } catch {}
    window.location.hash = '#/';
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-[#0f1115] text-white p-6">
          <div className="max-w-lg w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-zinc-400 mb-6 text-sm break-words">
              {this.state.error?.message || 'Unknown error'} <br />
              The app crashed while loading. This is usually caused by blocked storage or a corrupted cache.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-white text-black rounded-xl font-semibold"
              >
                Reload App
              </button>
              <button
                onClick={this.handleReset}
                className="w-full py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-medium"
              >
                Clear Storage & Reset OS
              </button>
              <p className="text-xs text-zinc-500 mt-4">
                If you're on iPhone private mode, please disable it. IndexedDB is required.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
