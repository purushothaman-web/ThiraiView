import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Clock, Smile, Scale, Users, Menu, X } from "lucide-react";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled || isMenuOpen ? 'bg-brand-black/95 shadow-lg backdrop-blur-sm' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group z-50" onClick={() => setIsMenuOpen(false)}>
          <img 
            src={logo} 
            alt="ThiraiView" 
            className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105" 
          />
        </Link>

        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-md mx-8 relative">
          <input
            type="text"
            placeholder="Search titles, people, genres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 rounded-sm bg-black/40 border border-white/30 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow text-white placeholder-gray-400 transition-all"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </form>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6">
          <Link 
            to="/moods"
            className="flex items-center gap-2 !text-white hover:!text-brand-yellow font-bold transition-colors text-sm uppercase tracking-wide drop-shadow-md"
          >
            <Smile size={18} className="text-brand-yellow" /> Moods
          </Link>
          <Link 
            to="/cast-mixer"
            className="flex items-center gap-2 !text-white hover:!text-brand-yellow font-bold transition-colors text-sm uppercase tracking-wide drop-shadow-md"
          >
            <Users size={18} className="text-brand-yellow" /> Cast Mixer
          </Link>
          <Link 
            to="/compare"
            className="flex items-center gap-2 !text-white hover:!text-brand-yellow font-bold transition-colors text-sm uppercase tracking-wide drop-shadow-md"
          >
            <Scale size={18} className="text-brand-yellow" /> Compare
          </Link>
          <Link 
            to="/time-slot" 
            className="flex items-center gap-2 px-4 py-1.5 rounded bg-brand-yellow text-brand-black font-bold hover:bg-yellow-400 transition-colors text-sm uppercase"
          >
            <Clock size={16} />
            <span>Time Slot</span>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden z-50">
           <button 
             onClick={() => setIsMenuOpen(!isMenuOpen)} 
             className="bg-brand-yellow text-brand-black p-2 rounded-lg shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:bg-yellow-400 hover:scale-105 transition-all active:scale-95"
           >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
           </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop & Drawer */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed top-0 right-0 h-full w-80 bg-black border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col lg:hidden">
             
             {/* Drawer Header */}
             <div className="flex items-center justify-between p-6 border-b border-white/10">
                <span className="text-xl font-black text-brand-yellow uppercase tracking-tighter">Menu</span>
                <button onClick={() => setIsMenuOpen(false)} className="text-white hover:text-brand-yellow transition-colors">
                  <X size={28} />
                </button>
             </div>

             {/* Drawer Content */}
             <div className="flex-1 p-6 flex flex-col gap-8">
                
                {/* Search */}
                <form onSubmit={handleSearch} className="relative">
                   <input
                     type="text"
                     placeholder="Search..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all"
                   />
                   <Search className="absolute left-3 top-3.5 text-gray-500" size={18} />
                </form>

                {/* Links */}
                <div className="flex flex-col gap-4">
                   <Link 
                     to="/moods" 
                     onClick={() => setIsMenuOpen(false)}
                     className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/80 border border-white/10 hover:bg-zinc-800 hover:border-brand-yellow/50 transition-all group"
                   >
                     <div className="p-2 bg-white/5 rounded-lg group-hover:bg-brand-yellow/20 transition-colors">
                        <Smile size={24} className="text-brand-yellow" />
                     </div>
                     <span className="text-lg font-bold !text-white group-hover:!text-brand-yellow transition-colors">Moods</span>
                   </Link>
                   
                   <Link 
                     to="/cast-mixer" 
                     onClick={() => setIsMenuOpen(false)}
                     className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/80 border border-white/10 hover:bg-zinc-800 hover:border-brand-yellow/50 transition-all group"
                   >
                      <div className="p-2 bg-white/5 rounded-lg group-hover:bg-brand-yellow/20 transition-colors">
                        <Users size={24} className="text-brand-yellow" />
                      </div>
                      <span className="text-lg font-bold !text-white group-hover:!text-brand-yellow transition-colors">Cast Mixer</span>
                   </Link>

                   <Link 
                     to="/compare" 
                     onClick={() => setIsMenuOpen(false)}
                     className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/80 border border-white/10 hover:bg-zinc-800 hover:border-brand-yellow/50 transition-all group"
                   >
                      <div className="p-2 bg-white/5 rounded-lg group-hover:bg-brand-yellow/20 transition-colors">
                        <Scale size={24} className="text-brand-yellow" />
                      </div>
                      <span className="text-lg font-bold !text-white group-hover:!text-brand-yellow transition-colors">Compare</span>
                   </Link>
                </div>
             </div>

             {/* Drawer Footer */}
             <div className="p-6 border-t border-white/10 bg-black/20">
                <Link 
                  to="/time-slot" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-3 w-full bg-brand-yellow text-brand-black font-black uppercase py-4 rounded-xl hover:bg-yellow-400 transition-all active:scale-95 shadow-lg shadow-yellow-900/20"
                >
                  <Clock size={20} />
                  Find Time Slot
                </Link>
             </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
