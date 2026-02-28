import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Clock, Smile, Scale, Users, Menu, X, Filter, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ease-out 
          ${scrolled ? 'top-4 md:top-6 px-4 md:px-8' : 'top-0 px-0'}
        `}
      >
        <div className={`mx-auto transition-all duration-500 flex items-center justify-between
          ${scrolled 
            ? 'bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-full px-6 py-3 max-w-6xl' 
            : 'bg-gradient-to-b from-[#050505]/95 to-transparent px-6 md:px-12 py-5 max-w-[1600px]'
          }`}
        >
          
          {/* Logo Group */}
          <Link to="/" className="flex items-center gap-3 group shrink-0 relative z-50">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-yellow/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500"></div>
              <img 
                src={logo} 
                alt="ThiraiView" 
                className={`w-auto object-contain transition-all duration-500 relative z-10 ${scrolled ? 'h-8 md:h-9' : 'h-10 md:h-12'} group-hover:scale-105`} 
              />
            </div>
          </Link>

          {/* Desktop Search Center */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-lg mx-8 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-yellow/0 via-brand-yellow/10 to-brand-yellow/0 rounded-full blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <input
              type="text"
              placeholder="Search by title, genre, or actor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-3 pl-14 rounded-full bg-white/5 border border-white/10 focus:border-brand-yellow/50 focus:bg-black/60 text-white font-display text-base placeholder-gray-500 transition-all outline-none shadow-inner relative z-10"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-yellow transition-colors z-20" size={18} />
          </form>

          {/* Desktop Right Nav (Icons Only for clean look if scrolled, else full text if space permits) */}
          <div className="hidden lg:flex items-center gap-2 lg:gap-3 shrink-0">
            <NavPill to="/moods" icon={<Smile size={18} />} label="Moods" scrolled={scrolled} />
            <NavPill to="/genre-blender" icon={<Filter size={18} />} label="Blender" scrolled={scrolled} />
            <NavPill to="/cast-mixer" icon={<Users size={18} />} label="Cast" scrolled={scrolled} />
            <NavPill to="/compare" icon={<Scale size={18} />} label="Compare" scrolled={scrolled} />
            
            <Link 
              to="/time-slot" 
              className={`flex items-center gap-2 rounded-full font-display font-medium transition-all uppercase tracking-widest ml-2
                ${scrolled 
                  ? 'px-4 py-2 bg-brand-yellow text-black hover:bg-white hover:text-black shadow-[0_0_15px_rgba(255,215,0,0.3)] text-xs' 
                  : 'px-5 py-2.5 bg-brand-yellow text-black hover:bg-white hover:text-black shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] text-xs'
                }`}
            >
              <Clock size={scrolled ? 14 : 16} />
              <span>Time Slot</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden relative z-50">
             <button 
               onClick={() => setIsMenuOpen(!isMenuOpen)} 
               className="text-white p-2.5 rounded-full hover:bg-white/10 border border-transparent hover:border-white/10 transition-all active:scale-95 bg-black/50 backdrop-blur-md"
             >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.2 }}>
                      <X size={24} />
                    </motion.div>
                  ) : (
                    <motion.div key="menu" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.2 }}>
                      <Menu size={24} />
                    </motion.div>
                  )}
                </AnimatePresence>
             </button>
          </div>
        </div>
      </motion.nav>

      {/* Cinematic Full-Screen Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ type: "tween", duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 bg-[#050505] z-40 flex flex-col pt-28 px-6 md:px-12 overflow-y-auto"
          >
            {/* Background Texture for Mobile Menu */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,215,0,0.05),transparent_50%)] pointer-events-none"></div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="max-w-2xl mx-auto w-full"
            >
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative mb-12">
                 <input
                   type="text"
                   placeholder="Search..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white text-xl font-display focus:border-brand-yellow/50 focus:bg-white/10 outline-none transition-all shadow-inner"
                 />
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
              </form>

              {/* Massive Typographic Links */}
              <div className="flex flex-col gap-2">
                 <MobileLink to="/" text="Home" delay={0.3} />
                 <MobileLink to="/moods" text="Mood Explorer" delay={0.35} />
                 <MobileLink to="/genre-blender" text="Genre Blender" delay={0.4} />
                 <MobileLink to="/cast-mixer" text="Cast Mixer" delay={0.45} />
                 <MobileLink to="/compare" text="Comparator" delay={0.5} />
                 <MobileLink to="/time-slot" text="Time Slot" highlight delay={0.55} />
              </div>
            </motion.div>
            
            {/* Footer decoration */}
            <div className="mt-auto py-10 opacity-30 text-center">
               <img src={logo} alt="ThiraiView" className="h-6 object-contain mx-auto grayscale" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Desktop Nav Pill Component
const NavPill = ({ to, icon, label, scrolled }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      className={`relative group flex items-center gap-2 rounded-full transition-all duration-300
        ${scrolled ? 'p-2 md:px-4 md:py-2' : 'px-4 py-2.5'}
        ${isActive ? 'bg-white/10 text-brand-yellow' : 'text-gray-300 hover:text-white hover:bg-white/5'}
      `}
    >
      <div className={`${isActive ? 'text-brand-yellow' : 'text-gray-400 group-hover:text-white'} transition-colors`}>
        {icon}
      </div>
      <span className={`font-display font-medium text-xs tracking-[0.15em] uppercase transition-all duration-300 origin-left
        ${scrolled ? 'hidden xl:block' : 'hidden md:block'}
      `}>
        {label}
      </span>
      
      {/* Active Indicator line */}
      {isActive && (
        <motion.div 
          layoutId="nav-indicator"
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-brand-yellow rounded-t-full shadow-[0_0_10px_rgba(255,215,0,0.5)]"
        />
      )}
    </Link>
  );
};

// Mobile Link Component
const MobileLink = ({ to, text, highlight, delay }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
    >
      <Link 
        to={to} 
        className={`group block py-4 px-2 border-b border-white/5 last:border-0 transition-colors
          ${highlight ? 'text-brand-yellow' : isActive ? 'text-white' : 'text-gray-500 hover:text-white'}
        `}
      >
         <div className="flex items-center justify-between">
           <span className="font-display font-medium text-4xl sm:text-5xl tracking-wide uppercase transition-transform duration-300 group-hover:translate-x-4">
             {text}
           </span>
           <div className={`h-3 w-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-4 group-hover:translate-x-0 ${highlight ? 'bg-brand-yellow shadow-[0_0_15px_rgba(255,215,0,0.5)]' : 'bg-white'}`}></div>
         </div>
      </Link>
    </motion.div>
  );
};

export default Navbar;
