"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiX,
  FiUser,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiInfo,
  FiCalendar,
} from "react-icons/fi";
import { TfiCar } from "react-icons/tfi";
import { motion, AnimatePresence } from "framer-motion";
import { navigateWithSearch } from "@/app/components/NavigationHelper";

const timeSlots = Array.from({ length: 21 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
});

const STATUS_STYLES = {
  confermata: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    expandedBg: "bg-green-100",
    icon: "text-green-500",
  },
  annullata: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    expandedBg: "bg-red-100",
    icon: "text-red-500",
  },
  "in attesa": {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-800",
    expandedBg: "bg-yellow-100",
    icon: "text-yellow-500",
  },
  default: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-800",
    expandedBg: "bg-gray-100",
    icon: "text-gray-500",
  },
};

export default function AppointmentsCalendar() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState({});
  const [vehicles, setVehicles] = useState({});
  const [workshops, setWorkshops] = useState({});
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [expandedAppointment, setExpandedAppointment] = useState(null);

  const getWeekDays = (date) => {
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1));
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      return day;
    });
  };

  const weekDays = getWeekDays(currentWeek);

  const formatDateKey = (date) => {
    return date.toISOString().split("T")[0];
  };

  const getAppointmentsForSlot = (day, timeSlot) => {
    const dayKey = formatDateKey(day);
    const [hour, minute] = timeSlot.split(":").map(Number);
    
    return appointments.filter((appointment) => {
      if (!appointment.date) return false;
      
      const appointmentDate = new Date(appointment.date);
      const appointmentDayKey = formatDateKey(appointmentDate);
      const appointmentHour = appointmentDate.getHours();
      const appointmentMinute = appointmentDate.getMinutes();
      
      return (
        appointmentDayKey === dayKey &&
        appointmentHour === hour &&
        appointmentMinute === minute
      );
    });
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);

      const startOfWeek = new Date(weekDays[0]);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(weekDays[6]);
      endOfWeek.setHours(23, 59, 59, 999);

      const { data: appointmentsData, error } = await supabase
        .from("Appointments")
        .select(`
          *,
          Customers:customerId (id, fullName, phoneNumber),
          Vehicles:vehicleId (id, plateNumber, brand, model),
          Workshops:workshopId (id, name)
        `)
        .gte("date", startOfWeek.toISOString())
        .lte("date", endOfWeek.toISOString())
        .order("date", { ascending: true });

      if (!error) {
        setAppointments(appointmentsData || []);

        const customersMap = {};
        const vehiclesMap = {};
        const workshopsMap = {};

        appointmentsData?.forEach((appointment) => {
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

    fetchAppointments();
  }, [currentWeek]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const searchParam = queryParams.get("search");

    if (searchParam) {
      setSearchTerm(searchParam);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const handleDelete = async (id) => {
    const { error } = await supabase.from("Appointments").delete().eq("id", id);

    if (!error) {
      setAppointments(prev => prev.filter(a => a.id !== id));
      setShowConfirmDelete(false);
    }
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const toggleExpandAppointment = (id) => {
    setExpandedAppointment(expandedAppointment === id ? null : id);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status) => {
    return STATUS_STYLES[status] || STATUS_STYLES.default;
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const customerName = customers[appointment.customerId]?.fullName?.toLowerCase() || "";
    const vehiclePlate = vehicles[appointment.vehicleId]?.plateNumber?.toLowerCase() || "";
    const workshopName = workshops[appointment.workshopId]?.name?.toLowerCase() || "";
    
    return (
      customerName.includes(searchLower) ||
      vehiclePlate.includes(searchLower) ||
      workshopName.includes(searchLower) ||
      appointment.status?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Calendario Appuntamenti</h1>
          <p className="text-sm text-gray-500">
            Settimana dal {formatDate(weekDays[0])} al {formatDate(weekDays[6])}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:w-56">
            <input
              type="text"
              placeholder="Cerca appuntamenti..."
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1.5 text-gray-400 hover:text-gray-600"
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          <motion.a
            href="/dashboard/appointments/new"
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition flex items-center justify-center gap-1.5"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiPlus size={16} />
            <span className="hidden sm:inline">Nuovo</span>
          </motion.a>
        </div>
      </div>

      {/* Navigazione settimanale */}
      <div className="flex items-center justify-between mb-3">
        <motion.button
          onClick={() => navigateWeek("prev")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <FiChevronLeft className="w-5 h-5 text-gray-600" />
        </motion.button>
        
        <h2 className="text-base md:text-lg font-semibold text-gray-700">
          {weekDays[0].toLocaleDateString("it-IT", { month: "long", year: "numeric" })}
        </h2>
        
        <motion.button
          onClick={() => navigateWeek("next")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <FiChevronRight className="w-5 h-5 text-gray-600" />
        </motion.button>
      </div>

      {/* Calendario */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-16 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Orario
                  </th>
                  {weekDays.map((day) => (
                    <th
                      key={day.toString()}
                      className={`px-1 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        day.getDay() === 0 ? "bg-red-50" : day.getDay() === 6 ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-semibold">
                          {day.toLocaleDateString("it-IT", { weekday: "short" })}
                        </span>
                        <span className={`text-xs ${
                          new Date().toDateString() === day.toDateString() 
                            ? "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                            : ""
                        }`}>
                          {day.getDate()}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot} className="hover:bg-gray-50">
                    <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500 border-r border-gray-100">
                      {timeSlot}
                    </td>
                    {weekDays.map((day) => {
                      const slotAppointments = getAppointmentsForSlot(day, timeSlot)
                        .filter(app => filteredAppointments.some(fa => fa.id === app.id));
                      
                      return (
                        <td
                          key={`${formatDateKey(day)}-${timeSlot}`}
                          className={`px-0.5 py-0.5 h-12 border-r border-gray-100 ${
                            day.getDay() === 0 ? "bg-red-50" : day.getDay() === 6 ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="h-full flex flex-col gap-0.5">
                            {slotAppointments.map((appointment) => {
                              const status = appointment.status || "";
                              const style = getStatusStyle(status);
                              
                              return (
                                <motion.div
                                  key={appointment.id}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className={`relative rounded-md border cursor-pointer ${style.bg} ${style.border} ${
                                    expandedAppointment === appointment.id 
                                      ? `${style.expandedBg} shadow-md border-opacity-70`
                                      : "hover:border-opacity-100 border-opacity-50"
                                  }`}
                                  onClick={() => toggleExpandAppointment(appointment.id)}
                                >
                                  <div className="p-1 flex items-start justify-between overflow-hidden">
                                    <div className="flex-1 min-w-0">
                                      <motion.button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigateWithSearch(
                                            "/dashboard/customers",
                                            customers[appointment.customerId]?.fullName
                                          );
                                        }}
                                        className={`flex items-center gap-0.5 cursor-pointer group ${style.text}`}
                                      >
                                        <span className="text-xs font-medium truncate">
                                          {customers[appointment.customerId]?.fullName || "N/D"}
                                        </span>
                                      </motion.button>
                                      <motion.button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigateWithSearch(
                                            "/dashboard/vehicles",
                                            vehicles[appointment.vehicleId]?.plateNumber || ""
                                          );
                                        }}
                                        className="flex items-center gap-0.5 cursor-pointer group"
                                      >
                                        <TfiCar className={`text-xs ${style.icon} opacity-70 group-hover:opacity-100`} />
                                        <span className={`text-[10px] ${style.text} opacity-70 group-hover:opacity-100 truncate`}>
                                          {vehicles[appointment.vehicleId]?.plateNumber || "N/D"}
                                        </span>
                                      </motion.button>
                                    </div>
                                    <div className="ml-0.5 flex items-center gap-0.5">
                                      {expandedAppointment === appointment.id && (
                                        <div className="flex gap-1">
                                          <motion.button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              window.location.href = `/dashboard/appointments/edit/${appointment.id}`;
                                            }}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className={`${style.text} hover:opacity-100 opacity-70 transition-opacity`}
                                            title="Modifica"
                                          >
                                            <FiEdit size={12} />
                                          </motion.button>
                                          <motion.button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setAppointmentToDelete(appointment.id);
                                              setShowConfirmDelete(true);
                                            }}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className={`${style.text} hover:opacity-100 opacity-70 transition-opacity`}
                                            title="Elimina"
                                          >
                                            <FiTrash2 size={12} />
                                          </motion.button>
                                        </div>
                                      )}
                                      <div className={`px-1 py-0.5 rounded-full text-[10px] ${style.text} bg-white bg-opacity-70`}>
                                        {formatTime(appointment.date)}
                                      </div>
                                    </div>
                                  </div>
                                  {expandedAppointment === appointment.id && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="px-1 pb-1"
                                    >
                                      <div className="flex items-center gap-1 text-xs mt-1">
                                        <FiInfo size={10} className={`${style.icon} opacity-70`} />
                                        <span className={`${style.text} font-medium`}>
                                          {vehicles[appointment.vehicleId]?.brand || ""}{" "}
                                          {vehicles[appointment.vehicleId]?.model || ""}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 text-xs mt-1">
                                        <FiCalendar size={10} className={`${style.icon} opacity-70`} />
                                        <span className={`${style.text}`}>
                                          {workshops[appointment.workshopId]?.name || "Nessuna officina"}
                                        </span>
                                      </div>
                                    </motion.div>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modale conferma eliminazione */}
      <AnimatePresence>
        {showConfirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200"
            >
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-100 p-2 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-red-600"
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
                  <h3 className="text-lg font-bold text-gray-900">Conferma eliminazione</h3>
                </div>

                <p className="text-gray-600 mb-5">
                  Sei sicuro di voler eliminare definitivamente questo appuntamento?
                </p>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <motion.button
                    onClick={() => setShowConfirmDelete(false)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                  >
                    Annulla
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(appointmentToDelete)}
                    whileHover={{ scale: 1.03, backgroundColor: "#dc2626" }}
                    whileTap={{ scale: 0.97 }}
                    className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                  >
                    Elimina
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