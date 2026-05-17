import React, { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f4f7fe] flex items-center justify-center p-6 font-sans">
          <div className="bg-white p-8 rounded-3xl shadow-premium border border-slate-100 text-center max-w-md w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-red-50 p-4 rounded-2xl mb-4">
              <AlertTriangle className="w-10 h-10 text-red-500 stroke-[2.5]" />
            </div>
            
            <h2 className="text-lg font-bold text-slate-800 mb-2">
              System Loading Interrupted
            </h2>
            
            <p className="text-sm font-semibold text-slate-400 mb-6 leading-relaxed">
              Unable to load data, please wait a moment and refresh.
            </p>

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-3 bg-[#186ade] hover:bg-blue-600 text-white text-xs font-bold rounded-2xl transition shadow-sm active:scale-[0.99]"
            >
              Refresh Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
