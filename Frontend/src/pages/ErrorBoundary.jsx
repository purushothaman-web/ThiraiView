import React from "react";
import { AlertOctagon, RefreshCcw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("UI Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 md:p-12 relative overflow-hidden">
          
          {/* Subtle Yellow Warning Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[50vh] bg-brand-yellow/5 blur-[150px] pointer-events-none rounded-full"></div>
          
          <div className="relative z-10 w-full max-w-4xl bg-[#0a0a0a] rounded-[2rem] border border-brand-yellow/20 shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row">
            
            {/* Warning Side Panel */}
            <div className="bg-brand-yellow/5 p-6 sm:p-8 md:p-12 border-b md:border-b-0 md:border-r border-brand-yellow/20 flex flex-col justify-between shrink-0 md:w-1/3">
               <div>
                 <div className="w-16 h-16 bg-brand-yellow/10 rounded-2xl flex items-center justify-center mb-6 border border-brand-yellow/20 shadow-inner">
                    <AlertOctagon className="text-brand-yellow animate-pulse" size={32} />
                 </div>
                 <h1 className="text-4xl sm:text-5xl font-display font-medium text-white tracking-widest uppercase leading-tight mb-4 drop-shadow-md break-words">
                   Frame<br/><span className="text-brand-yellow break-all">Dropped</span>
                 </h1>
                 <p className="text-brand-yellow/80 font-display text-sm tracking-widest uppercase border-l-2 border-brand-yellow/50 pl-3">
                   Projection Interrupted
                 </p>
               </div>

               <div className="hidden md:flex flex-col gap-2 mt-12 opacity-30">
                 {/* Decorative technical specs */}
                 <div className="h-1 w-full bg-brand-yellow/30 rounded"></div>
                 <div className="h-1 w-3/4 bg-brand-yellow/30 rounded"></div>
                 <div className="h-1 w-1/2 bg-brand-yellow/30 rounded"></div>
               </div>
            </div>

            {/* Content & Stack Trace Panel */}
            <div className="p-6 sm:p-8 md:p-12 flex-1 flex flex-col justify-center min-w-0">
              <h2 className="text-2xl font-display font-light text-gray-300 mb-6">
                A critical fault occurred in the projection room.
              </h2>
              
              {/* Terminal-style Stack Trace */}
              <div className="bg-[#050505] p-5 rounded-2xl mb-8 overflow-x-auto max-h-48 md:max-h-60 border border-white/5 shadow-inner relative group w-full">
                {/* Fake Terminal Header */}
                <div className="flex gap-2 mb-4 opacity-30">
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                  <div className="w-3 h-3 rounded-full bg-white"></div>
                </div>
                
                <p className="text-gray-300 font-mono text-sm mb-3 break-words whitespace-normal">
                  <span className="text-brand-yellow mr-2">$ ERR:</span> 
                  {this.state.error && this.state.error.toString()}
                </p>
                
                <pre className="text-gray-500 text-xs font-mono whitespace-pre-wrap break-all leading-relaxed">
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                <button 
                  onClick={() => window.location.reload()} 
                  className="flex-1 flex items-center justify-center gap-2 sm:gap-3 bg-brand-yellow hover:bg-white text-black font-display font-bold uppercase tracking-widest sm:tracking-[0.2em] px-4 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(255,215,0,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95 text-xs sm:text-base"
                >
                  <RefreshCcw size={18} /> Reload Projector
                </button>
                <a 
                  href="/" 
                  className="flex-1 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white border border-white/10 font-display font-bold uppercase tracking-widest sm:tracking-[0.2em] px-4 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 active:scale-95 text-center text-xs sm:text-base"
                >
                  Return to Base
                </a>
              </div>
            </div>

          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
