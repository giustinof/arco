"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { FiCopy, FiEdit, FiTrash2, FiPlus, FiCheck, FiX, FiCalendar, FiUser, FiArrowRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { navigateWithSearch } from "@/app/components/NavigationHelper";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [customers, setCustomers] = useState({});
  const [appointments, setAppointments] = useState({});

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
      
      // Fetch vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from("Vehicles")
        .select("*")
        .order("created_at", { ascending: false });

      if (vehiclesError) {
        console.error("Errore nel caricamento veicoli:", vehiclesError);
      } else {
        setVehicles(vehiclesData);
        
        // Fetch customers for owner information
        const ownerIds = vehiclesData.map(v => v.ownerId).filter(id => id);
        if (ownerIds.length > 0) {
          const { data: customersData, error: customersError } = await supabase
            .from("Customers")
            .select("id, fullName")
            .in("id", ownerIds);
            
          if (!customersError) {
            const customersMap = {};
            customersData.forEach(c => customersMap[c.id] = c.fullName);
            setCustomers(customersMap);
          }
        }

        // Fetch appointments data
        const appointmentIds = vehiclesData
          .map(v => [v.lastAppointmentId, v.nextAppointmentId])
          .flat()
          .filter(id => id);
        
        if (appointmentIds.length > 0) {
          const { data: appointmentsData, error: appointmentsError } = await supabase
            .from("Appointments")
            .select("id, date, status")
            .in("id", appointmentIds);
          
          if (!appointmentsError) {
            const appointmentsMap = {};
            appointmentsData.forEach(a => {
              appointmentsMap[a.id] = {
                date: new Date(a.date).toLocaleDateString(),
                status: a.status
              };
            });
            setAppointments(appointmentsMap);
          }
        }
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
      .from("Vehicles")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Errore nella cancellazione del veicolo:", error);
    } else {
      setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== id));
      setShowConfirmDelete(false);
    }
  };

  const openEditForm = (id) => {
    window.location.href = `/dashboard/vehicles/edit/${id}`;
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customers[vehicle.ownerId]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Funzione per ottenere il nome del proprietario
  const getOwnerName = (ownerId) => {
    return ownerId ? customers[ownerId] || "Proprietario sconosciuto" : "-";
  };

  // Funzione per ottenere i dettagli dell'appuntamento
  const getAppointmentDetails = (appointmentId) => {
    if (!appointmentId) return "-";
    
    const appointment = appointments[appointmentId];
    if (!appointment) return "Caricamento...";
    
    return (
      <div className="flex items-center gap-2">
        <FiCalendar className="text-gray-500" />
        <span>{appointment.date}</span>
        
      </div>
    );
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
          <h1 className="text-2xl font-bold text-gray-800">Veicoli</h1>
          <p className="text-gray-500">
            Totale veicoli: <span className="font-medium">{vehicles.length}</span>
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-grow sm:w-64">
            <input
              type="text"
              placeholder="Cerca veicoli..."
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
            href="/dashboard/vehicles/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiPlus />
            Nuovo Veicolo
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
                    Targa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marca
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modello
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proprietario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ultimo appuntamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prossimo appuntamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle) => (
                    <motion.tr
                      key={vehicle.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                      className="border-b border-gray-100"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selected.includes(vehicle.id)}
                          onChange={() => toggleSelect(vehicle.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {vehicle.plateNumber || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {vehicle.brand || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {vehicle.model || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {vehicle.type || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vehicle.ownerId ? (
                          <motion.button
                            onClick={() => navigateWithSearch('/dashboard/customers', getOwnerName(vehicle.ownerId))}
                            className="group flex items-center gap-2 cursor-pointer"
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
                            <FiUser className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                            <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {getOwnerName(vehicle.ownerId)}
                            </span>
                            <FiArrowRight className="h-3.5 w-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-0 -translate-x-1 transition-all duration-200 ease-out" />
                          </motion.button>
                        ) : (
                          '-'
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {vehicle.lastAppointmentId ? (
                          <motion.button
                            onClick={() => navigateWithSearch('/dashboard/appointments', appointments[vehicle.lastAppointmentId]?.date.split(',')[0] || '')}
                            className="group flex items-center gap-2 cursor-pointer"
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
                            {getAppointmentDetails(vehicle.lastAppointmentId)}
                            <FiArrowRight className="h-3.5 w-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-0 -translate-x-1 transition-all duration-200 ease-out" />
                          </motion.button>
                        ) : (
                          '-'
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {vehicle.nextAppointmentId ? (
                          <motion.button
                            onClick={() => navigateWithSearch('/dashboard/appointments', appointments[vehicle.nextAppointmentId]?.date.split(',')[0] || '')}
                            className="group flex items-center gap-2 cursor-pointer"
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
                            {getAppointmentDetails(vehicle.nextAppointmentId)}
                            <FiArrowRight className="h-3.5 w-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-0 -translate-x-1 transition-all duration-200 ease-out" />
                          </motion.button>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-3">
                          <motion.button
                            onClick={() => copyToClipboard(
                              `${vehicle.plateNumber || ''}, ${vehicle.brand || ''}, ${vehicle.model || ''}, ${vehicle.type || ''}, ${getOwnerName(vehicle.ownerId)}`, 
                              vehicle.id
                            )}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                            title="Copia dettagli"
                          >
                            {copiedId === vehicle.id ? (
                              <FiCheck className="text-green-500" />
                            ) : (
                              <FiCopy />
                            )}
                          </motion.button>
                          
                          <motion.button
                            onClick={() => openEditForm(vehicle.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-gray-500 hover:text-yellow-600 transition-colors cursor-pointer"
                            title="Modifica"
                          >
                            <FiEdit />
                          </motion.button>
                          
                          <motion.button
                            onClick={() => {
                              setVehicleToDelete(vehicle.id);
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
                    <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                      Nessun veicolo trovato
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
                  Sei sicuro di voler eliminare definitivamente questo veicolo? Tutti i dati associati
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
                    onClick={() => handleDelete(vehicleToDelete)}
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