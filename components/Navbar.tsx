
import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Github } from 'lucide-react';
import { OlanLogo } from './OlanLogo';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'How we Work', href: '#features' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Projects', href: '#pricing' },
    { name: 'Contact Us', href: '#faq' },
  ];

  return (
    <nav
      className={`fixed z-50 transition-all duration-500 ease-in-out left-1/2 -translate-x-1/2 ${
        isScrolled
          ? 'top-4 w-[85%] max-w-5xl bg-black/40 backdrop-blur-xl border border-white/10 py-2.5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)]'
          // : 'top-0 w-[95%] bg-transparent border-b border-transparent py-8 rounded-none'
					: 'top-4 w-[95%] max-w-6xl bg-black/40 backdrop-blur-xl border border-transparent py-1.5'
      }`}
    >
      <div className={`transition-all duration-500 ${isScrolled ? 'px-6' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div
            className={`flex items-center gap-3 transition-transform duration-500 origin-left ${
              isScrolled ? 'scale-90' : 'scale-100'
            }`}
          >
            <OlanLogo
              width={isScrolled ? 100 : 120}
              height={isScrolled ? 25 : 30}
              className="text-white transition-all duration-500"
            />
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-10">
            <div className="flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-all duration-300 relative group ${
                    isScrolled ? 'text-gray-300 hover:text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
            </div>

            <a
              href="https://github.com/olanai"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
                isScrolled ? 'text-gray-300 hover:text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Github className="w-5 h-5" />
              GitHub
            </a>

            <button
              onClick={() => document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' })}
              className={`bg-white text-black px-5 py-2 rounded-full text-xs font-bold transition-all duration-500 hover:bg-gray-200 flex items-center gap-2 group ${
                isScrolled ? 'scale-95' : 'scale-100'
              }`}
            >
              Build with us
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className={`md:hidden absolute left-0 right-0 mx-auto w-[95%] bg-black/95 backdrop-blur-2xl border border-white/10 p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-300 ${
          isScrolled ? 'top-[calc(100%+12px)] rounded-3xl' : 'top-full rounded-none'
        }`}>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-semibold text-gray-300 hover:text-white transition-colors"
            >
              {link.name}
            </a>
          ))}
          <a
            href="https://github.com/olanai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-lg font-semibold text-gray-300 hover:text-white transition-colors"
          >
            <Github className="w-5 h-5" />
            GitHub
          </a>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full bg-white text-black px-5 py-3 rounded-xl text-center font-bold shadow-xl"
          >
            Build with us
          </button>
        </div>
      )}
    </nav>
  );
};
