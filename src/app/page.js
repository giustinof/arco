"use client";

import Link from "next/link";
import { motion, useAnimation } from "framer-motion";
import {
  FaCar,
  FaCalendarAlt,
  FaBell,
  FaChartLine,
  FaSignInAlt,
  FaUserPlus,
  FaMagic,
  FaSparkles,
} from "react-icons/fa";
import { useEffect, useState, useRef } from "react";

// Hook personalizzato per Intersection Observer
function useInView(ref, options = { threshold: 0.1 }) {
  const [isInView, setIsInView] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    if (ref.current && !observerRef.current) {
      observerRef.current = new IntersectionObserver(([entry]) => {
        setIsInView(entry.isIntersecting);
      }, options);

      observerRef.current.observe(ref.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [ref, options]);

  return isInView;
}

export default function Home() {
  const [isHovering, setIsHovering] = useState(false);
  const controls = useAnimation();
  const particlesRef = useRef();
  const inView = useInView(particlesRef);

  // Effetto particelle magiche
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 0.5 + 0.3,
    delay: Math.random() * 0.5,
  }));

  // Animazione quando gli elementi sono in vista
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-x-hidden">
      {/* Effetto particelle magiche */}
      <div
        ref={particlesRef}
        className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      >
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{
              opacity: [0, 0.4, 0],
              y: [0, -50],
              x: [0, Math.random() > 0.5 ? 10 : -10],
            }}
            transition={{
              duration: 5 + Math.random() * 10,
              delay: particle.delay,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
            }}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}rem`,
              height: `${particle.size}rem`,
              position: "absolute",
              background:
                "radial-gradient(circle, rgba(59,130,246,0.6) 0%, rgba(59,130,246,0) 70%)",
            }}
          />
        ))}
      </div>

      {/* Header con effetto glassmorphism */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="fixed w-full bg-white/80 backdrop-blur-md z-50 shadow-sm"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <FaCar className="text-blue-600 text-3xl" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                A.R.C.O.
              </span>
            </motion.div>

            <div className="hidden md:flex space-x-8">
              {["features", "how-it-works", "contact"].map((item, i) => (
                <motion.div
                  key={item}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={`#${item}`}
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium relative group"
                  >
                    {item === "features" && "Funzionalità"}
                    {item === "how-it-works" && "Come funziona"}
                    {item === "contact" && "Contatti"}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="flex space-x-4">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  href="/login"
                  className="flex items-center px-5 py-2 text-blue-600 hover:bg-blue-50 rounded-full transition-all border border-blue-100 font-medium"
                >
                  <FaSignInAlt className="mr-2" /> Login
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/register"
                  className="flex items-center px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white hover:from-blue-700 hover:to-blue-500 rounded-full transition-all shadow-lg hover:shadow-xl font-medium relative overflow-hidden"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <span className="relative z-10 flex items-center">
                    <FaUserPlus className="mr-2" /> Registrati
                  </span>
                  {isHovering && (
                    <>
                      <motion.span
                        className="absolute inset-0 bg-white opacity-10"
                        initial={{ x: -100 }}
                        animate={{ x: 500 }}
                        transition={{ duration: 0.8 }}
                      />
                      <motion.span
                        className="absolute inset-0 bg-white opacity-05"
                        initial={{ x: -100 }}
                        animate={{ x: 500 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                    </>
                  )}
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-32 pb-20 md:pt-48 md:pb-32 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "backOut" }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Archivio Revisioni
              </span>{" "}
              <br />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                e{" "}
                <span className="relative inline-block">
                  Controlli
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute bottom-0 left-0 w-full h-1 bg-blue-400 origin-left"
                  />
                </span>
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-xl text-gray-600 mb-8 max-w-lg"
            >
              Trasforma la gestione della tua officina con la potenza di ARCO.
              <span className="text-blue-500 font-medium">
                {" "}
                Magia digitale
              </span>{" "}
              per tenere tutto sotto controllo.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6"
            >
              <motion.div
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/register"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl hover:from-blue-700 hover:to-blue-500 transition-all shadow-xl hover:shadow-2xl text-center font-medium flex items-center justify-center relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    <FaSparkles className="mr-3 animate-pulse" /> Prova Gratis
                    Ora
                  </span>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      repeat: Infinity,
                      repeatType: "reverse",
                      duration: 2,
                    }}
                    className="absolute -inset-1 bg-blue-400 rounded-xl opacity-20 blur-md"
                  />
                </Link>
              </motion.div>

              <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="#how-it-works"
                  className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all text-center font-medium flex items-center justify-center group"
                >
                  <span className="group-hover:scale-105 transition-transform">
                    Scopri la magia <FaMagic className="inline ml-2" />
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          <div className="md:w-1/2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="bg-white p-6 rounded-3xl shadow-2xl border border-gray-200 relative z-10"
            >
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 h-64 md:h-80 flex items-center justify-center overflow-hidden relative">
                <div className="text-center relative z-10">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <FaCar className="text-blue-500 text-6xl mx-auto mb-4" />
                  </motion.div>
                  <p className="text-gray-600 font-medium">
                    Dashboard ARCO in azione
                  </p>
                </div>

                {/* Elementi decorativi */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 0.2, y: "100vh" }}
                      transition={{
                        duration: 10 + Math.random() * 10,
                        delay: Math.random() * 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute text-blue-300"
                      style={{
                        left: `${Math.random() * 100}%`,
                        fontSize: `${Math.random() * 20 + 10}px`,
                      }}
                    >
                      {i % 2 === 0 ? "⚙️" : "🔧"}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Effetti 3D */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 0.3 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-400 rounded-full blur-3xl -z-10"
            />
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 0.3 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600 rounded-full blur-3xl -z-10"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-24 bg-white relative overflow-hidden"
      >
        {/* Effetto background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-50 to-transparent opacity-50" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-50 to-transparent opacity-50" />
        </div>

        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Scopri la <span className="text-blue-600">magia</span> di ARCO
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tutto ciò di cui hai bisogno per gestire la tua officina in
              un'unica piattaforma
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FaCalendarAlt className="text-blue-500 text-3xl" />,
                title: "Gestione Revisioni",
                description:
                  "Archivia e monitora tutte le revisioni dei veicoli in modo organizzato",
                color: "from-blue-400 to-blue-600",
              },
              {
                icon: <FaBell className="text-blue-500 text-3xl" />,
                title: "Notifiche Automatiche",
                description: "Avvisa i clienti delle scadenze via email o SMS",
                color: "from-purple-400 to-purple-600",
              },
              {
                icon: <FaCar className="text-blue-500 text-3xl" />,
                title: "Database Clienti",
                description:
                  "Archivio completo di tutti i veicoli e proprietari",
                color: "from-emerald-400 to-emerald-600",
              },
              {
                icon: <FaChartLine className="text-blue-500 text-3xl" />,
                title: "Report e Statistiche",
                description:
                  "Analisi dettagliate per ottimizzare il tuo business",
                color: "from-amber-400 to-amber-600",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
                <div
                  className={`bg-gradient-to-br ${feature.color} text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-md`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
                <motion.div whileHover={{ x: 5 }} className="mt-4 inline-block">
                  <Link
                    href="#how-it-works"
                    className="text-blue-600 font-medium flex items-center group"
                  >
                    Scopri di più
                    <svg
                      className="ml-2 transition-transform group-hover:translate-x-1"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M1 8H15M15 8L8 1M15 8L8 15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50 relative"
      >
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full filter blur-3xl opacity-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-200 rounded-full filter blur-3xl opacity-20" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Come funziona la <span className="text-blue-600">magia</span> di
              ARCO
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Semplici passi per rivoluzionare la gestione della tua officina
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto relative">
            {/* Linea della timeline */}
            <div className="absolute left-6 md:left-1/2 top-0 h-full w-0.5 bg-blue-200 transform -translate-x-1/2" />

            {[
              {
                step: "1",
                title: "Registra clienti e veicoli",
                description:
                  "Inserisci i dati dei tuoi clienti e dei loro veicoli nel sistema ARCO",
                icon: <FaUserPlus className="text-white" />,
              },
              {
                step: "2",
                title: "Programma le revisioni",
                description:
                  "Imposta le scadenze per le revisioni periodiche di ogni veicolo",
                icon: <FaCalendarAlt className="text-white" />,
              },
              {
                step: "3",
                title: "Ricevi notifiche",
                description:
                  "Il sistema ti avviserà quando si avvicinano le scadenze",
                icon: <FaBell className="text-white" />,
              },
              {
                step: "4",
                title: "Notifica i clienti",
                description:
                  "Invia promemoria automatici ai clienti via email o SMS",
                icon: <FaCar className="text-white" />,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`flex ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} items-start mb-16 last:mb-0`}
              >
                <div className="flex-shrink-0 relative">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg relative z-10"
                  >
                    {item.icon}
                  </motion.div>
                  {index !== 3 && (
                    <motion.div
                      initial={{ scaleY: 0, originY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                      viewport={{ once: true }}
                      className="absolute top-12 left-1/2 w-0.5 h-16 bg-blue-400 transform -translate-x-1/2"
                    />
                  )}
                </div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className={`flex-1 ${index % 2 === 0 ? "md:ml-8" : "md:mr-8"} mt-2 bg-white p-6 rounded-xl shadow-md border border-gray-100`}
                >
                  <div className="flex items-center mb-3">
                    <span className="text-blue-600 font-bold text-xl mr-3">
                      {item.step}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-gray-600">{item.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-r from-blue-600 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
          <motion.div
            animate={{ x: ["-10%", "10%", "-10%"], y: ["-5%", "5%", "-5%"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]"
          />
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-6"
          >
            Pronto a <span className="text-yellow-300">rivoluzionare</span> la
            tua officina?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl mb-10 max-w-2xl mx-auto"
          >
            Registrati ora e prova gratuitamente ARCO per 14 giorni senza
            impegno.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row justify-center gap-6"
          >
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/register"
                className="px-10 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all shadow-2xl hover:shadow-3xl text-lg font-bold inline-block"
              >
                Inizia la prova gratuita
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="#contact"
                className="px-10 py-4 border-2 border-white text-white rounded-xl hover:bg-white/10 transition-all text-lg font-medium inline-block"
              >
                Contattaci
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="bg-gray-900 text-white py-16 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5" />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row justify-between gap-12"
          >
            <div className="max-w-sm">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-3 mb-6"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <FaCar className="text-blue-400 text-3xl" />
                </motion.div>
                <span className="text-2xl font-bold">A.R.C.O.</span>
              </motion.div>

              <p className="text-gray-400 mb-6">
                Il sistema completo per la gestione delle revisioni veicoli
                nelle officine autorizzate. Magia digitale per il tuo business
                automobilistico.
              </p>

              <div className="flex space-x-4">
                {["twitter", "facebook", "instagram", "linkedin"].map(
                  (social) => (
                    <motion.a
                      key={social}
                      href="#"
                      whileHover={{ y: -3, scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 transition-all"
                    >
                      <span className="sr-only">{social}</span>
                      {/* Icone social sostituite con emoji per semplicità */}
                      {social === "twitter" && "🐦"}
                      {social === "facebook" && "👍"}
                      {social === "instagram" && "📷"}
                      {social === "linkedin" && "💼"}
                    </motion.a>
                  ),
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div>
                <h3 className="text-lg font-bold mb-6 text-white">
                  Navigazione
                </h3>
                <ul className="space-y-4">
                  {["features", "how-it-works", "pricing", "contact"].map(
                    (item) => (
                      <motion.li key={item} whileHover={{ x: 5 }}>
                        <Link
                          href={`#${item}`}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {item === "features" && "Funzionalità"}
                          {item === "how-it-works" && "Come funziona"}
                          {item === "pricing" && "Prezzi"}
                          {item === "contact" && "Contatti"}
                        </Link>
                      </motion.li>
                    ),
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-6 text-white">Risorse</h3>
                <ul className="space-y-4">
                  {["blog", "documentation", "support", "community"].map(
                    (item) => (
                      <motion.li key={item} whileHover={{ x: 5 }}>
                        <Link
                          href={`/${item}`}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {item === "blog" && "Blog"}
                          {item === "documentation" && "Documentazione"}
                          {item === "support" && "Supporto"}
                          {item === "community" && "Community"}
                        </Link>
                      </motion.li>
                    ),
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-6 text-white">Contatti</h3>
                <ul className="space-y-4 text-gray-400">
                  <motion.li whileHover={{ x: 5 }}>
                    <a
                      href="mailto:info@arco-system.it"
                      className="hover:text-white transition-colors"
                    >
                      info@arco-system.it
                    </a>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }}>
                    <a
                      href="tel:+391234567890"
                      className="hover:text-white transition-colors"
                    >
                      +39 123 456 7890
                    </a>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }}>
                    <span>Via delle Officine, 123</span>
                  </motion.li>
                  <motion.li whileHover={{ x: 5 }}>
                    <span>00100 Roma, Italia</span>
                  </motion.li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
            className="border-t border-gray-800 mt-16 pt-8 text-center text-gray-500"
          >
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p>
                © {new Date().getFullYear()} A.R.C.O. System - Tutti i diritti
                riservati
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors"
                >
                  Termini di Servizio
                </Link>
                <Link
                  href="/cookies"
                  className="hover:text-white transition-colors"
                >
                  Cookie Policy
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
