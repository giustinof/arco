"use client";

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FaCar, FaCalendarAlt, FaBell, FaChartLine, FaSignInAlt, FaUserPlus } from 'react-icons/fa'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaCar className="text-blue-600 text-3xl" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              A.R.C.O.
            </span>
          </div>
          <div className="hidden md:flex space-x-6">
            <Link href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">
              Funzionalità
            </Link>
            <Link href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors">
              Come funziona
            </Link>
            <Link href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">
              Contatti
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link 
              href="/login" 
              className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <FaSignInAlt className="mr-2" /> Login
            </Link>
            <Link 
              href="/register" 
              className="flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-md"
            >
              <FaUserPlus className="mr-2" /> Registrati
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-32">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            >
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Archivio Revisioni e Controlli
              </span> per Officine
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8"
            >
              Gestisci in modo semplice ed efficiente le revisioni dei veicoli dei tuoi clienti,
              con notifiche automatiche per le scadenze e promozioni mirate.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <Link 
                href="/register" 
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg text-center font-medium flex items-center justify-center"
              >
                <FaUserPlus className="mr-2" /> Prova Gratis
              </Link>
              <Link 
                href="#how-it-works" 
                className="px-8 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-center font-medium"
              >
                Scopri di più
              </Link>
            </motion.div>
          </div>
          <div className="md:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200"
            >
              <div className="bg-gray-100 rounded-lg p-4 h-64 md:h-80 flex items-center justify-center">
                <div className="text-center">
                  <FaCar className="text-blue-500 text-6xl mx-auto mb-4" />
                  <p className="text-gray-500">Dashboard dimostrativa ARCO</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="container mx-auto px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center text-gray-900 mb-16"
          >
            Le nostre <span className="text-blue-600">funzionalità</span>
          </motion.h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FaCalendarAlt className="text-blue-500 text-3xl" />,
                title: "Gestione Revisioni",
                description: "Archivia e monitora tutte le revisioni dei veicoli in modo organizzato"
              },
              {
                icon: <FaBell className="text-blue-500 text-3xl" />,
                title: "Notifiche Automatiche",
                description: "Avvisa i clienti delle scadenze via email o SMS"
              },
              {
                icon: <FaCar className="text-blue-500 text-3xl" />,
                title: "Database Clienti",
                description: "Archivio completo di tutti i veicoli e proprietari"
              },
              {
                icon: <FaChartLine className="text-blue-500 text-3xl" />,
                title: "Report e Statistiche",
                description: "Analisi dettagliate per ottimizzare il tuo business"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center text-gray-900 mb-16"
          >
            Come funziona <span className="text-blue-600">ARCO</span>
          </motion.h2>
          
          <div className="max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Registra i clienti e i loro veicoli",
                description: "Inserisci i dati dei tuoi clienti e dei loro veicoli nel sistema ARCO"
              },
              {
                step: "2",
                title: "Programma le revisioni",
                description: "Imposta le scadenze per le revisioni periodiche di ogni veicolo"
              },
              {
                step: "3",
                title: "Ricevi notifiche",
                description: "Il sistema ti avviserà quando si avvicinano le scadenze"
              },
              {
                step: "4",
                title: "Notifica i clienti",
                description: "Invia promemoria automatici ai clienti via email o SMS"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`flex ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} items-start mb-12 last:mb-0`}
              >
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mr-6">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-6"
          >
            Pronto a rivoluzionare la gestione della tua officina?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl mb-8 max-w-2xl mx-auto"
          >
            Registrati ora e prova gratuitamente ARCO per 14 giorni.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link 
              href="/register" 
              className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors shadow-lg font-medium"
            >
              Inizia la tua prova gratuita
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <FaCar className="text-blue-400 text-2xl" />
                <span className="text-xl font-bold">A.R.C.O.</span>
              </div>
              <p className="text-gray-400 max-w-xs">
                Il sistema completo per la gestione delle revisioni veicoli nelle officine autorizzate.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Navigazione</h3>
                <ul className="space-y-2">
                  <li><Link href="#features" className="text-gray-400 hover:text-white transition-colors">Funzionalità</Link></li>
                  <li><Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">Come funziona</Link></li>
                  <li><Link href="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
                  <li><Link href="/register" className="text-gray-400 hover:text-white transition-colors">Registrati</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Contatti</h3>
                <ul className="text-gray-400 space-y-2">
                  <li>info@arco-system.it</li>
                  <li>+39 123 456 7890</li>
                  <li>Via delle Officine, 123</li>
                  <li>00100 Roma, Italia</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} A.R.C.O. System - Tutti i diritti riservati</p>
          </div>
        </div>
      </footer>
    </div>
  )
}