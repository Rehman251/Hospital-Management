"use client";

import { useState, useEffect } from "react";
import PatientForm from "@/components/patients/PatientForm";
import { supabase } from "@/lib/supabase";

function AddPatientPage() {
  const [patients, setPatients] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load patients from Supabase on component mount
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowAddModal(false);
    fetchPatients();
  };

  // Get today's patients only
  const getTodayPatients = () => {
    const today = new Date().toDateString();
    return patients.filter(patient => {
      if (!patient.registration_date) return false;
      const registrationDate = new Date(patient.registration_date).toDateString();
      return registrationDate === today;
    });
  };

  const todayPatients = getTodayPatients();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Simple Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Register Patient</h1>
        <p className="text-gray-500 mt-1">
          Add new patients and view today's registrations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Patient Form */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">
            Patient Registration Form
          </h2>
          <div className="text-center py-8">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 text-white px-8 py-4 rounded-lg font-medium transition-all hover:shadow-lg mx-auto"
              style={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)'
              }}
            >
              <span className="text-2xl">+</span>
              Add New Patient
            </button>
            <p className="text-gray-500 mt-4 text-sm">
              Click to open patient registration form
            </p>
          </div>
        </div>

        {/* Right Column - Today's Patients Only */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Today's Registrations</h2>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
          
          {/* Today's Count */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">Today's Total</span>
              <span className="text-2xl font-bold text-blue-600">{todayPatients.length}</span>
            </div>
          </div>

          {/* Today's Patients List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : todayPatients.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <p className="text-gray-500">No patients registered today</p>
              <p className="text-gray-400 text-sm mt-1">Patients added today will appear here</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {todayPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {patient.full_name?.charAt(0) || 'P'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {patient.full_name || 'Unnamed Patient'}
                        </h3>
                        <p className="text-xs text-gray-500">ID: {patient.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {patient.phone_number || 'No phone'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {patient.email_address && (
                      <div className="truncate">{patient.email_address}</div>
                    )}
                    {patient.age && patient.gender && (
                      <div className="text-gray-500">
                        {patient.age} yrs • {patient.gender}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <PatientForm
          patient={null}
          editMode={false}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}

export default AddPatientPage;