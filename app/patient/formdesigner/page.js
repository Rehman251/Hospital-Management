// app/form-designer/page.js
"use client";

import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { SuccessAlert, WarningAlert } from "@/components/alerts/alert";

// Only optional fields that exist in your SQL table
const OPTIONAL_FIELDS = [
  { name: "email_address", label: "Email Address", type: "email" },
  { name: "date_of_birth", label: "Date of Birth", type: "date" },
  { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
  { name: "blood_group", label: "Blood Group", type: "select", options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
  { name: "address", label: "Address", type: "textarea" },
  { name: "city", label: "City", type: "text" },
  { name: "state", label: "State", type: "text" },
  { name: "zip_code", label: "ZIP Code", type: "text" },
  { name: "country", label: "Country", type: "text" },
  { name: "emergency_contact_phone", label: "Emergency Contact Phone", type: "tel" },
  { name: "occupation", label: "Occupation", type: "text" },
  { name: "marital_status", label: "Marital Status", type: "select", options: ["Single", "Married", "Divorced", "Widowed"] },
  { name: "insurance_provider", label: "Insurance Provider", type: "text" },
  { name: "insurance_number", label: "Insurance Number", type: "text" },
  { name: "additional_notes", label: "Additional Notes", type: "textarea" },
];

const FieldCheckbox = ({ name, label, enabled, onToggle }) => (
  <div
    onClick={() => onToggle(name)}
    className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
      enabled 
        ? "border-blue-400 bg-blue-50" 
        : "border-gray-200 bg-white hover:border-blue-200"
    }`}
  >
    <div className={`w-4 h-4 rounded flex items-center justify-center border-2 ${
      enabled 
        ? "bg-blue-500 border-blue-500" 
        : "border-gray-300"
    }`}>
      {enabled && (
        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
    <span className={`font-medium text-xs ${enabled ? "text-gray-900" : "text-gray-600"}`}>
      {label}
    </span>
  </div>
);

export default function FormDesignerPage() {
  const [fields, setFields] = useState([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showWarningAlert, setShowWarningAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    try {
      const saved = localStorage.getItem("formDesignerConfig");
      if (saved) {
        const config = JSON.parse(saved);
        setFields(config.fields || OPTIONAL_FIELDS.map(f => ({ ...f, enabled: true })));
      } else {
        setFields(OPTIONAL_FIELDS.map(f => ({ ...f, enabled: true })));
      }
    } catch (err) {
      setFields(OPTIONAL_FIELDS.map(f => ({ ...f, enabled: true })));
    }
  };

  const toggle = (name) => {
    setFields(prev => prev.map(f => f.name === name ? { ...f, enabled: !f.enabled } : f));
  };

  const save = () => {
    const config = {
      fields: fields.map(({ name, label, enabled, type, options }) => ({
        name, label, enabled, type, options
      }))
    };
    localStorage.setItem("formDesignerConfig", JSON.stringify(config));
    setAlertMessage("Form design saved! Changes will appear in the Add Patient form.");
    setShowSuccessAlert(true);
  };

  const reset = () => {
    setAlertMessage("Reset to default fields.");
    setShowWarningAlert(true);
  };

  const confirmReset = () => {
    setFields(OPTIONAL_FIELDS.map(f => ({ ...f, enabled: true })));
    localStorage.removeItem("formDesignerConfig");
    setAlertMessage("Reset to default fields successfully!");
    setShowSuccessAlert(true);
  };

  const enabledCount = fields.filter(f => f.enabled).length;

  return (
    <div className="h-screen bg-gray-50 p-4 overflow-hidden">
      {/* Beautiful Alerts */}
      {showSuccessAlert && (
        <SuccessAlert 
          message={alertMessage} 
          onClose={() => setShowSuccessAlert(false)}
        />
      )}
      
      {showWarningAlert && (
        <WarningAlert 
          message="Are you sure you want to reset all fields to default?"
          onClose={() => setShowWarningAlert(false)}
          onConfirm={confirmReset}
        />
      )}

      <div className="h-full flex flex-col">
        {/* Header with Gradient */}
        <div 
          className="rounded-xl shadow-lg p-4 mb-4 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #2d5a7b 0%, #3a6b8a 100%)' }}>
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Patient Form Designer</h1>
              <p className="text-blue-100 text-xs">Customize optional fields for patient forms</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex-1 flex flex-col min-h-0">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}></div>
            <h2 className="text-base font-bold text-gray-900">Optional Fields</h2>
          </div>

          {/* Fields Grid - No scrolling needed */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-4">
            {fields.map(field => (
              <FieldCheckbox 
                key={field.name} 
                name={field.name} 
                label={field.label} 
                enabled={field.enabled} 
                onToggle={toggle} 
              />
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}>
                <span className="text-lg font-bold text-white">{enabledCount}</span>
              </div>
              <div>
                <p className="text-sm font-semibold">Optional Fields Enabled</p>
                <p className="text-xs text-gray-500">Out of {fields.length}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={reset} 
                className="px-4 py-2 border-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
                style={{ borderColor: '#1e3a5f', color: '#1e3a5f' }}
              >
                Reset
              </button>
              <button 
                onClick={save} 
                className="px-4 py-2 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
                style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}
              >
                Save Design
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}