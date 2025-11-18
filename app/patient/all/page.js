"use client";

import { useState, useEffect } from "react";
import PatientListView from "@/components/patients/PatientListView";
import PatientForm from "@/components/patients/PatientForm";
import PatientViewModal from "@/components/patients/PatientViewModal";
import { supabase } from "@/lib/supabase";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { SuccessAlert, WarningAlert, ErrorAlert } from "@/components/alerts/alert";

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickSearch, setQuickSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Alert states - KEEPING YOUR EXISTING ALERT SYSTEM
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showWarningAlert, setShowWarningAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // ADDED: Delete confirmation states like doctors
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  // Load patients from Supabase on component mount
  useEffect(() => {
    fetchPatients();
  }, []);

  // Filter patients based on search
  useEffect(() => {
    filterPatients();
  }, [searchQuery, quickSearch, patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const patientsData = data || [];
      setPatients(patientsData);
      setFilteredPatients(patientsData);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
      setFilteredPatients([]);
      setAlertMessage("Failed to load patients");
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = patients;

    // Apply main search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (patient) =>
          patient.full_name?.toLowerCase().includes(query) ||
          patient.email_address?.toLowerCase().includes(query) ||
          patient.phone_number?.toLowerCase().includes(query) ||
          patient.mr_number?.toLowerCase().includes(query) ||
          patient.cnic?.toLowerCase().includes(query)
      );
    }

    // Apply quick search
    if (quickSearch.trim()) {
      const query = quickSearch.toLowerCase();
      filtered = filtered.filter(
        (patient) =>
          patient.full_name?.toLowerCase().includes(query) ||
          patient.phone_number?.toLowerCase().includes(query) ||
          patient.mr_number?.toLowerCase().includes(query)
      );
    }

    setFilteredPatients(filtered);
  };

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setEditMode(false);
    setShowAddModal(true);
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setEditMode(true);
    setShowAddModal(true);
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowViewModal(true);
  };

  // CHANGED: Updated delete handler to use modal instead of WarningAlert
  const handleDeletePatient = (patient) => {
    setPatientToDelete(patient);
    setShowDeleteConfirm(true);
  };

  // ADDED: Delete confirmation function like doctors
  const handleDeleteConfirm = async () => {
    if (!patientToDelete) return;

    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientToDelete.id);

      if (error) throw error;
      
      await fetchPatients();
      setAlertMessage("Patient deleted successfully!");
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Error deleting patient:", error);
      setAlertMessage("Failed to delete patient. Please try again.");
      setShowErrorAlert(true);
    } finally {
      setShowDeleteConfirm(false);
      setPatientToDelete(null);
    }
  };

  // ADDED: Delete cancel function
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setPatientToDelete(null);
  };

  const handleFormSuccess = () => {
    setShowAddModal(false);
    fetchPatients();
    setAlertMessage(editMode ? "Patient updated successfully!" : "Patient added successfully!");
    setShowSuccessAlert(true);
  };

  // Export to Excel (CSV) - KEEPING YOUR EXISTING CODE
  const exportToExcel = () => {
    try {
      const headers = ["Name", "Phone", "MR Number", "Registration Date"];
      const csvContent = [
        headers.join(","),
        ...filteredPatients.map(patient => 
          [
            `"${patient.full_name || ""}"`,
            `"${patient.phone_number || ""}"`,
            `"${patient.mr_number || ""}"`,
            `"${patient.registration_date || ""}"`
          ].join(",")
        )
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `patients_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setAlertMessage("Patients exported to Excel successfully!");
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      setAlertMessage("Failed to export to Excel. Please try again.");
      setShowErrorAlert(true);
    }
  };

  // Export to PDF - KEEPING YOUR EXISTING CODE
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.text("Patient Management Report", 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      doc.text(`Total Patients: ${filteredPatients.length}`, 14, 37);

      const tableData = filteredPatients.map(patient => [
        patient.full_name || "N/A",
        patient.phone_number || "N/A",
        patient.mr_number || "N/A",
        patient.registration_date || "N/A"
      ]);

      autoTable(doc, {
        startY: 45,
        head: [["Name", "Phone", "MR Number", "Registration Date"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [30, 58, 95], // Your theme blue color
          textColor: 255,
          fontSize: 10,
          fontStyle: "bold",
          halign: "left"
        },
        bodyStyles: {
          fontSize: 9,
          textColor: 50
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        margin: { top: 45 }
      });

      doc.save(`patients_${new Date().toISOString().split('T')[0]}.pdf`);
      
      setAlertMessage("Patients exported to PDF successfully!");
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      setAlertMessage("Failed to export to PDF. Please try again.");
      setShowErrorAlert(true);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Beautiful Alerts - KEEPING YOUR EXISTING ALERT SYSTEM */}
      {showSuccessAlert && (
        <SuccessAlert 
          message={alertMessage} 
          onClose={() => setShowSuccessAlert(false)}
        />
      )}
      
      {showErrorAlert && (
        <ErrorAlert 
          message={alertMessage} 
          onClose={() => setShowErrorAlert(false)}
        />
      )}

      {/* ADDED: Delete Confirmation Modal - Exactly like doctors */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Patient</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{patientToDelete?.full_name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleDeleteCancel}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EVERYTHING BELOW REMAINS EXACTLY THE SAME AS YOUR PROVIDED CODE */}
      
      {/* Main Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search Patient by Name, Phone, MR No, Email, or CNIC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Export Buttons and Quick Search */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Excel
          </button>
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Columns
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Quick search..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              className="px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            onClick={handleAddPatient}
            className="flex items-center gap-2 text-white px-5 py-2 rounded-lg font-medium transition-all"
            style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}
            onMouseOver={(e) => e.target.style.background = 'linear-gradient(135deg, #2d5a7b 0%, #3d6a8b 100%)'}
            onMouseOut={(e) => e.target.style.background = 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)'}
          >
            <span className="text-xl">+</span>
            Add Patient
          </button>
        </div>
      </div>

      {/* Patients Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Loading patients...</div>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-gray-500 text-lg">No patients found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchQuery || quickSearch
                ? "Try adjusting your search"
                : "Add your first patient to get started"}
            </p>
          </div>
        </div>
      ) : (
        <PatientListView
          patients={filteredPatients}
          onView={handleViewPatient}
          onEdit={handleEditPatient}
          onDelete={handleDeletePatient}
        />
      )}

      {/* Add/Edit Patient Modal */}
      {showAddModal && (
        <PatientForm
          patient={selectedPatient}
          editMode={editMode}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* View Patient Modal */}
      {showViewModal && (
        <PatientViewModal
          patient={selectedPatient}
          onClose={() => setShowViewModal(false)}
          onEdit={() => {
            setShowViewModal(false);
            handleEditPatient(selectedPatient);
          }}
        />
      )}
    </div>
  );
}