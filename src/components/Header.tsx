
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { FileText, Brain, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [scrollY, setScrollY] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  
  // Update scroll position
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const email = session?.user?.email || '';
    if (!email) return 'U';
    return email.substring(0, 1).toUpperCase();
  };

  // Navigation items (only used when user is signed in)
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

          {/* Navigation (only render nav items if session exists) */}
          <nav className="hidden md:flex items-center space-x-1">
            {session && (
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
              </>
            )}
          </nav>

          {/* User Menu / CTA */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:bg-black/5 px-3 py-2 rounded-lg transition-colors">
                  <Avatar className="h-8 w-8 transition-all border-2 border-transparent hover:border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block font-medium text-sm">
                    {session.user.email?.split('@')[0] || 'User'}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/create" className="cursor-pointer flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Create Quiz</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/quizzes" className="cursor-pointer flex items-center">
                    <Brain className="mr-2 h-4 w-4" />
                    <span>My Quizzes</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link 
              to="/auth" 
              className="button-shine bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg font-medium text-sm flex items-center transition-all duration-300 shadow-sm"
            >
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
