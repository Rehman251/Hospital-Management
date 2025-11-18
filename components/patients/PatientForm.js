// components/patients/PatientForm.js
"use client";

import { useState, useEffect } from "react";
import {
  X, User, Mail, Phone, Calendar, MapPin, Droplets, Briefcase, 
  Heart, FileText, Home, Building, Globe
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SuccessAlert, ErrorAlert } from "@/components/alerts/alert";

// Only fields that exist in your SQL table
const DEFAULT_CONFIG = {
  fields: [
    // Required fields are now handled separately and always included
    { name: "email_address", enabled: true, type: "email", required: false, label: "Email Address" },
    { name: "date_of_birth", enabled: true, type: "date", required: false, label: "Date of Birth" },
    { name: "gender", enabled: true, type: "select", required: false, label: "Gender", options: ["Male", "Female", "Other"] },
    { name: "blood_group", enabled: true, type: "select", required: false, label: "Blood Group", options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
    { name: "address", enabled: true, type: "textarea", required: false, label: "Address" },
    { name: "city", enabled: true, type: "text", required: false, label: "City" },
    { name: "state", enabled: true, type: "text", required: false, label: "State" },
    { name: "zip_code", enabled: true, type: "text", required: false, label: "ZIP Code" },
    { name: "country", enabled: true, type: "text", required: false, label: "Country" },
    { name: "emergency_contact_phone", enabled: true, type: "tel", required: false, label: "Emergency Contact Phone" },
    { name: "occupation", enabled: true, type: "text", required: false, label: "Occupation" },
    { name: "marital_status", enabled: true, type: "select", required: false, label: "Marital Status", options: ["Single", "Married", "Divorced", "Widowed"] },
    { name: "insurance_provider", enabled: true, type: "text", required: false, label: "Insurance Provider" },
    { name: "insurance_number", enabled: true, type: "text", required: false, label: "Insurance Number" },
    { name: "additional_notes", enabled: true, type: "textarea", required: false, label: "Additional Notes" },
  ]
};

export default function PatientForm({ patient, editMode, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email_address: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    emergency_contact_phone: '',
    occupation: '',
    marital_status: '',
    insurance_provider: '',
    insurance_number: '',
    additional_notes: '',
    status: 'Active'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 4000);
  };

  const getConfig = () => {
    try {
      const saved = localStorage.getItem("formDesignerConfig");
      if (saved) {
        const { fields } = JSON.parse(saved);
        return { fields: fields.filter(f => f.enabled) };
      }
    } catch (err) { }
    return { fields: DEFAULT_CONFIG.fields.filter(f => f.enabled) };
  };

  const getIcon = (name) => {
    const map = {
      "full_name": User, "email_address": Mail, "phone_number": Phone,
      "date_of_birth": Calendar, "gender": User, "blood_group": Droplets,
      "address": MapPin, "city": Building, "state": Home, "zip_code": FileText, "country": Globe,
      "emergency_contact_phone": Phone, "occupation": Briefcase,
      "marital_status": Heart, "insurance_provider": FileText, "insurance_number": FileText,
      "additional_notes": FileText, "status": User
    };
    return map[name] || User;
  };

  const getEnabledFields = () => {
    const { fields } = getConfig();
    // Always include required fields + status field + optional fields from config
    const requiredFields = [
      { name: "full_name", enabled: true, type: "text", required: true, label: "Full Name" },
      { name: "phone_number", enabled: true, type: "tel", required: true, label: "Phone Number" }
    ];
    
    const statusField = { name: "status", enabled: true, type: "select", required: true, label: "Status", options: ["Active", "Inactive"] };
    
    return [...requiredFields, ...fields, statusField];
  };

  useEffect(() => {
    const fields = getEnabledFields();
    const initial = {};
    
    if (editMode && patient) {
      // Map existing patient data to form
      fields.forEach(field => {
        initial[field.name] = patient[field.name] || "";
      });
    } else {
      // Set default values for new patient
      fields.forEach(field => {
        initial[field.name] = "";
      });
      initial.status = "Active";
    }
    setFormData(initial);
  }, [patient, editMode]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const fields = getEnabledFields();
    const err = {};
    fields.forEach(f => {
      const val = formData[f.name]?.toString().trim();
      if (f.required && !val) err[f.name] = `${f.label} is required`;
      if (f.name === "email_address" && val && !/\S+@\S+\.\S+/.test(val)) err[f.name] = "Invalid email";
    });
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      // Calculate age from date of birth
      const calculateAge = (dob) => {
        if (!dob) return null;
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      };

      const patientData = {
        full_name: formData.full_name,
        email_address: formData.email_address,
        phone_number: formData.phone_number,
        date_of_birth: formData.date_of_birth || null,
        age: calculateAge(formData.date_of_birth),
        gender: formData.gender,
        blood_group: formData.blood_group,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        country: formData.country,
        emergency_contact_phone: formData.emergency_contact_phone,
        occupation: formData.occupation,
        marital_status: formData.marital_status,
        insurance_provider: formData.insurance_provider,
        insurance_number: formData.insurance_number,
        additional_notes: formData.additional_notes,
        status: formData.status || "Active"
      };

      if (editMode && patient?.id) {
        const { error } = await supabase
          .from("patients")
          .update(patientData)
          .eq("id", patient.id);
        if (error) throw error;
        showAlert('success', "Patient updated successfully!");
      } else {
        const { error } = await supabase
          .from("patients")
          .insert([patientData]);
        if (error) throw error;
        showAlert('success', "Patient added successfully!");
      }
      onSuccess();
    } catch (err) {
      console.error("Error saving patient:", err);
      showAlert('error', "Error saving patient. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (f) => {
    const common = {
      value: formData[f.name] || "",
      onChange: e => handleChange(f.name, e.target.value),
      className: `w-full px-4 py-3 pl-10 bg-gray-50 border ${errors[f.name] ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200`,
      placeholder: `Enter ${f.label}`
    };
    
    if (f.type === "select") {
      return (
        <select {...common}>
          <option value="">Select {f.label}</option>
          {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    }
    if (f.type === "textarea") return <textarea {...common} rows={2} />;
    if (f.type === "date") return <input type="date" {...common} />;
    return <input type={f.type} {...common} />;
  };

  const Icon = ({ name }) => {
    const I = getIcon(name);
    return <I className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />;
  };

  const fields = getEnabledFields();
  
  // Separate required fields to show first
  const requiredFields = fields.filter(f => f.required && f.name !== "status");
  const optionalFields = fields.filter(f => !f.required);
  const statusField = fields.find(f => f.name === "status");

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
      {/* Alert Component */}
      {alert.show && (
        <div className="fixed top-4 right-4 z-60">
          {alert.type === 'success' && <SuccessAlert message={alert.message} />}
          {alert.type === 'error' && <ErrorAlert message={alert.message} />}
        </div>
      )}
      
      {/* Modal - Clean white background */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header with Gradient */}
        <div 
          className="px-6 py-4 flex justify-between items-center"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}
        >
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">{editMode ? "Edit" : "Add"} Patient</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-white p-2 rounded-full hover:bg-white/20 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]" 
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <style jsx>{`
            form::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {/* Required Fields - Full Name and Phone Number always first */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {requiredFields.map(f => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {f.label} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Icon name={f.name} />
                  {renderField(f)}
                </div>
                {errors[f.name] && <p className="text-red-500 text-xs mt-1">{errors[f.name]}</p>}
              </div>
            ))}
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {optionalFields.map(f => (
              <div key={f.name} className={f.type === "textarea" ? "lg:col-span-3" : ""}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <div className="relative">
                  <Icon name={f.name} />
                  {renderField(f)}
                </div>
                {errors[f.name] && <p className="text-red-500 text-xs mt-1">{errors[f.name]}</p>}
              </div>
            ))}
          </div>

          {/* Status Field */}
          {statusField && (
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
              <div className="relative max-w-xs">
                <Icon name="status" />
                {renderField(statusField)}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-6 py-2.5 text-white rounded-lg hover:shadow-lg disabled:opacity-50 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}
            >
              {loading ? "Saving..." : editMode ? "Update Patient" : "Add Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}