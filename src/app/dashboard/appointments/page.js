"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { FiCopy, FiEdit, FiTrash2, FiPlus, FiCheck, FiX, FiCalendar, FiUser, FiClock, FiArrowRight } from "react-icons/fi";
import { TfiCar } from "react-icons/tfi";
import { motion, AnimatePresence } from "framer-motion";
import { navigateWithSearch } from "@/app/components/NavigationHelper";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [customers, setCustomers] = useState({});
  const [vehicles, setVehicles] = useState({});
  const [workshops, setWorkshops] = useState({});
  

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const searchParam = queryParams.get('search');
    
    if (searchParam) {
      setSearchTerm(searchParam);
      // Rimuovi i parametri dall'URL senza ricaricare la pagina
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch appointments with related data
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("Appointments")
        .select(`
          *,
          Customers:customerId (id, fullName, phoneNumber),
          Vehicles:vehicleId (id, plateNumber, brand, model),
          Workshops:workshopId (id, name)
        `)
        .order("date", { ascending: true });

      if (appointmentsError) {
        console.error("Errore nel caricamento appuntamenti:", appointmentsError);
      } else {
        setAppointments(appointmentsData);
        
        // Create maps for related data
        const customersMap = {};
        const vehiclesMap = {};
        const workshopsMap = {};
        
        appointmentsData.forEach(appointment => {
          if (appointment.Customers) {
            customersMap[appointment.customerId] = appointment.Customers;
          }
          if (appointment.Vehicles) {
            vehiclesMap[appointment.vehicleId] = appointment.Vehicles;
          }
          if (appointment.Workshops) {
            workshopsMap[appointment.workshopId] = appointment.Workshops;
          }
        });
        
        setCustomers(customersMap);
        setVehicles(vehiclesMap);
        setWorkshops(workshopsMap);
      }
      setLoading(false);
    };

    fetchData();
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
      .from("Appointments")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Errore nella cancellazione dell'appuntamento:", error);
    } else {
      setAppointments((prev) => prev.filter((appointment) => appointment.id !== id));
      setShowConfirmDelete(false);
    }
  };

  const openEditForm = (id) => {
    window.location.href = `/dashboard/appointments/edit/${id}`;
  };

  // Funzione per formattare data e ora
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Funzione per formattare solo la data
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredAppointments = appointments.filter(appointment => {
  const searchLower = searchTerm.toLowerCase();
  const dateString = formatDate(appointment.date).toLowerCase(); // Es: "18/06/2025"
  const createdAtString = formatDate(appointment.created_at).toLowerCase(); // Se vuoi filtrare anche su data di creazione

  return (
    customers[appointment.customerId]?.fullName?.toLowerCase().includes(searchLower) ||
    vehicles[appointment.vehicleId]?.plateNumber?.toLowerCase().includes(searchLower) ||
    vehicles[appointment.vehicleId]?.brand?.toLowerCase().includes(searchLower) ||
    vehicles[appointment.vehicleId]?.model?.toLowerCase().includes(searchLower) ||
    workshops[appointment.workshopId]?.name?.toLowerCase().includes(searchLower) ||
    appointment.status?.toLowerCase().includes(searchLower) ||
    dateString.includes(searchLower) ||
    createdAtString.includes(searchLower)
  );
});


  

  // Funzione per ottenere il badge dello stato
  const getStatusBadge = (status) => {
    switch(status) {
      case 'confermata':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Confermata</span>;
      case 'annullata':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Annullata</span>;
      case 'in attesa':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">In attesa</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status || '-'}</span>;
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
          <h1 className="text-2xl font-bold text-gray-800">Appuntamenti</h1>
          <p className="text-gray-500">
            Totale appuntamenti: <span className="font-medium">{appointments.length}</span>
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-grow sm:w-64">
            <input
              type="text"
              placeholder="Cerca appuntamenti..."
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
            href="/dashboard/appointments/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiPlus />
            Nuovo Appuntamento
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
                    Data Appuntamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prenotato il
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veicolo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <motion.tr
                      key={appointment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                      className="border-b border-gray-100"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selected.includes(appointment.id)}
                          onChange={() => toggleSelect(appointment.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-gray-500" />
                          {formatDateTime(appointment.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        <div className="flex items-center gap-2">
                          <FiClock className="text-gray-500" />
                          {formatDateTime(appointment.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {appointment.customerId ? (
                          <div className="flex items-center gap-2 group">
                            <FiUser className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                            <div className="flex-1 min-w-0">
                              <motion.button
                                onClick={() => navigateWithSearch('/dashboard/customers', customers[appointment.customerId]?.fullName)}
                                className="flex items-center gap-1.5 cursor-pointer"
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
                                <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                  {customers[appointment.customerId]?.fullName || 'Cliente sconosciuto'}
                                </span>
                                <FiArrowRight className="h-3.5 w-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-0 -translate-x-1 transition-all duration-200 ease-out" />
                              </motion.button>
                              <div className="text-sm text-gray-500 group-hover:text-blue-400 transition-colors flex items-center">
                                {customers[appointment.customerId]?.phoneNumber || '-'}
                              </div>
                            </div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {appointment.vehicleId ? (
                          <div className="flex items-center gap-2 group">
                            <TfiCar className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                            <div className="flex-1 min-w-0">
                              <motion.button
                                onClick={() => navigateWithSearch('/dashboard/vehicles', vehicles[appointment.vehicleId]?.plateNumber || '')}
                                className="flex items-center gap-1.5 cursor-pointer"
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
                                <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                  {vehicles[appointment.vehicleId]?.brand || 'Marca sconosciuta'} {vehicles[appointment.vehicleId]?.model || ''}
                                </span>
                                <FiArrowRight className="h-3.5 w-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-0 -translate-x-1 transition-all duration-200 ease-out" />
                              </motion.button>
                              <div className="text-sm text-gray-500 group-hover:text-blue-400 transition-colors flex items-center">
                                {vehicles[appointment.vehicleId]?.plateNumber || '-'}
                              </div>
                            </div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(appointment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-3">
                          <motion.button
                            onClick={() => copyToClipboard(
                              `Appuntamento: ${formatDateTime(appointment.date)}\n` +
                              `Prenotato il: ${formatDateTime(appointment.created_at)}\n` +
                              `Cliente: ${customers[appointment.customerId]?.fullName || '-'} (${customers[appointment.customerId]?.phoneNumber || '-'})\n` +
                              `Veicolo: ${vehicles[appointment.vehicleId]?.brand || '-'} ${vehicles[appointment.vehicleId]?.model || '-'} (${vehicles[appointment.vehicleId]?.plateNumber || '-'})\n` +
                              `Officina: ${workshops[appointment.workshopId]?.name || '-'}\n` +
                              `Stato: ${appointment.status || '-'}`,
                              appointment.id
                            )}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                            title="Copia dettagli"
                          >
                            {copiedId === appointment.id ? (
                              <FiCheck className="text-green-500" />
                            ) : (
                              <FiCopy />
                            )}
                          </motion.button>
                          
                          <motion.button
                            onClick={() => openEditForm(appointment.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-gray-500 hover:text-yellow-600 transition-colors cursor-pointer"
                            title="Modifica"
                          >
                            <FiEdit />
                          </motion.button>
                          
                          <motion.button
                            onClick={() => {
                              setAppointmentToDelete(appointment.id);
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
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      Nessun appuntamento trovato
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
                  Sei sicuro di voler eliminare definitivamente questo appuntamento? Tutti i dati associati
                  verranno rimossi e <span className="font-semibold text-red-600 dark:text-red-400">l'azione è irreversibile</span>.
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
                    onClick={() => handleDelete(appointmentToDelete)}
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