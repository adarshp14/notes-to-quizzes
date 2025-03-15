
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Brain, Mail, LogIn, KeyRound, UserRound, AlertCircle } from 'lucide-react';
import { Provider } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from "@/components/ui/alert";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { session } = useAuth();
  
  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) {
          setErrorMessage(error.message);
          toast.error(error.message);
        } else {
          toast.success('Account created successfully! Please check your email to confirm your registration.');
        }
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });

        if (error) {
          setErrorMessage(error.message);
          toast.error(error.message);
        } else if (data.user) {
          toast.success('Logged in successfully!');
          navigate('/');
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An error occurred during authentication';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: Provider) => {
    try {
      setErrorMessage(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        setErrorMessage(error.message);
        toast.error(error.message);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An error occurred during authentication';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl shadow-lg"
      >
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
            <Brain className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{isSignUp ? 'Create an account' : 'Welcome back'}</h2>
          <p className="text-muted-foreground mt-2">
            {isSignUp ? 'Sign up to start creating quizzes' : 'Sign in to your account'}
          </p>
        </div>

        {errorMessage && (
          <Alert variant="destructive" className="animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          <Button 
            variant="outline" 
            onClick={() => handleOAuthSignIn('google')}
            className="w-full py-6 text-base font-medium transition-all hover:bg-muted/80 hover:scale-[1.01]"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => handleOAuthSignIn('azure')}
            className="w-full py-6 text-base font-medium transition-all hover:bg-muted/80 hover:scale-[1.01]"
          >
            <Mail className="mr-2 h-5 w-5" />
            Continue with Microsoft
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full py-6 text-base transition-all hover:scale-[1.02] bg-gradient-to-r from-primary to-primary/90" 
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </div>
            ) : (
              <>
                <LogIn className="mr-2 h-5 w-5" />
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </>
            )}
          </Button>
        </form>

        <div className="text-center pt-2">
          <button 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage(null);
            }} 
            className="text-sm text-primary hover:underline font-medium"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
