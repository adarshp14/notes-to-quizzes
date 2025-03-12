
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { FileText, Brain, Play, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Header = () => {
  const [scrollY, setScrollY] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();
  
  // Update scroll position
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
      navigate('/');
    }
  };

  // Navigation items
  const navItems = [
    { name: 'Create', path: '/create', icon: <FileText className="w-4 h-4 mr-2" /> },
    { name: 'My Quizzes', path: '/quizzes', icon: <Brain className="w-4 h-4 mr-2" /> },
  ];

  return (
    <motion.header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300",
        scrollY > 10 ? "glass shadow-sm border-b border-white/10" : ""
      )}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/15 transition-colors duration-300">
              <Brain className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">QuizCraft</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {session ? (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={cn(
                      "px-4 py-2 rounded-lg font-medium text-sm flex items-center transition-all duration-300",
                      location.pathname === item.path 
                        ? "bg-primary text-white" 
                        : "hover:bg-black/5 text-foreground/80 hover:text-foreground"
                    )}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg font-medium text-sm flex items-center transition-all duration-300 hover:bg-black/5 text-foreground/80 hover:text-foreground"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link 
                to="/auth" 
                className="px-4 py-2 rounded-lg font-medium text-sm flex items-center transition-all duration-300 hover:bg-black/5 text-foreground/80 hover:text-foreground"
              >
                Sign In
              </Link>
            )}
          </nav>

          {/* CTA Button */}
          <Link 
            to={session ? "/create" : "/auth"} 
            className="button-shine bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg font-medium text-sm flex items-center transition-all duration-300 shadow-sm"
          >
            <Play className="w-4 h-4 mr-2" />
            {session ? 'Start Quiz' : 'Sign In'}
          </Link>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
