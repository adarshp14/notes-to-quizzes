
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import CreateQuiz from "./pages/CreateQuiz";
import TakeQuiz from "./pages/TakeQuiz";
import Quizzes from "./pages/Quizzes";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isPageReloaded, setIsPageReloaded] = useState(false);

  useEffect(() => {
    // Check if the page is being reloaded
    if (performance.navigation && performance.navigation.type === 1) {
      setIsPageReloaded(true);
    } else if (window.performance) {
      // For modern browsers
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries.length > 0 && (navEntries[0] as any).type === 'reload') {
        setIsPageReloaded(true);
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner position="top-center" closeButton />
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/create" element={isPageReloaded ? <Navigate to="/" /> : <CreateQuiz />} />
                  <Route path="/take-quiz" element={isPageReloaded ? <Navigate to="/" /> : <TakeQuiz />} />
                  <Route path="/quizzes" element={isPageReloaded ? <Navigate to="/" /> : <Quizzes />} />
                  <Route path="/auth" element={isPageReloaded ? <Navigate to="/" /> : <Auth />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
