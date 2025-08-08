"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { FiArrowRight, FiCopy, FiEdit, FiTrash2, FiPlus, FiCheck, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { navigateWithSearch } from "@/app/components/NavigationHelper";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const searchParam = queryParams.get('search');
    
    if (searchParam) {
      setSearchTerm(searchParam);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase
        .from("Customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Errore nel caricamento clienti:", error);
      } else {
        setCustomers(data);
      }
      setLoading(false);
    };

    fetchCustomers();
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from("Customers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Errore nella cancellazione del cliente:", error);
    } else {
      setCustomers((prev) => prev.filter((customer) => customer.id !== id));
      setShowConfirmDelete(false);
    }
  };

  const openEditForm = (id) => {
    window.location.href = `/dashboard/customers/edit/${id}`;
  };

  const filteredCustomers = customers.filter(customer =>
    customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phoneNumber?.includes(searchTerm)
  );

  const getContactMethodLabel = (method) => {
    switch(method) {
      case 'whatsapp': return 'WhatsApp';
      case 'email': return 'Email';
      case 'sms': return 'SMS';
      default: return method || '-';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Clienti</h1>
          <p className="text-gray-500">
            Totale clienti: <span className="font-medium">{customers.length}</span>
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-grow sm:w-64">
            <input
              type="text"
              placeholder="Cerca clienti..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <FiX />
              </button>
            )}
          </div>
          
          <motion.a
            href="/dashboard/customers/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiPlus />
            Nuovo Cliente
          </motion.a>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="sr-only">Seleziona</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Targhe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metodo di contatto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <motion.tr
                      key={customer.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                      className="border-b border-gray-100"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selected.includes(customer.id)}
                          onChange={() => toggleSelect(customer.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {customer.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {customer.email || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {customer.phoneNumber || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.PlateNumbers?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {customer.PlateNumbers.map((plate, index) => (
                              <motion.button
                                key={index}
                                onClick={() => navigateWithSearch('/dashboard/vehicles', plate)}
                                className="group relative inline-flex items-center cursor-pointer"
                                initial={false}
                                whileHover={{ 
                                  x: 2,
                                  color: "#2563eb"
                                }}
                                whileTap={{ 
                                  x: 4,
                                  color: "#1d4ed8"
                                }}
                                transition={{
                                  duration: 0.2,
                                  ease: "easeOut"
                                }}
                              >
                                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 group-hover:bg-blue-100 group-hover:text-blue-800 transition-colors flex items-center">
                                  {plate}
                                  <FiArrowRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-0 -translate-x-1 transition-all duration-200 ease-out" />
                                </span>
                              </motion.button>
                            ))}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            customer.contactMethod === 'whatsapp' 
                              ? 'bg-green-100 text-green-800'
                              : customer.contactMethod === 'email'
                              ? 'bg-blue-100 text-blue-800'
                              : customer.contactMethod === 'sms'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {getContactMethodLabel(customer.contactMethod)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-3">
                          <motion.button
                            onClick={() => copyToClipboard(customer.fullName + ", " + customer.email + "," + customer.phoneNumber + ", " + customer.PlateNumbers?.join(", ") + ", " + customer.contactMethod, customer.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                            title="Copia email"
                          >
                            {copiedId === customer.id ? (
                              <FiCheck className="text-green-500" />
                            ) : (
                              <FiCopy />
                            )}
                          </motion.button>
                          
                          <motion.button
                            onClick={() => openEditForm(customer.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-gray-500 hover:text-yellow-600 transition-colors cursor-pointer"
                            title="Modifica"
                          >
                            <FiEdit />
                          </motion.button>
                          
                          <motion.button
                            onClick={() => {
                              setCustomerToDelete(customer.id);
                              setShowConfirmDelete(true);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                            title="Elimina"
                          >
                            <FiTrash2 />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      Nessun cliente trovato
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showConfirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-red-600 dark:text-red-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Conferma eliminazione
                  </h3>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6 pl-2">
                  Sei sicuro di voler eliminare definitivamente questo cliente? Tutti i dati associati
                  verranno rimossi e <span className="font-semibold text-red-600 dark:text-red-400">l&apos;azione è irreversibile</span>.
                </p>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <motion.button
                    onClick={() => setShowConfirmDelete(false)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-5 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Annulla
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(customerToDelete)}
                    whileHover={{ scale: 1.03, backgroundColor: "#dc2626" }}
                    whileTap={{ scale: 0.97 }}
                    className="px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium shadow-sm shadow-red-200 dark:shadow-red-900/30 transition-colors"
                  >
                    Elimina definitivamente
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}