"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { SuccessAlert, WarningAlert, ErrorAlert } from "@/components/alerts/alert";

export default function BookAppointmentModal({ isOpen, onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [existingAppointments, setExistingAppointments] = useState([]);
  const [timeConflict, setTimeConflict] = useState(false);
  const [conflictDetails, setConflictDetails] = useState("");
  const [checkingConflict, setCheckingConflict] = useState(false);

  // Alert states
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showWarningAlert, setShowWarningAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    doctor_id: "",
    doctor_name: "",
    patient_id: "",
    patient_name: "",
    patient_phone: "",
    patient_mr: "",
    appointment_date: "",
    start_time: "",
    end_time: "",
    appointment_type: "Emergency",
    appointment_status: "Scheduled",
    fee: "",
    notes: ""
  });

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
      fetchPatients();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = patients.filter(p =>
        p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.mr_number?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, patients]);

  // Check for time conflicts when doctor, date, or time changes
  useEffect(() => {
    if (formData.doctor_id && formData.appointment_date && formData.start_time && formData.end_time) {
      checkTimeSlotConflict();
    } else {
      setTimeConflict(false);
      setConflictDetails("");
    }
  }, [formData.doctor_id, formData.appointment_date, formData.start_time, formData.end_time]);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('name');
      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('full_name');
      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const fetchExistingAppointments = async (doctorId, date) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('appointment_date', date);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching existing appointments:", error);
      return [];
    }
  };

  const checkTimeSlotConflict = async () => {
    if (!formData.doctor_id || !formData.appointment_date || !formData.start_time || !formData.end_time) {
      return;
    }

    setCheckingConflict(true);
    
    try {
      const appointments = await fetchExistingAppointments(formData.doctor_id, formData.appointment_date);
      setExistingAppointments(appointments);

      const newStart = formData.start_time;
      const newEnd = formData.end_time;

      const conflict = appointments.some(apt => {
        const existingStart = apt.start_time;
        const existingEnd = apt.end_time;
        
        // Check for overlap: new appointment starts during existing OR existing starts during new
        return (newStart < existingEnd && newEnd > existingStart);
      });

      if (conflict) {
        setTimeConflict(true);
        const conflictingAppointment = appointments.find(apt => 
          (newStart < apt.end_time && newEnd > apt.start_time)
        );
        setConflictDetails(`Doctor has existing appointment from ${conflictingAppointment?.start_time} to ${conflictingAppointment?.end_time}`);
        setShowWarningAlert(true);
      } else {
        setTimeConflict(false);
        setConflictDetails("");
      }
    } catch (error) {
      console.error("Error checking time conflict:", error);
    } finally {
      setCheckingConflict(false);
    }
  };

  const handleDoctorSelect = (e) => {
    const selectedDoctor = doctors.find(d => d.id === e.target.value);
    setFormData({
      ...formData,
      doctor_id: e.target.value,
      doctor_name: selectedDoctor?.name || ""
    });
  };

  const handlePatientSelect = (patient) => {
    setFormData({
      ...formData,
      patient_id: patient.id,
      patient_name: patient.full_name,
      patient_phone: patient.phone_number,
      patient_mr: patient.mr_number
    });
    setSearchQuery(patient.full_name);
    setSearchResults([]);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.doctor_id || !formData.patient_id) {
        setShowWarningAlert(true);
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.appointment_date || !formData.start_time || !formData.end_time) {
        setShowWarningAlert(true);
        return;
      }
      if (timeConflict) {
        setShowWarningAlert(true);
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (timeConflict) {
      setShowWarningAlert(true);
      return;
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .insert([{
          doctor_id: formData.doctor_id,
          doctor_name: formData.doctor_name,
          patient_id: formData.patient_id,
          patient_name: formData.patient_name,
          phone: formData.patient_phone,
          appointment_date: formData.appointment_date,
          appointment_time: `${formData.start_time} - ${formData.end_time}`,
          start_time: formData.start_time,
          end_time: formData.end_time,
          appointment_type: formData.appointment_type,
          status: formData.appointment_status,
          fee: formData.fee,
          notes: formData.notes
        }]);

      if (error) throw error;

      setShowSuccessAlert(true);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error booking appointment:", error);
      setShowErrorAlert(true);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      doctor_id: "",
      doctor_name: "",
      patient_id: "",
      patient_name: "",
      patient_phone: "",
      patient_mr: "",
      appointment_date: "",
      start_time: "",
      end_time: "",
      appointment_type: "Emergency",
      appointment_status: "Scheduled",
      fee: "",
      notes: ""
    });
    setSearchQuery("");
    setSearchResults([]);
    setTimeConflict(false);
    setConflictDetails("");
    onClose();
  };

  if (!isOpen) return null;

  return (
<div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">     {showSuccessAlert && (
        <SuccessAlert 
          message="Appointment booked successfully!" 
          onClose={() => setShowSuccessAlert(false)}
        />
      )}
      
      {showWarningAlert && (
        <WarningAlert 
          message={
            timeConflict 
              ? `Time slot conflict! ${conflictDetails}`
              : "Please fill in all required fields"
          } 
          onClose={() => setShowWarningAlert(false)}
        />
      )}
      
      {showErrorAlert && (
        <ErrorAlert 
          message="Failed to book appointment. Please try again." 
          onClose={() => setShowErrorAlert(false)}
        />
      )}

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
              style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Book New Appointment</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step Indicators */}
        <div className="px-6 py-8 border-b border-gray-200">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {/* Step 1 */}
            <div className="flex flex-col items-center flex-1">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  currentStep >= 1 
                    ? "text-white" 
                    : "bg-gray-200 text-gray-500"
                }`}
                style={currentStep >= 1 ? { background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' } : {}}
              >
                1
              </div>
              <p className={`mt-2 text-sm font-medium ${
                currentStep >= 1 ? "text-blue-600" : "text-gray-500"
              }`}>
                Select Doctor &<br />Patient
              </p>
            </div>

            {/* Connector */}
            <div 
              className={`h-1 flex-1 mx-4 ${
                currentStep >= 2 
                  ? "" 
                  : "bg-gray-200"
              }`}
              style={currentStep >= 2 ? { background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' } : {}}
            ></div>

            {/* Step 2 */}
            <div className="flex flex-col items-center flex-1">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  currentStep >= 2 
                    ? "text-white" 
                    : "bg-gray-200 text-gray-500"
                }`}
                style={currentStep >= 2 ? { background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' } : {}}
              >
                2
              </div>
              <p className={`mt-2 text-sm font-medium ${
                currentStep >= 2 ? "text-blue-600" : "text-gray-500"
              }`}>
                Schedule & Time Slot
              </p>
            </div>

            {/* Connector */}
            <div 
              className={`h-1 flex-1 mx-4 ${
                currentStep >= 3 
                  ? "" 
                  : "bg-gray-200"
              }`}
              style={currentStep >= 3 ? { background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' } : {}}
            ></div>

            {/* Step 3 */}
            <div className="flex flex-col items-center flex-1">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  currentStep >= 3 
                    ? "text-white" 
                    : "bg-gray-200 text-gray-500"
                }`}
                style={currentStep >= 3 ? { background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' } : {}}
              >
                3
              </div>
              <p className={`mt-2 text-sm font-medium ${
                currentStep >= 3 ? "text-blue-600" : "text-gray-500"
              }`}>
                Details &<br />Confirmation
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-6 py-6">
          {/* Step 1: Select Doctor & Patient */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Select Doctor */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  1. Select Doctor <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.doctor_id}
                  onChange={handleDoctorSelect}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose a Doctor --</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search & Select Patient */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  2. Search & Select Patient <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by Name, Phone, or MR No."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="mt-2 border border-gray-300 rounded-lg max-h-60 overflow-y-auto bg-white shadow-lg">
                    {searchResults.map(patient => (
                      <div
                        key={patient.id}
                        onClick={() => handlePatientSelect(patient)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <p className="font-medium text-gray-900">{patient.full_name}</p>
                        <p className="text-sm text-gray-600">{patient.phone_number} • {patient.mr_number}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Patient Display */}
                {formData.patient_name && (
                  <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-semibold text-blue-900">Selected Patient:</p>
                    <p className="text-gray-700">{formData.patient_name}</p>
                    <p className="text-sm text-gray-600">{formData.patient_phone} • {formData.patient_mr}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Schedule & Time Slot */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Appointment Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Appointment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Start and End Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Time Conflict Warning */}
              {timeConflict && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-red-800">Time Slot Conflict!</p>
                      <p className="text-sm text-red-700">{conflictDetails}</p>
                      <p className="text-sm text-red-600 mt-1">Please choose a different time slot.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Checking Conflict Indicator */}
              {checkingConflict && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-blue-700">Checking for time slot conflicts...</p>
                  </div>
                </div>
              )}

              {/* Note */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-semibold text-yellow-800">Note:</p>
                  <p className="text-sm text-yellow-700">
                    The system automatically checks for time slot conflicts in real-time.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Details & Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Appointment Type and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Appointment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.appointment_type}
                    onChange={(e) => setFormData({ ...formData, appointment_type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Emergency">Emergency</option>
                    <option value="Regular">Regular</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Consultation">Consultation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Appointment Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.appointment_status}
                    onChange={(e) => setFormData({ ...formData, appointment_status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Fee */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fee (PKR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter consultation fee"
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes / Reason for Visit
                </label>
                <textarea
                  placeholder="Enter any additional notes or reason for the appointment..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Final Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="font-bold text-green-900">Final Summary:</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700 font-medium">Doctor:</span>
                    <span className="text-green-900">{formData.doctor_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700 font-medium">Patient:</span>
                    <span className="text-green-900">{formData.patient_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700 font-medium">Date:</span>
                    <span className="text-green-900">{formData.appointment_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700 font-medium">Time:</span>
                    <span className="text-green-900">{formData.start_time} - {formData.end_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700 font-medium">Type:</span>
                    <span className="text-green-900">{formData.appointment_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700 font-medium">Fee:</span>
                    <span className="text-green-900">PKR {formData.fee}</span>
                  </div>
                </div>
              </div>

              {/* Time Conflict Warning in Final Step */}
              {timeConflict && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-red-800">Cannot Book Appointment!</p>
                      <p className="text-sm text-red-700">{conflictDetails}</p>
                      <p className="text-sm text-red-600 mt-1">Please go back and choose a different time slot.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
              currentStep === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              disabled={timeConflict || checkingConflict}
              className="flex items-center gap-2 text-white px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}
              onMouseOver={(e) => !timeConflict && !checkingConflict && (e.target.style.background = 'linear-gradient(135deg, #2d5a7b 0%, #3d6a8b 100%)')}
              onMouseOut={(e) => !timeConflict && !checkingConflict && (e.target.style.background = 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)')}
            >
              Next
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={timeConflict}
              className="text-white px-8 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}
              onMouseOver={(e) => !timeConflict && (e.target.style.background = 'linear-gradient(135deg, #2d5a7b 0%, #3d6a8b 100%)')}
              onMouseOut={(e) => !timeConflict && (e.target.style.background = 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)')}
            >
              Book Appointment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}