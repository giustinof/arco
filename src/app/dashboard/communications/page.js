"use client";
import { useState } from "react";
import { FiSave, FiBold, FiItalic, FiList, FiLink, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";

const defaultMessages = {
  sms: `Gentile cliente,

La revisione del veicolo con targa {TARGA} è in scadenza. Contattaci per fissare un appuntamento:

📞 0123 456789
📱 0123 456789

Officina XYZ`,
  
  email: `<p>Buongiorno,</p>
<p>Ti informiamo che la revisione del veicolo con targa <strong>{TARGA}</strong> scade il prossimo mese.</p>
<p>Prenota il tuo appuntamento presso la nostra officina:</p>
<ul>
  <li>Telefono: 0123 456789</li>
  <li>WhatsApp: 0123 456789</li>
  <li>Email: info@officina.it</li>
</ul>
<p>Cordiali saluti,</p>
<p>Il team della nostra officina</p>`,

  whatsapp: `🚗 Ciao! 
La revisione del veicolo con {TARGA} scade il prossimo mese. 
Prenota ora al 0123 456789!`
};

const EmailEditorToolbar = ({ onFormat, onInsertTag }) => (
  <div className="flex flex-wrap gap-2 mb-3 p-2 bg-gray-50 rounded-lg border">
    <button 
      onClick={() => onFormat('bold')} 
      className="p-2 hover:bg-gray-100 rounded flex items-center gap-1 text-sm border border-gray-200"
    >
      <FiBold size={14} />
      <span>Grassetto</span>
    </button>
    <button 
      onClick={() => onFormat('italic')} 
      className="p-2 hover:bg-gray-100 rounded flex items-center gap-1 text-sm border border-gray-200"
    >
      <FiItalic size={14} />
      <span>Corsivo</span>
    </button>
    <button 
      onClick={() => onFormat('list')} 
      className="p-2 hover:bg-gray-100 rounded flex items-center gap-1 text-sm border border-gray-200"
    >
      <FiList size={14} />
      <span>Lista</span>
    </button>
    <button 
      onClick={() => onFormat('link')} 
      className="p-2 hover:bg-gray-100 rounded flex items-center gap-1 text-sm border border-gray-200"
    >
      <FiLink size={14} />
      <span>Link</span>
    </button>
    <button 
      onClick={() => onInsertTag('TARGA')}
      className="px-3 py-1 bg-white border border-blue-200 rounded hover:bg-blue-50 text-sm text-blue-700 flex items-center gap-1"
    >
      <FiPlus size={12} />
      <span>Targa</span>
    </button>
  </div>
);

export default function ComunicazioniPage() {
  const [messages, setMessages] = useState(defaultMessages);
  const [previewMode, setPreviewMode] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState("AB123CD");

  const handleChange = (type, value) => {
    setMessages(prev => ({ ...prev, [type]: value }));
  };

  const handleSave = (type) => {
    alert(`Modello ${type.toUpperCase()} salvato!\n\nIl sistema sostituirà automaticamente {TARGA} con la targa corretta.`);
  };

  const handleFormat = (type, format) => {
    const textarea = document.getElementById(`${type}-editor`);
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = messages[type].slice(start, end);
    
    let formattedText = '';
    switch(format) {
      case 'bold': formattedText = `<strong>${selectedText}</strong>`; break;
      case 'italic': formattedText = `<em>${selectedText}</em>`; break;
      case 'list': formattedText = `<ul><li>${selectedText}</li></ul>`; break;
      case 'link': formattedText = `<a href="https://">${selectedText}</a>`; break;
      default: formattedText = selectedText;
    }
    
    handleChange(type, messages[type].slice(0, start) + formattedText + messages[type].slice(end));
  };

  const handleInsertTag = (type, tag) => {
    const textarea = document.getElementById(`${type}-editor`);
    const start = textarea.selectionStart;
    handleChange(type, messages[type].slice(0, start) + `{${tag}}` + messages[type].slice(start));
  };

  const replacePlaceholders = (text) => {
    return text.replace(/{TARGA}/g, selectedVehicle);
  };

  const renderCard = (type, label) => (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border border-gray-200 rounded-xl p-6 shadow-sm w-full max-w-2xl bg-white mx-auto mb-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg text-gray-800">{label}</h2>
        <button
          onClick={() => handleSave(type)}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 text-sm"
        >
          <FiSave size={14} />
          Salva modello
        </button>
      </div>

      {type === 'email' && (
        <>

          {previewMode ? (
            <div 
              className="border rounded-lg p-4 min-h-[200px] bg-gray-50 prose max-w-none" 
              dangerouslySetInnerHTML={{ __html: replacePlaceholders(messages.email) }}
            />
          ) : (
            <div className="space-y-3">
              <EmailEditorToolbar 
                onFormat={(format) => handleFormat(type, format)}
                onInsertTag={() => handleInsertTag(type, 'TARGA')}
              />
              <textarea
                id={`${type}-editor`}
                value={messages.email}
                onChange={e => handleChange(type, e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-4 min-h-[200px] focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="Scrivi qui il modello di email..."
              />
            </div>
          )}

          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            {previewMode ? 'Modifica modello' : 'Visualizza anteprima'}
          </button>
        </>
      )}

      {type !== 'email' && (
        <div className="space-y-3">
          <textarea
            value={messages[type]}
            onChange={e => handleChange(type, e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-4 min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Scrivi qui il modello ${label.toLowerCase()}...`}
          />
          <div className="text-sm text-gray-500">
            Usa <code className="bg-gray-100 px-1 rounded">{'{TARGA}'}</code> per inserire automaticamente la targa del veicolo.
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Comunicazioni Scadenze</h1>
        <p className="text-gray-600">
          I messaggi verranno inviati <strong>automaticamente</strong> il 1° giorno del mese prima della scadenza.
          <br />
          Esempio: per una scadenza a febbraio, l'invio avverrà il 1° gennaio.
        </p>
      </div>

      <div className="space-y-6">
        {renderCard("sms", "Modello SMS")}
        {renderCard("email", "Modello Email")}
        {renderCard("whatsapp", "Modello WhatsApp")}
      </div>
    </motion.div>
  );
}