"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMail, FiPhone, FiCheck, FiArrowLeft, FiBriefcase, FiHome, FiX } from "react-icons/fi";
import { TfiCar } from "react-icons/tfi";

export default function NewCustomerPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    plateNumber: "",
    brand: "",
    model: "",
    contactMethod: "whatsapp",
    type: "private"
  });
  const [showVehicleFields, setShowVehicleFields] = useState(false);
  const [vehicleSuggestions, setVehicleSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [workshopId, setWorkshopId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchWorkshopId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Recupera workshopId dal worker
        const { data: workerData } = await supabase
          .from("Workers")
          .select("workshopId")
          .eq("workerId", user.id)
          .single();
        
        if (workerData) {
          setWorkshopId(workerData.workshopId);
        }
      }
    };

    fetchWorkshopId();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlateChange = async (value) => {
    setFormData(prev => ({ 
      ...prev, 
      plateNumber: value,
      brand: "",
      model: ""
    }));
    setShowVehicleFields(false);
    setShowSuggestions(false);

    if (!value || value.length < 2 || !workshopId) return;

    // Cerca veicoli corrispondenti
    const { data, error } = await supabase
      .from("Vehicles")
      .select("*")
      .ilike("plateNumber", `%${value}%`)
      .eq("workshopId", workshopId)
      .limit(5);

    if (data && data.length > 0) {
      setVehicleSuggestions(data);
      setShowSuggestions(true);
    } else {
      setShowVehicleFields(true);
    }
  };

  const selectVehicleSuggestion = (vehicle) => {
    setFormData(prev => ({
      ...prev,
      plateNumber: vehicle.plateNumber,
      brand: vehicle.brand || "",
      model: vehicle.model || ""
    }));
    setShowSuggestions(false);
    setShowVehicleFields(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // 1. Verifica workshopId
      if (!workshopId) throw new Error("Nessun workshop associato");

      // 2. Crea nuovo cliente
      const { data: customerData, error: customerError } = await supabase
        .from("Customers")
        .insert([{
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          contactMethod: formData.contactMethod,
          type: formData.type,
          PlateNumbers: [formData.plateNumber],
          workshopId,
        }])
        .select()
        .single();

      if (customerError) throw customerError;

      // 3. Se sono stati compilati i campi del veicolo, crea/aggiorna veicolo
      if (showVehicleFields && formData.brand && formData.model) {
        const { error: vehicleError } = await supabase
          .from("Vehicles")
          .upsert({
            plateNumber: formData.plateNumber,
            brand: formData.brand,
            model: formData.model,
            workshopId,
            ownerId: customerData.id
          });

        if (vehicleError) throw vehicleError;
      }

      router.push("/dashboard/customers");
    } catch (error) {
      console.error("Errore:", error);
      setError(error.message || "Si è verificato un errore durante il salvataggio.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto p-6"
    >
      <div className="flex items-center gap-4 mb-6">
        <motion.button
          onClick={() => router.back()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-gray-600 hover:text-blue-600 transition-colors"
        >
          <FiArrowLeft size={24} />
        </motion.button>
        <h1 className="text-2xl font-bold text-gray-800">Nuovo Cliente</h1>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded"
        >
          {error}
        </motion.div>
      )}

      <motion.form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        autoComplete="off"
      >
        <div className="space-y-5">
          {/* Tipo Cliente */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo cliente *</label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.type === 'private' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="type"
                    value="private"
                    checked={formData.type === 'private'}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <FiHome className={`text-lg ${
                    formData.type === 'private' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <span className={formData.type === 'private' ? 'font-medium text-blue-600' : 'text-gray-600'}>
                    Privato
                  </span>
                </div>
              </label>
              
              <label className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.type === 'company' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="type"
                    value="company"
                    checked={formData.type === 'company'}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <FiBriefcase className={`text-lg ${
                    formData.type === 'company' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <span className={formData.type === 'company' ? 'font-medium text-blue-600' : 'text-gray-600'}>
                    Società
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Nome Completo */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.type === 'company' ? 'Ragione sociale *' : 'Nome completo *'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-gray-400" />
              </div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Email */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Telefono */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefono *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiPhone className="text-gray-400" />
              </div>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Targa */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Targa *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <TfiCar className="text-gray-400" />
              </div>
              <input
                type="text"
                name="plateNumber"
                value={formData.plateNumber}
                onChange={(e) => handlePlateChange(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {formData.plateNumber && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, plateNumber: "", brand: "", model: "" }));
                    setShowVehicleFields(false);
                    setShowSuggestions(false);
                  }}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <FiX />
                </button>
              )}
            </div>

            {/* Suggerimenti targhe */}
            <AnimatePresence>
              {showSuggestions && vehicleSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 absolute w-full"
                >
                  <ul className="py-1">
                    {vehicleSuggestions.map((vehicle) => (
                      <li key={vehicle.id}>
                        <button
                          type="button"
                          onClick={() => selectVehicleSuggestion(vehicle)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex justify-between items-center"
                        >
                          <span>{vehicle.plateNumber}</span>
                          <span className="text-sm text-gray-500">
                            {vehicle.brand} {vehicle.model}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sezione Veicolo */}
          <AnimatePresence>
            {showVehicleFields && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-5 pt-3">
                  {/* Marca */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marca veicolo *</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      required={showVehicleFields}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  {/* Modello */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modello veicolo *</label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      required={showVehicleFields}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Metodo di contatto preferenziale */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Metodo di contatto preferenziale</label>
            <select
              name="contactMethod"
              value={formData.contactMethod}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <motion.button
            type="button"
            onClick={() => router.push("/dashboard/customers")}
            whileHover={{ backgroundColor: "#f3f4f6" }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700"
          >
            Annulla
          </motion.button>
          
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.03 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            className={`px-6 py-2 rounded-lg text-white flex items-center gap-2 ${
              isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvataggio...
              </>
            ) : (
              <>
                <FiCheck />
                Salva Cliente
              </>
            )}
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
  );
}