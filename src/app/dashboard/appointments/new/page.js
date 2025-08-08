"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCheck,
  FiArrowLeft,
  FiX,
  FiUser,
  FiSearch,
  FiCalendar,
  FiPhone,
  FiMail,
  FiChevronDown,
} from "react-icons/fi";
import { TfiCar } from "react-icons/tfi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function NewAppointmentPage() {
  const router = useRouter();
  const [workshopId, setWorkshopId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    date: null,
    time: null,
    plateNumber: "",
    brand: "",
    model: "",
    type: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    contactMethod: "whatsapp",
    status: "confermata",
  });

  const [vehicleSuggestions, setVehicleSuggestions] = useState([]);
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showVehicleSuggestions, setShowVehicleSuggestions] = useState(false);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [existingVehicle, setExistingVehicle] = useState(null);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [existingCustomer, setExistingCustomer] = useState(null);
  const [showCustomerFields, setShowCustomerFields] = useState(false);
  const [showVehicleFields, setShowVehicleFields] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [typeSearch, setTypeSearch] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  const [workingHours, setWorkingHours] = useState({
    appointmentsDuration: 30,
    hours: {
      0: [], // Domenica
      1: [], // Lunedì
      2: [], // Martedì
      3: [], // Mercoledì
      4: [], // Giovedì
      5: [], // Venerdì
      6: [], // Sabato
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

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

          const { data: appointments } = await supabase
            .from("Appointments")
            .select("date")
            .eq("workshopId", workerData.workshopId);

          if (appointments) {
            setBookedSlots(appointments.map((a) => new Date(a.date).getTime()));
          }

          const { data: workingHoursData } = await supabase
            .from("WorkingHours")
            .select("*")
            .eq("workshopId", workerData.workshopId)
            .single();

          if (workingHoursData) {
            setWorkingHours({
              appointmentsDuration: workingHoursData.appointmentsDuration || 30,
              hours: workingHoursData.hours || {
                0: [],
                1: [],
                2: [],
                3: [],
                4: [],
                5: [],
                6: [],
              },
            });
          }

          const { data: typesData } = await supabase
            .from("VehicleTypes")
            .select("type")
            .order("type", { ascending: true });

          if (typesData) {
            setVehicleTypes(typesData.map((t) => t.type));
            setFilteredTypes(typesData.map((t) => t.type));
          }
        }
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (formData.date && workshopId) {
      const dayOfWeek = formData.date.getDay();
      const dayWorkingHours = workingHours.hours?.[dayOfWeek] || [];

      if (dayWorkingHours.length === 0) {
        setAvailableTimes([]);
        return;
      }

      const times = [];
      const appointmentDuration = workingHours.appointmentsDuration || 30;

      dayWorkingHours.forEach((slot) => {
        if (!slot.start || !slot.end) return;

        const [startHour, startMinute] = slot.start.split(":").map(Number);
        const [endHour, endMinute] = slot.end.split(":").map(Number);

        const startTime = new Date(formData.date);
        startTime.setHours(startHour, startMinute, 0, 0);

        const endTime = new Date(formData.date);
        endTime.setHours(endHour, endMinute, 0, 0);

        let currentTime = new Date(startTime);

        while (currentTime < endTime) {
          const slotTime = currentTime.getTime();
          if (!bookedSlots.includes(slotTime)) {
            times.push(new Date(currentTime));
          }

          currentTime = new Date(currentTime.getTime() + appointmentDuration * 60000);
        }
      });

      setAvailableTimes(times);
    } else {
      setAvailableTimes([]);
    }
  }, [formData.date, bookedSlots, workingHours, workshopId]);

  useEffect(() => {
    if (typeSearch) {
      const filtered = vehicleTypes.filter((type) =>
        type.toLowerCase().includes(typeSearch.toLowerCase()),
      );
      setFilteredTypes(filtered);
    } else {
      setFilteredTypes(vehicleTypes);
    }
  }, [typeSearch, vehicleTypes]);

  const isDayDisabled = (date) => {
    if (workingHours?.hours) return true;
    const dayOfWeek = date.getDay();
    const dayWorkingHours = workingHours.hours[dayOfWeek] || [];
    return dayWorkingHours.length === 0;
  };

  const handlePlateChange = async (value) => {
    setFormData((prev) => ({ ...prev, plateNumber: value }));
    setShowVehicleSuggestions(false);
    setExistingVehicle(null);

    if (!value || value.length < 2 || !workshopId) return;

    const { data } = await supabase
      .from("Vehicles")
      .select("*, owner:ownerId(*)")
      .ilike("plateNumber", `%${value}%`)
      .eq("workshopId", workshopId)
      .limit(5);

    if (data?.length > 0) {
      setVehicleSuggestions(data);
      setShowVehicleSuggestions(true);
    } else {
      setShowVehicleFields(true);
    }
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setFormData((prev) => ({ ...prev, type }));
    setTypeSearch(type);
    setShowTypeDropdown(false);
  };

  const handleCustomerSearch = async (value) => {
    setFormData((prev) => ({ ...prev, fullName: value }));
    setShowCustomerSuggestions(false);
    setExistingCustomer(null);

    if (!value || value.length < 2 || !workshopId) return;

    const { data } = await supabase
      .from("Customers")
      .select("*")
      .or(`fullName.ilike.%${value}%,phoneNumber.ilike.%${value}%`)
      .eq("workshopId", workshopId)
      .limit(5);

    if (data?.length > 0) {
      setCustomerSuggestions(data);
      setShowCustomerSuggestions(true);
    } else {
      setShowCustomerFields(true);
    }
  };

  const selectVehicle = (vehicle) => {
    setFormData((prev) => ({
      ...prev,
      plateNumber: vehicle.plateNumber,
      brand: vehicle.brand || "",
      model: vehicle.model || "",
    }));

    if (vehicle.owner) {
      selectCustomer(vehicle.owner);
    }

    setExistingVehicle(vehicle);
    setShowVehicleSuggestions(false);
    setShowVehicleFields(false);
  };

  // Selezione cliente esistente
  const selectCustomer = (customer) => {
    setFormData((prev) => ({
      ...prev,
      fullName: customer.fullName,
      email: customer.email || "",
      phoneNumber: customer.phoneNumber || "",
      contactMethod: customer.contactMethod || "whatsapp",
    }));
    setExistingCustomer(customer);
    setShowCustomerSuggestions(false);
    setShowCustomerFields(false);
  };

  // Submit del form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (!workshopId) throw new Error("Nessun workshop associato");
      if (!formData.date || !formData.time)
        throw new Error("Seleziona data e ora");
      if (!formData.plateNumber)
        throw new Error("Inserisci la targa del veicolo");
      if (!formData.fullName || !formData.phoneNumber)
        throw new Error("Inserisci i dati del cliente");

      const appointmentDateTime = new Date(formData.date);
      appointmentDateTime.setHours(formData.time.getHours());
      appointmentDateTime.setMinutes(formData.time.getMinutes());

      let customerId = existingCustomer?.id;
      let vehicleId = existingVehicle?.id;

      // Gestione cliente
      if (!existingCustomer) {
        const { data: customerData, error: customerError } = await supabase
          .from("Customers")
          .insert([
            {
              fullName: formData.fullName,
              email: formData.email,
              phoneNumber: formData.phoneNumber,
              contactMethod: formData.contactMethod,
              PlateNumbers: [formData.plateNumber],
              workshopId,
            },
          ])
          .select()
          .single();

        if (customerError) throw customerError;
        customerId = customerData.id;
      }

      // Gestione veicolo
      if (!existingVehicle) {
        const { data: vehicleData, error: vehicleError } = await supabase
          .from("Vehicles")
          .insert([
            {
              plateNumber: formData.plateNumber,
              brand: formData.brand,
              model: formData.model,
              type: formData.type,
              workshopId,
              ownerId: customerId,
              lastAppointmentId: null,
              nextAppointmentId: null,
            },
          ])
          .select()
          .single();

        if (vehicleError) throw vehicleError;
        vehicleId = vehicleData.id;

        // Aggiorna targhe cliente se esisteva già
        if (existingCustomer) {
          const { data: customerData } = await supabase
            .from("Customers")
            .select("PlateNumbers")
            .eq("id", customerId)
            .single();

          const updatedPlates = [
            ...(customerData?.PlateNumbers || []),
            formData.plateNumber,
          ].filter((v, i, a) => a.indexOf(v) === i); // Rimuovi duplicati

          await supabase
            .from("Customers")
            .update({ PlateNumbers: updatedPlates })
            .eq("id", customerId);
        }
      }

      // Crea prenotazione
      const { data: appointmentData, error: appointmentError } = await supabase
        .from("Appointments")
        .insert([
          {
            date: appointmentDateTime.toISOString(),
            workshopId,
            customerId,
            vehicleId,
            status: formData.status,
          },
        ])
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      const { error: vehicleUpdateError } = await supabase
        .from("Vehicles")
        .update({
          lastAppointmentId: appointmentData.id,
          nextAppointmentId: appointmentData.id,
        })
        .eq("id", vehicleId);

      if (vehicleUpdateError) throw vehicleUpdateError;

      router.push("/dashboard/appointments");
    } catch (error) {
      console.error("Errore:", error);
      setError(
        error.message || "Si è verificato un errore durante il salvataggio.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
        <h1 className="text-2xl font-bold text-gray-800">Nuova Prenotazione</h1>
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          autoComplete="off"
        >
          <div className="space-y-6">
            {/* Sezione Data e Ora */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiCalendar className="text-blue-500" />
                Data e Ora
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data *
                  </label>
                  <DatePicker
                    selected={formData.date}
                    onChange={(date) =>
                      setFormData((prev) => ({ ...prev, date, time: null }))
                    }
                    minDate={new Date()}
                    filterDate={isDayDisabled}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Seleziona una data"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Orario *
                  </label>
                  {formData.date ? (
                    <div className="grid grid-cols-3 gap-2">
                      {availableTimes.length > 0 ? (
                        availableTimes.map((time, index) => (
                          <motion.button
                            key={index}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, time }))
                            }
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`py-2 px-3 rounded-lg text-sm ${
                              formData.time?.getTime() === time.getTime()
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 hover:bg-gray-200"
                            }`}
                          >
                            {formatTime(time)}
                          </motion.button>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 col-span-3">
                          {!workingHours?.hours ? 
                            "Caricamento orari di lavoro..." :
                            (workingHours.hours[formData.date?.getDay()]?.length === 0 ?
                              "Il centro è chiuso in questo giorno" :
                              "Nessun orario disponibile per questa data")
                          }
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Seleziona prima una data
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sezione Veicolo */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TfiCar className="text-blue-500" />
                Veicolo
              </h2>

              <div className="relative mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Targa *
                </label>
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
                        setFormData((prev) => ({
                          ...prev,
                          plateNumber: "",
                          brand: "",
                          model: "",
                        }));
                        setExistingVehicle(null);
                        setShowVehicleFields(false);
                      }}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <FiX />
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {showVehicleSuggestions && vehicleSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                    >
                      <ul className="py-1 max-h-60 overflow-auto">
                        {vehicleSuggestions.map((vehicle) => (
                          <li key={vehicle.id}>
                            <button
                              type="button"
                              onClick={() => selectVehicle(vehicle)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex justify-between items-center"
                            >
                              <span className="font-medium">
                                {vehicle.plateNumber}
                              </span>
                              <span className="text-sm text-gray-500">
                                {vehicle.brand} {vehicle.model}
                                {vehicle.owner &&
                                  ` (${vehicle.owner.fullName})`}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {(showVehicleFields ||
                  (existingVehicle &&
                    (!existingVehicle.brand || !existingVehicle.model))) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-4 mb-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marca *
                      </label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        required={showVehicleFields}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Modello *
                      </label>
                      <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        required={showVehicleFields}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>

                    {/* Tipo */}
                    <div className="relative h-50">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo
                      </label>
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
                                setFormData((prev) => ({ ...prev, type: "" }));
                              }}
                              className="text-gray-500 hover:text-red-500 transition-colors"
                            >
                              <FiX />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sezione Cliente */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FiUser className="text-blue-500" />
                Cliente
              </h2>

              <div className="relative mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome cliente *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                </div>

                <AnimatePresence>
                  {showCustomerSuggestions &&
                    customerSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                      >
                        <ul className="py-1 max-h-60 overflow-auto">
                          {customerSuggestions.map((customer) => (
                            <li key={customer.id}>
                              <button
                                type="button"
                                onClick={() => selectCustomer(customer)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex justify-between items-center"
                              >
                                <div>
                                  <div className="font-medium">
                                    {customer.fullName}
                                  </div>
                                  {customer.phoneNumber && (
                                    <div className="text-sm text-gray-500">
                                      {customer.phoneNumber}
                                    </div>
                                  )}
                                </div>
                                {customer.PlateNumbers?.length > 0 && (
                                  <span className="text-xs bg-gray-100 rounded-full px-2 py-1">
                                    {customer.PlateNumbers.length} targhe
                                  </span>
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {(showCustomerFields || !existingCustomer) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefono *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiPhone className="text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          required={!existingCustomer}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Metodo di contatto
                      </label>
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
                  </motion.div>
                )}
              </AnimatePresence>

              {existingCustomer && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {existingCustomer.fullName}
                      </h3>
                      <div className="text-sm text-gray-600 mt-1 space-y-1">
                        {existingCustomer.phoneNumber && (
                          <div className="flex items-center gap-2">
                            <FiPhone /> {existingCustomer.phoneNumber}
                          </div>
                        )}
                        {existingCustomer.email && (
                          <div className="flex items-center gap-2">
                            <FiMail /> {existingCustomer.email}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setExistingCustomer(null);
                        setFormData((prev) => ({
                          ...prev,
                          fullName: "",
                          email: "",
                          phoneNumber: "",
                        }));
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
              onClick={() => router.push("/dashboard/appointments")}
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
                isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
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
                  Crea Prenotazione
                </>
              )}
            </motion.button>
          </div>
        </motion.form>
      )}
    </motion.div>
  );
}