"use client";

import { useState } from "react";

const defaultMessages = {
  sms: "Gentile cliente, la tua revisione è in scadenza. Contattaci per fissare un appuntamento.",
  email: "Buongiorno, desideriamo ricordarti che la revisione del tuo veicolo è prossima alla scadenza. Prenota ora il tuo appuntamento presso la nostra officina.",
  whatsapp: "🚗 Ciao! La tua revisione sta per scadere. Scrivici per prenotare subito!"
};

export default function ComunicazioniPage() {
  const [messages, setMessages] = useState(defaultMessages);

  const handleChange = (type, value) => {
    setMessages(prev => ({ ...prev, [type]: value }));
  };

  const handleSave = (type) => {
    alert(`Messaggio ${type.toUpperCase()} salvato:\n\n${messages[type]}`);
  };

  const renderCard = (type, label) => (
    <div className="border rounded-xl p-4 shadow w-full max-w-xl bg-white">
      <h2 className="font-semibold text-lg mb-2">{label}</h2>
      <textarea
        value={messages[type]}
        onChange={e => handleChange(type, e.target.value)}
        className="w-full border rounded p-2 min-h-[120px] mb-4"
      />
      <button
        onClick={() => handleSave(type)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Salva
      </button>
    </div>
  );

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Comunicazioni</h1>
      {renderCard("sms", "Messaggio SMS")}
      {renderCard("email", "Messaggio Email")}
      {renderCard("whatsapp", "Messaggio WhatsApp")}
    </div>
  );
}
