import type { ReactNode, ReactElement } from 'react';
import { Component } from 'react';
import styles from './ErrorBoundary.module.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error) => ReactElement;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught an error:', error);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }

      return (
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.icon}>⚠</div>
            <h2 className={styles.title}>Algo deu errado</h2>
            <p className={styles.message}>
              Desculpe, ocorreu um erro inesperado na aplicação. Por favor, tente novamente.
            </p>
            <details className={styles.details}>
              <summary>Detalhes do erro</summary>
              <pre className={styles.errorStack}>{this.state.error.toString()}</pre>
            </details>
            <button onClick={this.resetError} className={styles.button}>
              Tentar Novamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
