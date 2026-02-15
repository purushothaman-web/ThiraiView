import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("UI Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950">
          <div className="text-center max-w-lg bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">Something went wrong</h1>
            <div className="text-left bg-red-50 p-4 rounded mb-6 overflow-auto max-h-48">
              <p className="text-red-600 font-mono text-sm mb-2">{this.state.error && this.state.error.toString()}</p>
              <pre className="text-red-500 text-xs text-wrap">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
            </div>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => window.location.reload()} 
                className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
              >
                Reload
              </button>
              <a 
                href="/" 
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
              >
                Home
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


