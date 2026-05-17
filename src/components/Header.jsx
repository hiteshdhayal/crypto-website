import React from 'react';
import { Sparkles } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white border-b border-brand-border py-4 px-8 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        {/* CRYPTO genie Logo */}
        <div className="flex items-center space-x-2.5 cursor-pointer group">
          <div className="bg-gradient-to-tr from-[#186ade] to-[#8a3ffc] p-2 rounded-xl text-white shadow-md group-hover:scale-105 transition-all duration-300">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex items-baseline space-x-1 font-sans">
            <span className="text-[#0b1329] font-black text-xl tracking-wider uppercase">
              CRYPTO
            </span>
            <span className="bg-gradient-to-r from-[#186ade] to-[#8a3ffc] bg-clip-text text-transparent font-black text-xl tracking-tight lowercase">
              genie
            </span>
          </div>
        </div>

        {/* Dashboard Title / Navigation */}
        <div className="flex items-center space-x-6 text-sm font-medium text-slate-500">
          <span className="text-brand-blue cursor-pointer border-b-2 border-brand-blue pb-1">
            Dashboard
          </span>
          <span className="hover:text-slate-800 transition cursor-pointer">Markets</span>
          <span className="hover:text-slate-800 transition cursor-pointer">Portfolio</span>
          <span className="hover:text-slate-800 transition cursor-pointer">Exchange</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
