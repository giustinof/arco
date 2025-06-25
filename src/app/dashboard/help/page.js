"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaWhatsapp, FaEnvelope, FaHeadset, FaQuestionCircle } from "react-icons/fa";

const faqs = [
  {
    question: "Come posso aggiungere una nuova prenotazione?",
    answer: "Vai nella sezione 'Prenotazioni' e clicca su 'Nuova prenotazione'. Compila tutti i campi richiesti e conferma per salvare la prenotazione nel sistema.",
    category: "Prenotazioni"
  },
  {
    question: "Come modifico i dati di un cliente?",
    answer: "Accedi alla sezione 'Clienti', trova il cliente che vuoi modificare utilizzando la barra di ricerca, clicca sull'icona di modifica e aggiorna le informazioni necessarie.",
    category: "Clienti"
  },
  {
    question: "Come aggiungo un nuovo veicolo?",
    answer: "Nella sezione 'Veicoli', clicca su 'Aggiungi veicolo'. Inserisci la targa e le informazioni richieste. Il sistema verificherà automaticamente se il veicolo è già presente nel database.",
    category: "Veicoli"
  },
  {
    question: "È possibile ricevere assistenza personalizzata?",
    answer: "Certamente! Il nostro team di supporto è disponibile dal lunedì al venerdì dalle 9:00 alle 18:00. Puoi contattarci tramite i pulsanti in fondo a questa pagina.",
    category: "Assistenza"
  },
  {
    question: "Come posso generare un report delle prenotazioni?",
    answer: "Nella sezione 'Prenotazioni', utilizza il filtro per selezionare il periodo di interesse e clicca sul pulsante 'Genera report' in alto a destra.",
    category: "Report"
  }
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Tutte");

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const categories = ["Tutte", ...new Set(faqs.map(faq => faq.category))];
  const filteredFaqs = activeCategory === "Tutte" 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <div className="flex items-start gap-4 mb-8">
        <div className="bg-blue-100 p-3 rounded-full">
          <FaQuestionCircle className="text-blue-600 text-2xl" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Centro Assistenza</h1>
          <p className="text-gray-600">Trova risposte alle tue domande o contatta il nostro team di supporto</p>
        </div>
      </div>

      {/* Filtri per categoria */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(category => (
          <motion.button
            key={category}
            onClick={() => setActiveCategory(category)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeCategory === category 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </motion.button>
        ))}
      </div>

      {/* Sezione FAQ */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-6 text-gray-700 flex items-center gap-2">
          <FaHeadset className="text-blue-500" />
          Domande Frequenti
        </h2>
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
            >
              <motion.div
                onClick={() => toggleFAQ(index)}
                className="p-4 cursor-pointer flex justify-between items-center"
                whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
              >
                <h3 className="font-medium text-gray-800">{faq.question}</h3>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaChevronDown className="text-gray-400" />
                </motion.div>
              </motion.div>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 text-gray-600">
                      <p className="mb-2">{faq.answer}</p>
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                        {faq.category}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Sezione Contatti */}
      <section className="bg-blue-50 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Hai ancora bisogno di aiuto?</h2>
        <p className="text-gray-600 mb-6">Il nostro team è pronto ad assisterti per qualsiasi domanda o problema.</p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <motion.a
            href="https://wa.me/391234567890"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -2 }}
            className="bg-green-100 hover:bg-green-200 text-green-800 p-4 rounded-lg flex items-center gap-3 transition-colors"
          >
            <div className="bg-green-500 text-white p-3 rounded-full">
              <FaWhatsapp size={20} />
            </div>
            <div>
              <h3 className="font-medium">Chatta con noi</h3>
              <p className="text-sm">Risposta immediata via WhatsApp</p>
            </div>
          </motion.a>

          <motion.a
            href="mailto:supporto@arco-system.it"
            whileHover={{ y: -2 }}
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-lg flex items-center gap-3 transition-colors"
          >
            <div className="bg-blue-500 text-white p-3 rounded-full">
              <FaEnvelope size={20} />
            </div>
            <div>
              <h3 className="font-medium">Invia una email</h3>
              <p className="text-sm">Rispondiamo entro 24 ore</p>
            </div>
          </motion.a>
        </div>
      </section>

      {/* Info aggiuntive */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Supporto disponibile dal lunedì al venerdì, 9:00 - 18:00</p>
        <p className="mt-1">© {new Date().getFullYear()} A.R.C.O. System - Tutti i diritti riservati</p>
      </div>
    </motion.div>
  );
}