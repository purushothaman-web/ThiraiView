import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Clapperboard } from "lucide-react";

export default function NotFound() {
  const location = useLocation();
  
  if (location.pathname === "/throw-error") {
      throw new Error("Simulated critical fault test the ErrorBoundary.");
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 md:px-12 pt-32 pb-12 relative overflow-hidden">
      
      {/* Immersive Background Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] md:w-3/4 h-1/2 bg-gradient-to-b from-brand-yellow/10 to-transparent blur-[120px] pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-12 md:gap-24">
        
        {/* Massive 404 Typography */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative text-center md:text-left shrink-0"
        >
           <h1 className="text-[7rem] sm:text-[10rem] md:text-[14rem] lg:text-[18rem] font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white/50 to-white/5 leading-none tracking-tighter drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
             404
           </h1>
           {/* Static Noise Overlay trick on text */}
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        </motion.div>

        {/* Content Box */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex-1 bg-white/5 backdrop-blur-2xl p-6 sm:p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] text-center md:text-left relative group hover:border-white/20 transition-colors duration-500 w-full"
        >
          <div className="w-16 h-16 bg-black/50 border border-white/10 rounded-full flex items-center justify-center mb-8 mx-auto md:mx-0 shadow-inner">
             <Clapperboard className="text-gray-400 group-hover:text-brand-yellow transition-colors duration-500" size={32} />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-display font-medium text-white mb-4 tracking-wide uppercase drop-shadow-md">
            Cut! Empty Set.
          </h2>
          
          <p className="text-gray-400 text-base md:text-xl font-light mb-6 border-l-2 border-brand-yellow/50 pl-4 font-display">
            The script ends here. The page you are looking for at <br/>
            <span className="text-white font-mono bg-black/40 px-2 py-1 rounded justify-center items-center inline-block mt-2 tracking-tighter text-sm border border-white/10 break-all max-w-full">{location.pathname}</span> 
            <br/>is missing from the archive.
          </p>
          
          <Link 
            to="/" 
            className="inline-flex items-center justify-center gap-3 bg-brand-yellow text-[#050505] font-display font-bold uppercase tracking-[0.2em] px-8 py-4 rounded-full mt-4 hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(255,215,0,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 w-full sm:w-auto"
          >
            Return to Screen 1
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
