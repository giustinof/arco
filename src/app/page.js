"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaCar, FaCalendarAlt, FaBell, FaChartLine, FaSignInAlt, FaUserPlus } from "react-icons/fa";
import Particles from "./components/Particles";
import { useState, useEffect } from "react";

export default function Home() {
  const [showParticles, setShowParticles] = useState(false);
  
  useEffect(() => {
    setShowParticles(window.innerWidth > 768);
    const handleResize = () => {
      setShowParticles(window.innerWidth > 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animazioni
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
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

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.03,
      boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.15)",
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    },
    tap: { scale: 0.98 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      {showParticles && <Particles />}
      
      {/* Navigation */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="sticky top-0 bg-white/5 backdrop-blur-md z-50 border-b border-white/10"
      >
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 group"
          >
            <motion.div
              whileHover={{ rotate: [0, 10, -10, 0] }}
              className="rounded-xl"
            >
              <img 
                src="/logo.jpg" 
                alt="Logo ARCO" 
                className="rounded-3xl shadow-2xl border border-white/10 w-12" 
              />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">A.R.C.O.</span>
          </motion.div>
          
          <motion.nav 
            className="hidden md:flex space-x-6 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link href="#features" className="hover:text-blue-300 transition">Funzionalità</Link>
            <Link href="#process" className="hover:text-blue-300 transition">Processo</Link>
            <Link href="#contact" className="hover:text-blue-300 transition">Contatti</Link>
          </motion.nav>
          
          <motion.div 
            className="flex space-x-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/login" className="flex items-center px-4 py-2 text-blue-300 hover:bg-white/5 rounded-lg transition border border-white/10">
              <FaSignInAlt className="mr-2" /> Login
            </Link>
            <motion.div
              whileHover="hover"
              variants={buttonVariants}
            >
              <Link href="/register" className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg transition shadow">
                <FaUserPlus className="mr-2" /> Registrati
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 py-24 container mx-auto relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="md:w-1/2 mb-12 md:mb-0"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-5xl font-extrabold leading-tight mb-4"
          >
            La <span className="bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">rivoluzione</span> per la tua officina.
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl text-blue-300 font-semibold mb-2"
          >
            A.R.C.O. - Archivio Revisioni e Controlli per Officine
          </motion.p>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl text-white/80 mb-8"
          >
            Gestisci revisioni, clienti e notifiche in modo rapido, intelligente ed efficace.
          </motion.p>
          
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4"
          >
            <motion.div
              whileHover="hover"
              variants={buttonVariants}
            >
              <Link href="/register" className="block px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:to-blue-400 transition shadow-lg text-center font-medium">
                Prova Gratis
              </Link>
            </motion.div>
            
            <motion.div
              whileHover="hover"
              variants={buttonVariants}
            >
              <Link href="#features" className="block px-8 py-3 border border-white/20 text-white rounded-lg hover:bg-white/5 transition text-center font-medium">
                Scopri di più
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="md:w-1/2 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-20 -z-10"></div>
          <img 
            src="/dashboard-mockup.png" 
            alt="Dashboard ARCO" 
            className="rounded-3xl shadow-2xl border border-white/10" 
          />
        </motion.div>
      </section>

      {/* Meaning Section */}
      <section className="py-16 bg-white/5 backdrop-blur-sm border-t border-b border-white/10">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-4xl font-bold mb-6"
          >
            Cosa significa <span className="text-blue-400">A.R.C.O.</span>?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-xl text-white/80 max-w-2xl mx-auto mb-4"
          >
            A.R.C.O. è l&apos;acronimo di <strong className="text-blue-300">Archivio Revisioni e Controlli per Officine</strong>: il sistema pensato per semplificare il lavoro quotidiano delle officine.
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-lg text-white/60 max-w-2xl mx-auto"
          >
            Tutto sotto controllo, tutto a portata di click.
          </motion.p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-gradient-to-br from-gray-900/80 via-blue-900/80 to-purple-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-4xl font-bold text-center mb-16"
          >
            Perché scegliere <span className="text-blue-400">A.R.C.O.</span>
          </motion.h2>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {[
              { icon: <FaCalendarAlt className="text-4xl text-blue-400" />, title: "Gestione Revisioni", desc: "Tieni sotto controllo tutte le revisioni con facilità." },
              { icon: <FaBell className="text-4xl text-blue-400" />, title: "Notifiche Automatiche", desc: "Mai più scadenze dimenticate. Avvisa i tuoi clienti automaticamente." },
              { icon: <FaCar className="text-4xl text-blue-400" />, title: "Database Clienti", desc: "Tutti i veicoli e i clienti sempre a portata di click." },
              { icon: <FaChartLine className="text-4xl text-blue-400" />, title: "Statistiche Smart", desc: "Analizza le performance della tua officina con grafici intuitivi." },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  y: -5,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  transition: { duration: 0.3 }
                }}
                className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-blue-400/30 transition"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/70">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="py-24 bg-gradient-to-br from-gray-900/50 via-blue-900/50 to-purple-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-4xl font-bold text-center mb-16"
          >
            Il processo <span className="text-blue-400">semplice</span> e veloce
          </motion.h2>

          <div className="relative max-w-3xl mx-auto">
            {[
              { step: "1", title: "Registra clienti e veicoli", desc: "Inserisci facilmente i dati nel sistema." },
              { step: "2", title: "Programma revisioni", desc: "Imposta le date in pochi secondi." },
              { step: "3", title: "Ricevi notifiche", desc: "ARCO ti ricorda ogni scadenza importante." },
              { step: "4", title: "Avvisa i clienti", desc: "Invia promemoria automatici via email e SMS." },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'} mb-12`}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 p-6 rounded-xl border border-white/10 hover:border-blue-400/30 w-full md:w-2/3 backdrop-blur-sm"
                >
                  <div className="flex items-center mb-2">
                    <motion.div 
                      whileHover={{ rotate: 10 }}
                      className="bg-gradient-to-br from-blue-600 to-blue-400 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold mr-4"
                    >
                      {item.step}
                    </motion.div>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-white/70">{item.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-center sticky bottom-0 z-40 border-t border-white/10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-3xl font-bold mb-4">Prova A.R.C.O. gratuitamente</h2>
          <p className="text-lg mb-6">Registrati ora e scopri come semplificare la gestione delle revisioni.</p>
          <motion.div
            whileHover="hover"
            variants={buttonVariants}
            className="inline-block"
          >
            <Link href="/register" className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition shadow-lg font-medium">
              Inizia subito
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900/80 backdrop-blur-md text-gray-400 py-12 border-t border-white/10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mb-8 md:mb-0"
          >
            <div className="flex items-center space-x-2 mb-4">
              <div className="rounded-lg">
                <img 
                  src="/logo.jpg" 
                  alt="Logo ARCO" 
                  className="rounded-3xl shadow-2xl border border-white/10 w-12" 
                />
              </div>
              <span className="text-xl font-bold text-white">A.R.C.O.</span>
            </div>
            <p>Il gestionale intelligente per officine.</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col space-y-4"
          >
            <a href="mailto:info@arco-system.it" className="hover:text-white transition">info@arco-system.it</a>
            <p>+39 371 341 1932</p>
            <p>Mola di bari, BA</p>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="border-t border-gray-700 mt-8 pt-4 text-center"
        >
          <p>© {new Date().getFullYear()} A.R.C.O. - by Studio200. Tutti i diritti riservati</p>
        </motion.div>
      </footer>
    </div>
  );
}