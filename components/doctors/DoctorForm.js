"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { X, User, Mail, Phone, Award, Briefcase, GraduationCap, MapPin, Stethoscope } from "lucide-react";
import { SuccessAlert, ErrorAlert, WarningAlert } from "@/components/alerts/alert";

export default function DoctorForm({ doctor, editMode, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    license_number: "",
    specialization: "",
    status: "Active",
    experience_years: "",
    qualification: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Specializations list
  const specializations = [
    "Cardiology",
    "Neurology",
    "Pediatrics",
    "Orthopedics",
    "Dermatology",
    "Psychiatry",
    "Oncology",
    "Radiology",
    "Anesthesiology",
    "General Practice",
  ];

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 4000);
  };

  // Load doctor data if editing
  useEffect(() => {
    if (editMode && doctor) {
      setFormData({
        name: doctor.name || "",
        email: doctor.email || "",
        phone: doctor.phone || "",
        license_number: doctor.license_number || "",
        specialization: doctor.specialization || "",
        status: doctor.status || "Active",
        experience_years: doctor.experience_years || "",
        qualification: doctor.qualification || "",
        address: doctor.address || "",
      });
    }
  }, [doctor, editMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.license_number.trim()) newErrors.license_number = "License number is required";
    if (!formData.specialization) newErrors.specialization = "Specialization is required";
    if (!formData.experience_years) newErrors.experience_years = "Experience is required";
    else if (formData.experience_years < 0) newErrors.experience_years = "Experience must be positive";
    if (!formData.qualification.trim()) newErrors.qualification = "Qualification is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (editMode && doctor) {
        // Update existing doctor
        const { data, error } = await supabase
          .from("doctors")
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            license_number: formData.license_number,
            specialization: formData.specialization,
            status: formData.status,
            experience_years: parseInt(formData.experience_years),
            qualification: formData.qualification,
            address: formData.address,
          })
          .eq("id", doctor.id)
          .select();

        if (error) throw error;

        showAlert('success', "Doctor updated successfully!");
      } else {
        // Add new doctor
        const { data, error } = await supabase
          .from("doctors")
          .insert([
            {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              license_number: formData.license_number,
              specialization: formData.specialization,
              status: formData.status,
              experience_years: parseInt(formData.experience_years),
              qualification: formData.qualification,
              address: formData.address,
            }
          ])
          .select();

        if (error) throw error;

        showAlert('success', "Doctor added successfully!");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving doctor:", error);
      
      // Handle specific Supabase errors
      if (error.code === '23505') {
        if (error.message.includes('email')) {
          setErrors({ email: "This email is already registered" });
          showAlert('error', "This email is already registered");
        } else if (error.message.includes('license_number')) {
          setErrors({ license_number: "This license number is already registered" });
          showAlert('error', "This license number is already registered");
        } else {
          showAlert('error', "This doctor already exists in the system");
        }
      } else {
        showAlert('error', "Failed to save doctor. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
      {/* Alert Component */}
      {alert.show && (
        <div className="fixed top-4 right-4 z-50">
          {alert.type === 'success' && <SuccessAlert message={alert.message} />}
          {alert.type === 'error' && <ErrorAlert message={alert.message} />}
          {alert.type === 'warning' && <WarningAlert message={alert.message} />}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div 
          className="px-6 py-4 flex items-center justify-between border-b border-gray-200"
          style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)'
          }}
        >
          <h2 className="text-xl font-bold text-white">
            {editMode ? "Edit Doctor" : "Add New Doctor"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Dr. John Doe"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="john.doe@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* License Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Award className="w-4 h-4 inline mr-2" />
                License Number *
              </label>
              <input
                type="text"
                name="license_number"
                value={formData.license_number}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  errors.license_number ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="MD-2024-001"
              />
              {errors.license_number && <p className="text-red-500 text-xs mt-1">{errors.license_number}</p>}
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Stethoscope className="w-4 h-4 inline mr-2" />
                Specialization *
              </label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  errors.specialization ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Specialization</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              {errors.specialization && <p className="text-red-500 text-xs mt-1">{errors.specialization}</p>}
            </div>

            {/* Experience Years */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Experience (Years) *
              </label>
              <input
                type="number"
                name="experience_years"
                value={formData.experience_years}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  errors.experience_years ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="5"
                min="0"
              />
              {errors.experience_years && <p className="text-red-500 text-xs mt-1">{errors.experience_years}</p>}
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <GraduationCap className="w-4 h-4 inline mr-2" />
                Qualification *
              </label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  errors.qualification ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="MBBS, MD"
              />
              {errors.qualification && <p className="text-red-500 text-xs mt-1">{errors.qualification}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                placeholder="123 Medical Center, City, State, ZIP"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)'
              }}
            >
              {loading ? "Saving..." : editMode ? "Update Doctor" : "Add Doctor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}