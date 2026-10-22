import { Component, ReactNode } from "react";
import { Link } from "react-router";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleRefresh = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="relative min-h-screen overflow-hidden bg-[#E4EFF8] font-sans">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(198,146,89,0.18), transparent 55%)",
            }}
          />
          <div className="relative z-10 mx-auto flex min-h-screen max-w-[560px] flex-col justify-center px-4 py-16">
            <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_24px_60px_rgba(18,33,62,0.1)]">
              <div className="bg-[#12213E] px-6 py-8 text-center text-white sm:px-10">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                  <AlertTriangle className="h-8 w-8 text-[#C69259]" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C69259]">
                  Unexpected error
                </p>
                <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
                  Something went wrong
                </h1>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/70">
                  We’re sorry, an unexpected error interrupted the app. Refresh the page or
                  return home to continue.
                </p>
              </div>
              <div className="flex flex-col gap-3 px-6 py-8 sm:flex-row sm:justify-center sm:px-10">
                <button
                  type="button"
                  onClick={this.handleRefresh}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#12213E]/15 px-6 py-3 text-sm font-semibold text-[#12213E] transition-colors hover:bg-[#F7FBFE]"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh page
                </button>
                <Link to="/" className="cta-email justify-center" onClick={() => this.setState({ hasError: false, error: null })}>
                  <span className="whitespace-nowrap">Back to home</span>
                  <span className="cta-email-arrow">
                    <Home className="h-4 w-4" />
                  </span>
                </Link>
              </div>
              {process.env.NODE_ENV !== "production" && this.state.error?.message && (
                <div className="border-t border-[#E8EDF2] px-6 pb-8 sm:px-10">
                  <p className="rounded-2xl bg-[#F7FBFE] px-4 py-3 font-mono text-xs text-[#12213E]">
                    {this.state.error.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
