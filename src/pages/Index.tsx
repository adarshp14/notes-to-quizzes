
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Brain, Download, Upload, Settings, Play } from 'lucide-react';
import Header from '@/components/Header';

const Index = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  // Features data
  const features = [
    {
      icon: <Upload className="w-6 h-6 text-primary" />,
      title: 'Upload Notes',
      description: 'Import your study materials in PDF, TXT, or DOCX formats.'
    },
    {
      icon: <FileText className="w-6 h-6 text-primary" />,
      title: 'Type Notes',
      description: 'Enter your notes directly using our clean text editor.'
    },
    {
      icon: <Brain className="w-6 h-6 text-primary" />,
      title: 'Generate Quizzes',
      description: 'Create intelligent quizzes based on your study materials.'
    },
    {
      icon: <Settings className="w-6 h-6 text-primary" />,
      title: 'Customize',
      description: 'Choose question types and adjust difficulty levels.'
    },
    {
      icon: <Play className="w-6 h-6 text-primary" />,
      title: 'Interactive Mode',
      description: 'Take quizzes interactively with instant feedback.'
    },
    {
      icon: <Download className="w-6 h-6 text-primary" />,
      title: 'Export',
      description: 'Download quizzes as PDFs or printable formats.'
    }
  ];

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-0 right-0 h-72 bg-gradient-radial from-primary/5 to-transparent"></div>
          </div>
          
          <div className="page-container relative z-10 pt-16 pb-24 flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block mb-6"
            >
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Transform your learning
              </span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance max-w-4xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              Turn Your Notes Into <span className="text-primary">Interactive Quizzes</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg text-muted-foreground max-w-2xl mb-10 text-balance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              Upload your study materials or type notes directly, and let AI generate intelligent quizzes to 
              enhance your learning and retention.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link 
                to="/create" 
                className="button-shine bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 shadow-md flex items-center justify-center"
              >
                <FileText className="w-5 h-5 mr-2" />
                Create Quiz
              </Link>
              <Link 
                to="/quizzes" 
                className="bg-white hover:bg-gray-50 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white px-8 py-3 rounded-lg font-medium border border-gray-200 dark:border-gray-700 transition-all duration-300 shadow-sm flex items-center justify-center"
              >
                <Play className="w-5 h-5 mr-2" />
                Take Quiz
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="section-container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 dark:text-white">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A simple process designed to help you learn more effectively
              </p>
            </div>
            
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  className="p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-gray-800/50"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 dark:text-white">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
          <div className="section-container text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-3xl font-bold mb-4 dark:text-white">Ready to Transform Your Learning?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                Start creating custom quizzes from your study materials today and boost your retention.
              </p>
              <Link 
                to="/create" 
                className="button-shine bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 shadow-md inline-flex items-center"
              >
                <Brain className="w-5 h-5 mr-2" />
                Get Started Now
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 border-t border-gray-200 dark:border-gray-800">
          <div className="section-container">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Brain className="w-4 h-4" />
                </div>
                <span className="font-semibold text-lg dark:text-white">QuizCraft</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} QuizCraft. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
};

export default Index;
