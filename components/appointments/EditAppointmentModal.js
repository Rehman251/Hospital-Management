"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function EditAppointmentModal({ isOpen, onClose, appointment, onSuccess }) {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

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
    appointment_type: "Regular",
    status: "Scheduled",
    fee: "",
    notes: ""
  });

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
      fetchPatients();
      if (appointment) {
        // Parse the time slot if it exists
        let startTime = "";
        let endTime = "";
        
        if (appointment.appointment_time) {
          const timeParts = appointment.appointment_time.split(' - ');
          if (timeParts.length === 2) {
            startTime = timeParts[0];
            endTime = timeParts[1];
          }
        }

        setFormData({
          doctor_id: appointment.doctor_id || "",
          doctor_name: appointment.doctor_name || "",
          patient_id: appointment.patient_id || "",
          patient_name: appointment.patient_name || "",
          patient_phone: appointment.phone || "",
          patient_mr: appointment.patient_mr || "",
          appointment_date: appointment.appointment_date || "",
          start_time: appointment.start_time || startTime,
          end_time: appointment.end_time || endTime,
          appointment_type: appointment.appointment_type || "Regular",
          status: appointment.status || "Scheduled",
          fee: appointment.fee || "",
          notes: appointment.notes || ""
        });
      }
    }
  }, [isOpen, appointment]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.doctor_id || !formData.patient_id || !formData.appointment_date || !formData.start_time || !formData.end_time) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('appointments')
        .update({
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
          status: formData.status,
          fee: formData.fee,
          notes: formData.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointment.id);

      if (error) throw error;

      alert("Appointment updated successfully!");
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Failed to update appointment. Please try again.");
    } finally {
      setLoading(false);
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

  const handlePatientSelect = (e) => {
    const selectedPatient = patients.find(p => p.id === e.target.value);
    setFormData({
      ...formData,
      patient_id: e.target.value,
      patient_name: selectedPatient?.full_name || "",
      patient_phone: selectedPatient?.phone_number || "",
      patient_mr: selectedPatient?.mr_number || ""
    });
  };

  const handleClose = () => {
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
      appointment_type: "Regular",
      status: "Scheduled",
      fee: "",
      notes: ""
    });
    onClose();
  };

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-2xl w-full max-w-4xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit Appointment</h2>
              <p className="text-sm text-gray-600">Update appointment information</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Doctor <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.doctor_id}
              onChange={handleDoctorSelect}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Choose a Doctor --</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>

          {/* Patient Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Patient <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.patient_id}
              onChange={handlePatientSelect}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Choose a Patient --</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.full_name} - {patient.phone_number} - {patient.mr_number}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Appointment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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
                required
              />
            </div>
          </div>

          {/* Type and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Appointment Type
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
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Fee */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fee (PKR)
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
              Notes
            </label>
            <textarea
              placeholder="Enter any additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}