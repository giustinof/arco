"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiArrowLeft, FiX, FiUser, FiSearch, FiChevronDown } from "react-icons/fi";
import { TfiCar } from "react-icons/tfi";

export default function NewVehiclePage() {
  const [formData, setFormData] = useState({
    plateNumber: "",
    brand: "",
    model: "",
    type: "",
    ownerId: ""
  });
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [typeSearch, setTypeSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [workshopId, setWorkshopId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: workerData } = await supabase
          .from("Workers")
          .select("workshopId")
          .eq("workerId", user.id)
          .single();
        
        if (workerData) {
          setWorkshopId(workerData.workshopId);
          
          // Fetch customers
          const { data: customersData } = await supabase
            .from("Customers")
            .select("id, fullName, phoneNumber, PlateNumbers")
            .eq("workshopId", workerData.workshopId)
            .order("fullName", { ascending: true });
          
          if (customersData) {
            setCustomers(customersData);
            setFilteredCustomers(customersData);
          }

          // Fetch vehicle types
          const { data: typesData } = await supabase
            .from("VehicleTypes")
            .select("type")
            .order("type", { ascending: true });

          if (typesData) {
            setVehicleTypes(typesData.map(t => t.type));
            setFilteredTypes(typesData.map(t => t.type));
          }
        }
      }
    };

    fetchData();
  }, []);

  // Filter customers
  useEffect(() => {
    if (customerSearch) {
      const filtered = customers.filter(customer =>
        customer.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.phoneNumber?.includes(customerSearch)
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [customerSearch, customers]);

  // Filter vehicle types
  useEffect(() => {
    if (typeSearch) {
      const filtered = vehicleTypes.filter(type =>
        type.toLowerCase().includes(typeSearch.toLowerCase())
      );
      setFilteredTypes(filtered);
    } else {
      setFilteredTypes(vehicleTypes);
    }
  }, [typeSearch, vehicleTypes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({ ...prev, ownerId: customer.id }));
    setCustomerSearch(customer.fullName);
    setShowCustomerDropdown(false);
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setFormData(prev => ({ ...prev, type }));
    setTypeSearch(type);
    setShowTypeDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (!workshopId) throw new Error("Nessun workshop associato");

      const { data: vehicleData, error: vehicleError } = await supabase
        .from("Vehicles")
        .insert([{
          plateNumber: formData.plateNumber,
          brand: formData.brand,
          model: formData.model,
          type: formData.type || null,
          workshopId,
          ownerId: formData.ownerId || null,
          lastAppointmentId: null,
          nextAppointmentId: null
        }])
        .select()
        .single();

      if (vehicleError) throw vehicleError;

      if (formData.ownerId) {
        const { data: customerData } = await supabase
          .from("Customers")
          .select("PlateNumbers")
          .eq("id", formData.ownerId)
          .single();

        const existingPlates = customerData?.PlateNumbers || [];
        
        if (!existingPlates.includes(formData.plateNumber)) {
          const { error: customerUpdateError } = await supabase
            .from("Customers")
            .update({
              PlateNumbers: [...existingPlates, formData.plateNumber]
            })
            .eq("id", formData.ownerId);

          if (customerUpdateError) throw customerUpdateError;
        }
      }

      router.push("/dashboard/vehicles");
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
        <h1 className="text-2xl font-bold text-gray-800">Nuovo Veicolo</h1>
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
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Marca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Modello */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modello *</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Tipo */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <TfiCar className="text-gray-400" />
              </div>
              <input
                type="text"
                name="type"
                value={typeSearch}
                onChange={(e) => {
                  setTypeSearch(e.target.value);
                  setShowTypeDropdown(true);
                }}
                onFocus={() => setShowTypeDropdown(true)}
                placeholder="Cerca tipo veicolo..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FiChevronDown className="text-gray-400" />
              </div>
            </div>

            <AnimatePresence>
              {showTypeDropdown && filteredTypes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 absolute w-full"
                >
                  <ul className="py-1 max-h-60 overflow-auto">
                    {filteredTypes.map((type) => (
                      <li key={type}>
                        <button
                          type="button"
                          onClick={() => handleTypeSelect(type)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          {type}
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {selectedType && (
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div className="font-medium">{selectedType}</div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedType(null);
                      setTypeSearch("");
                      setFormData(prev => ({ ...prev, type: "" }));
                    }}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <FiX />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Proprietario */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Proprietario</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-gray-400" />
              </div>
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerDropdown(true);
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                placeholder="Cerca cliente..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
            </div>

            <AnimatePresence>
              {showCustomerDropdown && filteredCustomers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 absolute w-full"
                >
                  <ul className="py-1 max-h-60 overflow-auto">
                    {filteredCustomers.map((customer) => (
                      <li key={customer.id}>
                        <button
                          type="button"
                          onClick={() => handleCustomerSelect(customer)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex justify-between items-center"
                        >
                          <div>
                            <div className="font-medium">{customer.fullName}</div>
                            {customer.phoneNumber && (
                              <div className="text-sm text-gray-500">{customer.phoneNumber}</div>
                            )}
                          </div>
                          {customer.PlateNumbers?.length > 0 && (
                            <div className="text-xs bg-gray-100 rounded-full px-2 py-1">
                              {customer.PlateNumbers.length} targhe
                            </div>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {selectedCustomer && (
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{selectedCustomer.fullName}</div>
                    {selectedCustomer.phoneNumber && (
                      <div className="text-sm text-gray-600">{selectedCustomer.phoneNumber}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setCustomerSearch("");
                      setFormData(prev => ({ ...prev, ownerId: "" }));
                    }}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <FiX />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <motion.button
            type="button"
            onClick={() => router.push("/dashboard/vehicles")}
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
                Salva Veicolo
              </>
            )}
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
  );
}