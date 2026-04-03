import React from 'react';

interface State {
  hasError: boolean;
  error?: Error | null;
  info?: React.ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // You might log the error to an external service here
    // console.error('Captured error:', error, info);
    this.setState({ error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2 style={{ color: '#b91c1c' }}>An error occurred while rendering the app</h2>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#111827', color: '#f3f4f6', padding: 12, borderRadius: 8, overflow: 'auto' }}>
            {String(this.state.error && this.state.error.stack ? this.state.error.stack : this.state.error)}
          </pre>
          {this.state.info && (
            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: 'pointer' }}>Component stack</summary>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.info.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
