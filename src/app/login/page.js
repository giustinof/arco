'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaLock, FaSpinner, FaCar } from 'react-icons/fa';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import Particles from '../components/Particles';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimation();
  const router = useRouter();

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState('')

  // Effetto particelle solo su desktop
  const [showParticles, setShowParticles] = useState(false);
  useEffect(() => {
    setShowParticles(window.innerWidth > 768);
    const handleResize = () => {
      setShowParticles(window.innerWidth > 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) {
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
      }).then(() => setError(''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password.trim(),
    });

    setLoading(false);

    if (error) {
      const messages = {
        'Invalid login credentials': 'Credenziali non valide',
        'Email not confirmed': 'Email non verificata',
      };

      setError(messages[error.message] || 'Errore durante il login');

      await controls.start({
        x: [0, -15, 15, -15, 15, 0],
        transition: { duration: 0.6 },
      });
      
      return;
    }

    setSuccess('Login effettuato! Reindirizzamento...');
    setForm({ email: '', password: '' });
    await controls.start({ scale: [1, 0.9, 1], transition: { duration: 0.4 } });

    setTimeout(() => {
      router.push('/dashboard/appointments');
    }, 1500);
  };


  // Animazioni
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  };

  const logoVariants = {
    initial: { rotate: 0, scale: 1 },
    hover: { 
      rotate: [0, 10, -10, 0],
      scale: [1, 1.1, 1],
      transition: { 
        duration: 0.8,
        ease: "easeInOut"
      }
    }
  };

  const buttonVariants = {
    initial: { scale: 1, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" },
    hover: { 
      scale: 1.03,
      boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.15)",
      transition: { 
        duration: 0.3,
        yoyo: Infinity,
        ease: "easeOut"
      }
    },
    tap: { scale: 0.98 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 overflow-hidden relative">
      {showParticles && <Particles />}
      
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md relative z-10"
      >
        <motion.div 
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20"
          whileHover={{ 
            scale: 1.005,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-8">
            <motion.div 
              variants={itemVariants}
              className="flex justify-center mb-6"
            >
              <motion.div
                variants={logoVariants}
                initial="initial"
                whileHover="hover"
                animate={controls}
                className="bg-gradient-to-br from-blue-600 to-blue-400 p-4 rounded-2xl shadow-lg"
              >
                <FaCar className="h-10 w-10 text-white" />
              </motion.div>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-3xl font-bold text-white text-center mb-2"
            >
              Accesso A.R.C.O.
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-center text-blue-200 mb-6"
            >
              Gestione officina automobilistica
            </motion.p>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="bg-red-500/30 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm backdrop-blur-sm"
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="bg-green-500/30 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-4 text-sm backdrop-blur-sm"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
              <motion.div variants={itemVariants} className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">
                  Email
                </label>
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.01 }}
                  whileFocus={{ scale: 1.02 }}
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="tu@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-1">
                  Password
                </label>
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center relative overflow-hidden"
                  variants={buttonVariants}
                  initial="initial"
                  whileHover={!loading ? "hover" : {}}
                  whileTap="tap"
                  animate={controls}
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                >
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-blue-700/50 backdrop-blur-sm flex items-center justify-center"
                    >
                      <FaSpinner className="animate-spin mr-2" />
                    </motion.div>
                  )}
                  
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Accesso in corso...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="text"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        Accedi al sistema
                      </motion.span>
                    )}
                  </AnimatePresence>
                  
                  {isHovered && !loading && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ 
                            opacity: [0, 1, 0],
                            scale: [0, 1.2, 0],
                            x: Math.random() * 40 - 20,
                            y: Math.random() * 40 - 20
                          }}
                          transition={{ 
                            duration: 1,
                            delay: i * 0.1,
                            repeat: Infinity,
                            repeatDelay: 1.5
                          }}
                          className="absolute w-2 h-2 bg-white rounded-full"
                        />
                      ))}
                    </motion.div>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </div>

          <motion.div 
            variants={itemVariants}
            className="bg-white/5 px-8 py-4 text-center border-t border-white/10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-sm text-white/60">
              © {new Date().getFullYear()} A.R.C.O. System - Alpha 0.1
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}