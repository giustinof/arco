// File: app/register/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaBuilding, FaEnvelope, FaPhone, FaLock, FaCheck, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import Particles from '../components/Particles';

export default function RegisterPage() {
  const router = useRouter();
  const controls = useAnimation();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    error: '',
    success: '',
  });

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
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value, 
      error: '', 
      success: '' 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const { name, email, phoneNumber, password, confirmPassword } = formData;

    // Animazione di caricamento
    await controls.start({
      scale: [1, 0.98, 1],
      transition: { duration: 0.3 }
    });

    if (password !== confirmPassword) {
      await controls.start({
        x: [0, -15, 15, -15, 15, 0],
        transition: { duration: 0.6 }
      });
      setFormData({ ...formData, error: "Le password non coincidono." });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phoneNumber, password, confirmPassword })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Errore nella registrazione.');

      // Animazione di successo
      await controls.start({
        scale: [1, 0.95, 1],
        transition: { duration: 0.4 }
      });

      setFormData({
        ...formData,
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        error: '',
        success: 'Registrazione completata! Reindirizzamento...'
      });

      // Animazione di uscita
      await new Promise(resolve => setTimeout(resolve, 1500));
      await controls.start({
        opacity: 0,
        y: 20,
        transition: { duration: 0.5 }
      });

      router.push('/login');

    } catch (err) {
      await controls.start({
        rotate: [0, 5, -5, 5, -5, 0],
        transition: { duration: 0.5 }
      });
      setFormData({ ...formData, error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Animazioni
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

  const inputIconVariants = {
    focus: { scale: 1.1, color: "#3B82F6" },
    blur: { scale: 1, color: "#9CA3AF" }
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
          animate={controls}
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
                className="bg-gradient-to-br from-blue-600 to-blue-400 p-4 rounded-2xl shadow-lg"
              >
                <FaBuilding className="h-10 w-10 text-white" />
              </motion.div>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-3xl font-bold text-white text-center mb-2"
            >
              Registrazione Officina
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-center text-blue-200 mb-6"
            >
              Crea il tuo account A.R.C.O.
            </motion.p>

            <AnimatePresence>
              {formData.error && (
                <motion.div 
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="bg-red-500/30 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm backdrop-blur-sm"
                >
                  {formData.error}
                </motion.div>
              )}
              
              {formData.success && (
                <motion.div 
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="bg-green-500/30 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-4 text-sm backdrop-blur-sm"
                >
                  {formData.success}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div variants={itemVariants} className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-1">
                  Nome Officina
                </label>
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.01 }}
                >
                  <motion.div 
                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    variants={inputIconVariants}
                    animate="blur"
                    whileFocus="focus"
                  >
                    <FaBuilding />
                  </motion.div>
                  <input
                    name="name"
                    id="name"
                    placeholder="Nome Officina"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">
                  Email
                </label>
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.01 }}
                >
                  <motion.div 
                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    variants={inputIconVariants}
                    animate="blur"
                    whileFocus="focus"
                  >
                    <FaEnvelope />
                  </motion.div>
                  <input
                    name="email"
                    id="email"
                    placeholder="email@esempio.com"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-4">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-white/80 mb-1">
                  Telefono
                </label>
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.01 }}
                >
                  <motion.div 
                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    variants={inputIconVariants}
                    animate="blur"
                    whileFocus="focus"
                  >
                    <FaPhone />
                  </motion.div>
                  <input
                    name="phoneNumber"
                    id="phoneNumber"
                    placeholder="+39 123 456 7890"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-1">
                  Password
                </label>
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.01 }}
                >
                  <motion.div 
                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    variants={inputIconVariants}
                    animate="blur"
                    whileFocus="focus"
                  >
                    <FaLock />
                  </motion.div>
                  <input
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-1">
                  Conferma Password
                </label>
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.01 }}
                >
                  <motion.div 
                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    variants={inputIconVariants}
                    animate="blur"
                    whileFocus="focus"
                  >
                    <FaLock />
                  </motion.div>
                  <input
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder="••••••••"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center relative overflow-hidden"
                  variants={buttonVariants}
                  initial="initial"
                  whileHover={!isLoading ? "hover" : {}}
                  whileTap="tap"
                  onHoverStart={() => setIsHovered(true)}
                  onHoverEnd={() => setIsHovered(false)}
                >
                  {isLoading && (
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
                    {isLoading ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Registrazione in corso...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="text"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center"
                      >
                        <FaCheck className="mr-2" /> Registrati ora
                      </motion.span>
                    )}
                  </AnimatePresence>
                  
                  {isHovered && !isLoading && (
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