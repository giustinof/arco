"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiClock,
  FiPlus,
  FiTrash2,
  FiSave,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

const DAYS = [
  "Domenica",
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
];

// Struttura di default per gli orari di lavoro
const DEFAULT_WORKING_HOURS = {
  0: [],
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
};

export default function WorkingHoursPage() {
  const router = useRouter();
  const [appointmentsDuration, setAppointmentsDuration] = useState(30);
  const [workingHours, setWorkingHours] = useState(DEFAULT_WORKING_HOURS);
  const [expandedDays, setExpandedDays] = useState([0]);
  const [isSaving, setIsSaving] = useState(false);
  const [workshopId, setWorkshopId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: workerData } = await supabase
            .from("Workers")
            .select("workshopId")
            .eq("workerId", user.id)
            .single();

          if (workerData) {
            setWorkshopId(workerData.workshopId);

            const { data: settingsData } = await supabase
              .from("WorkingHours")
              .select("appointmentsDuration, hours")
              .eq("workshopId", workerData.workshopId)
              .single();

            if (settingsData) {
              setAppointmentsDuration(settingsData.appointmentsDuration || 30);
              setWorkingHours({
                ...DEFAULT_WORKING_HOURS,
                ...(settingsData.hours || {}),
              });
            }
          }
        }
      } catch (error) {
        console.error("Errore nel caricamento dei dati:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleDay = (dayIndex) => {
    setExpandedDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex],
    );
  };

  const handleDurationChange = (e) => {
    setAppointmentsDuration(e.target.value);
  };

  const handleTimeChange = (dayIndex, timeIndex, field, value) => {
    const updatedHours = { ...workingHours };
    updatedHours[dayIndex][timeIndex][field] = value;
    setWorkingHours(updatedHours);
  };

  const handleAddTimeSlot = (dayIndex) => {
    const updatedHours = { ...workingHours };
    updatedHours[dayIndex].push({ start: "", end: "" });
    setWorkingHours(updatedHours);

    if (!expandedDays.includes(dayIndex)) {
      setExpandedDays([...expandedDays, dayIndex]);
    }
  };

  const handleRemoveTimeSlot = (dayIndex, timeIndex) => {
    const updatedHours = { ...workingHours };
    updatedHours[dayIndex].splice(timeIndex, 1);
    setWorkingHours(updatedHours);
  };

  const handleSave = async () => {
    if (!workshopId) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.from("WorkingHours").upsert(
        {
          workshopId,
          appointmentsDuration: Number(appointmentsDuration),
          hours: workingHours,
        },
        { onConflict: ["workshopId"] },
      );

      if (error) throw error;

      // Mostra un feedback all'utente
      alert("Orari salvati con successo!");
    } catch (error) {
      console.error("Errore nel salvataggio:", error.message);
      alert("Si è verificato un errore durante il salvataggio");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Orari di Lavoro</h1>
          <p className="text-gray-500">
            Configura gli orari di apertura e la durata degli appuntamenti
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <FiClock className="text-blue-600 text-xl" />
            <label className="block font-medium text-gray-700">
              Durata Appuntamento
            </label>
          </div>
          <div className="relative w-32">
            <input
              type="number"
              min={5}
              max={120}
              step={5}
              value={appointmentsDuration}
              onChange={handleDurationChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <span className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
              min
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {DAYS.map((day, dayIndex) => (
            <motion.div
              key={dayIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayIndex * 0.05 }}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <motion.button
                onClick={() => toggleDay(dayIndex)}
                className={`flex justify-between items-center w-full p-4 text-left ${
                  expandedDays.includes(dayIndex)
                    ? "bg-gray-50"
                    : "hover:bg-gray-50"
                } transition-colors`}
                whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-800">{day}</span>
                  {workingHours[dayIndex].length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {workingHours[dayIndex].length} fasc
                      {workingHours[dayIndex].length !== 1 ? "e" : "ia"}
                    </span>
                  )}
                </div>
                {expandedDays.includes(dayIndex) ? (
                  <FiChevronUp className="text-gray-400" />
                ) : (
                  <FiChevronDown className="text-gray-400" />
                )}
              </motion.button>

              <AnimatePresence>
                {expandedDays.includes(dayIndex) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 space-y-4">
                      {workingHours[dayIndex].length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          Nessuna fascia oraria impostata per questo giorno
                        </div>
                      ) : (
                        workingHours[dayIndex].map((slot, timeIndex) => (
                          <motion.div
                            key={timeIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.15 }}
                            className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="time"
                                value={slot.start}
                                onChange={(e) =>
                                  handleTimeChange(
                                    dayIndex,
                                    timeIndex,
                                    "start",
                                    e.target.value,
                                  )
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                              />
                              <span className="text-gray-400">alle</span>
                              <input
                                type="time"
                                value={slot.end}
                                onChange={(e) =>
                                  handleTimeChange(
                                    dayIndex,
                                    timeIndex,
                                    "end",
                                    e.target.value,
                                  )
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                              />
                            </div>
                            <motion.button
                              onClick={() =>
                                handleRemoveTimeSlot(dayIndex, timeIndex)
                              }
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 text-sm"
                            >
                              <FiTrash2 />
                              <span>Rimuovi</span>
                            </motion.button>
                          </motion.div>
                        ))
                      )}

                      <motion.button
                        onClick={() => handleAddTimeSlot(dayIndex)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors text-sm"
                      >
                        <FiPlus />
                        <span>Aggiungi fascia oraria</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.button
        onClick={handleSave}
        disabled={isSaving}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full sm:w-auto sm:min-w-[200px] bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            <span>Salvataggio...</span>
          </>
        ) : (
          <>
            <FiSave />
            <span>Salva Orari</span>
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
