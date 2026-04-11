import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

/**
 * Catches any uncaught render errors in the component tree and shows a
 * recovery UI instead of a blank page. Without this, a runtime error in
 * cronstrue or cron-parser would crash the entire app silently.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
    // Clear the URL hash so a bad shared expression doesn't immediately re-crash
    window.history.replaceState(null, '', window.location.pathname);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h2 className="error-boundary-title">Something went wrong</h2>
            <p className="error-boundary-message">
              An unexpected error occurred while rendering the expression.
            </p>
            <code className="error-boundary-detail">{this.state.errorMessage}</code>
            <button className="error-boundary-reset" onClick={this.handleReset}>
              Reset and start fresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
