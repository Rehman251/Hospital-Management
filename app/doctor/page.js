"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ExportButtons from "@/components/doctors/ExportButtons";
import DoctorListView from "@/components/doctors/DoctorListView";
import DoctorForm from "@/components/doctors/DoctorForm";
import DoctorViewModal from "@/components/doctors/DoctorViewModal";
import { SuccessAlert, ErrorAlert, WarningAlert } from "@/components/alerts/alert";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    phone: true,
    specialization: true,
    license: true,
    email: true,
    status: true,
    actions: true
  });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 4000);
  };

  // Calculate pagination values
  const totalPages = Math.ceil(filteredDoctors.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentDoctors = filteredDoctors.slice(startIndex, endIndex);

  // Fetch doctors from Supabase
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Filter doctors based on search
  useEffect(() => {
    filterDoctors();
  }, [searchQuery, doctors]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, rowsPerPage]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setDoctors(data || []);
      setFilteredDoctors(data || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      showAlert('error', "Failed to load doctors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    if (!searchQuery.trim()) {
      setFilteredDoctors(doctors);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = doctors.filter(
      (doctor) =>
        doctor.name?.toLowerCase().includes(query) ||
        doctor.email?.toLowerCase().includes(query) ||
        doctor.phone?.toLowerCase().includes(query) ||
        doctor.license_number?.toLowerCase().includes(query) ||
        doctor.specialization?.toLowerCase().includes(query)
    );

    setFilteredDoctors(filtered);
  };

  const handleAddDoctor = () => {
    setSelectedDoctor(null);
    setEditMode(false);
    setShowAddModal(true);
  };

  const handleEditDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setEditMode(true);
    setShowAddModal(true);
  };

  const handleViewDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setShowViewModal(true);
  };

  const handleDeleteClick = (doctor) => {
    setDoctorToDelete(doctor);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!doctorToDelete) return;

    try {
      const { error } = await supabase
        .from("doctors")
        .delete()
        .eq("id", doctorToDelete.id);

      if (error) throw error;

      await fetchDoctors();
      showAlert('success', "Doctor deleted successfully!");
    } catch (error) {
      console.error("Error deleting doctor:", error);
      showAlert('error', "Failed to delete doctor. Please try again.");
    } finally {
      setShowDeleteConfirm(false);
      setDoctorToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDoctorToDelete(null);
    showAlert('warning', "Doctor deletion cancelled.");
  };

  const handleFormSuccess = async () => {
    setShowAddModal(false);
    await fetchDoctors();
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Export to Excel function
  const exportToExcel = () => {
    try {
      // Create CSV content
      const headers = ["Full Name", "Phone Number", "Specialty/Area of Expertise", "License ID / PMDC No"];
      const csvContent = [
        headers.join(","),
        ...filteredDoctors.map(doctor => 
          [
            `"${doctor.name || ""}"`,
            `"${doctor.phone || ""}"`,
            `"${doctor.specialization || ""}"`,
            `"${doctor.license_number || ""}"`
          ].join(",")
        )
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `doctors_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showAlert('success', "Doctors exported to Excel successfully!");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      showAlert('error', "Failed to export to Excel. Please try again.");
    }
  };

  // Export to PDF function
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.text("Doctor Management Report", 14, 22);
      
      // Add date
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Add total count
      doc.text(`Total Doctors: ${filteredDoctors.length}`, 14, 37);

      // Prepare table data
      const tableData = filteredDoctors.map(doctor => [
        doctor.name || "N/A",
        doctor.phone || "N/A",
        doctor.specialization || "N/A",
        doctor.license_number || "N/A"
      ]);

      // Add table
      autoTable(doc, {
        startY: 45,
        head: [["Full Name", "Phone Number", "Specialty/Area of Expertise", "License ID / PMDC No"]],
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

      // Save the PDF
      doc.save(`doctors_${new Date().toISOString().split('T')[0]}.pdf`);
      showAlert('success', "Doctors exported to PDF successfully!");
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      showAlert('error', "Failed to export to PDF. Please try again.");
    }
  };

  const toggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Alert Component */}
      {alert.show && (
        <div className="fixed top-4 right-4 z-50">
          {alert.type === 'success' && <SuccessAlert message={alert.message} />}
          {alert.type === 'error' && <ErrorAlert message={alert.message} />}
          {alert.type === 'warning' && <WarningAlert message={alert.message} />}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Doctor</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{doctorToDelete?.name}</strong>? This action cannot be undone.
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

      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              <span className="font-normal text-gray-600">Stethoscope</span>{" "}
              <span className="text-gray-900 font-semibold">Doctor Management</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">
              {filteredDoctors.length} Total Doctors
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar and Add Button */}     
      <div className="mb-4 flex items-center gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search doctors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
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
        <button
          onClick={handleAddDoctor}
          className="flex items-center gap-2 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 hover:shadow-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}
        >
          <span className="text-xl">+</span>
          Add Doctor
        </button>
      </div>

      {/* Export Buttons and Rows Selector */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Excel Button - Green */}
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 border border-green-500 rounded-lg text-green-600 hover:bg-green-50 transition-colors duration-200 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Excel
          </button>

          {/* PDF Button - Red */}
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 border border-red-500 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            PDF
          </button>
          
          {/* Columns Button - Blue */}
          <div className="relative">
            <button 
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              className="flex items-center gap-2 px-4 py-2 border border-blue-500 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors duration-200 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Columns
            </button>
            
            {showColumnSelector && (
              <div className="absolute top-12 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-48 z-10">
                <h3 className="font-semibold text-gray-800 mb-3">Show/Hide Columns</h3>
                <div className="space-y-2">
                  {Object.entries(visibleColumns).map(([key, isVisible]) => (
                    <label key={key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={() => toggleColumn(key)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="capitalize">
                        {key === 'license' ? 'License No' : 
                         key === 'actions' ? 'Actions' : key}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">Rows:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Doctors Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Loading doctors...</div>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-gray-500 text-lg">No doctors found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchQuery
                ? "Try adjusting your search"
                : "Add your first doctor to get started"}
            </p>
          </div>
        </div>
      ) : (
        <DoctorListView
          doctors={currentDoctors}
          onView={handleViewDoctor}
          onEdit={handleEditDoctor}
          onDelete={handleDeleteClick}
          visibleColumns={visibleColumns}
          // Pagination props
          currentPage={currentPage}
          totalPages={totalPages}
          totalDoctors={filteredDoctors.length}
          startIndex={startIndex + 1}
          endIndex={Math.min(endIndex, filteredDoctors.length)}
          onNextPage={handleNextPage}
          onPrevPage={handlePrevPage}
        />
      )}

      {/* Add/Edit Doctor Modal */}
      {showAddModal && (
        <DoctorForm
          doctor={selectedDoctor}
          editMode={editMode}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* View Doctor Modal */}
      {showViewModal && (
        <DoctorViewModal
          doctor={selectedDoctor}
          onClose={() => setShowViewModal(false)}
          onEdit={() => {
            setShowViewModal(false);
            handleEditDoctor(selectedDoctor);
          }}
        />
      )}
    </div>
  );
}