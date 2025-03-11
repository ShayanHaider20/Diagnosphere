
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Skin Disease', path: '/skin-disease' },
    { name: 'Check My Skin', path: '/skin-check' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out",
        isScrolled 
          ? "bg-black/80 backdrop-blur-md py-3 border-b border-white/10" 
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link 
          to="/" 
          className="text-white text-2xl font-bold flex items-center space-x-2 group"
        >
          <div className="w-8 h-8 bg-diagnosphere-primary rounded flex items-center justify-center overflow-hidden relative group-hover:scale-110 transition-transform duration-300">
            <div className="absolute w-full h-full bg-gradient-to-br from-diagnosphere-primary to-diagnosphere-accent animate-flow"></div>
            <span className="relative font-bold text-white">D</span>
          </div>
          <span className="relative">Diagnosphere</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "text-sm font-medium relative py-2 transition-colors duration-300 hover:text-diagnosphere-primary",
                location.pathname === link.path 
                  ? "text-diagnosphere-primary" 
                  : "text-white"
              )}
            >
              {link.name}
              <span 
                className={cn(
                  "absolute bottom-0 left-0 w-full h-0.5 bg-diagnosphere-primary transform scale-x-0 transition-transform duration-300",
                  location.pathname === link.path && "scale-x-100"
                )}
              />
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Link to="/login">
            <Button 
              variant="ghost" 
              className="text-white hover:text-diagnosphere-primary hover:bg-white/5"
            >
              Log in
            </Button>
          </Link>
          <Link to="/register">
            <Button 
              className="bg-diagnosphere-primary hover:bg-diagnosphere-primary/90 text-white transition-all duration-300 hover:shadow-lg hover:shadow-diagnosphere-primary/20"
            >
              Sign up
            </Button>
          </Link>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={cn(
          "fixed inset-0 bg-black bg-opacity-95 z-40 pt-20 px-6 transition-transform duration-300 md:hidden",
          isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <nav className="flex flex-col space-y-6 items-center mt-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "text-lg font-medium text-center w-full py-3 px-6 rounded-md transition-colors duration-300",
                location.pathname === link.path 
                  ? "text-diagnosphere-primary bg-white/5" 
                  : "text-white hover:bg-white/5"
              )}
            >
              {link.name}
            </Link>
          ))}
          <hr className="border-white/10 w-full my-4" />
          <Link 
            to="/login" 
            className="w-full text-center py-3 text-white hover:text-diagnosphere-primary transition-colors duration-300"
          >
            Log in
          </Link>
          <Link 
            to="/register" 
            className="w-full bg-diagnosphere-primary hover:bg-diagnosphere-primary/90 text-white py-3 rounded-md text-center transition-all duration-300"
          >
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
