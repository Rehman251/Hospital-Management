"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import ServicesSection from "./ServicesSection";
import PaymentsSection from "./PaymentsSection";

export default function InvoiceForm({ invoiceData, setInvoiceData }) {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  // Fetch doctors and patients on mount
  useEffect(() => {
    fetchDoctors();
    fetchPatients();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, name')
        .eq('status', 'Active')
        .order('name');

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, phone_number')
        .eq('status', 'Active')
        .order('full_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    patient.phone_number?.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const selectedPatient = patients.find(p => p.id === invoiceData.patient_id);

  const handlePatientSelect = (patient) => {
    setInvoiceData(prev => ({ ...prev, patient_id: patient.id }));
    setPatientSearch(patient.full_name);
    setShowPatientDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPatientDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-6">
      {/* Basic Information Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}></div>
          <h2 className="text-lg font-semibold text-gray-900">Invoice Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Doctor Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doctor *
            </label>
            {loading ? (
              <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-400">
                Loading doctors...
              </div>
            ) : (
              <select
                value={invoiceData.doctor_id}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, doctor_id: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-200"
              >
                <option value="">Select Doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Patient Searchable Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient *
            </label>
            <input
              type="text"
              value={patientSearch}
              onChange={(e) => {
                setPatientSearch(e.target.value);
                setShowPatientDropdown(true);
              }}
              onFocus={() => setShowPatientDropdown(true)}
              placeholder="Search patient..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-200"
            />
            
            {showPatientDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto scrollbar-hide">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map(patient => (
                    <div
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient)}
                      className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0"
                    >
                      <div className="font-medium text-gray-900">{patient.full_name}</div>
                      <div className="text-xs text-gray-500">{patient.phone_number}</div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 text-sm text-center">No patients found</div>
                )}
              </div>
            )}
          </div>

          {/* Invoice Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Date *
            </label>
            <input
              type="date"
              value={invoiceData.invoice_date}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, invoice_date: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-200"
            />
          </div>
        </div>
      </div>

      {/* Services Section */}
      <ServicesSection 
        services={invoiceData.services}
        setServices={(services) => setInvoiceData(prev => ({ ...prev, services }))}
      />

      {/* Payments Section */}
      <PaymentsSection 
        payments={invoiceData.payments}
        setPayments={(payments) => setInvoiceData(prev => ({ ...prev, payments }))}
      />

      {/* Notes Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}></div>
          <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
        </div>
        <textarea
          value={invoiceData.notes}
          onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
          rows="4"
          placeholder="Add any additional notes here..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-200 resize-none"
        />
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}