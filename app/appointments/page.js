"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import BookAppointmentModal from "@/components/appointments/BookAppointmentModal";
import ViewAppointmentModal from "@/components/appointments/ViewAppointmentModal";
import EditAppointmentModal from "@/components/appointments/EditAppointmentModal";
import DayAppointmentsModal from "@/components/appointments/DayAppointmentsModal";
import AppointmentsList from "@/components/appointments/AppointmentsList";
import AppointmentsCalendar from "@/components/appointments/AppointmentsCalendar";
import ExportButtons from "@/components/appointments/ExportButtons";
import SearchBar from "@/components/appointments/SearchBar";
import { SuccessAlert, ErrorAlert } from "@/components/alerts/alert";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [quickSearch, setQuickSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal states
  const [showBookModal, setShowBookModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDayAppointments, setSelectedDayAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  // Alert states
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Fetch appointments
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filter appointments
  useEffect(() => {
    filterAppointments();
  }, [searchQuery, quickSearch, appointments]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: true });
      
      if (error) throw error;
      
      setAppointments(data || []);
      setFilteredAppointments(data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
      setFilteredAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(apt =>
        apt.doctor_name?.toLowerCase().includes(query) ||
        apt.patient_name?.toLowerCase().includes(query) ||
        apt.phone?.toLowerCase().includes(query)
      );
    }

    if (quickSearch.trim()) {
      const query = quickSearch.toLowerCase();
      filtered = filtered.filter(apt =>
        apt.doctor_name?.toLowerCase().includes(query) ||
        apt.patient_name?.toLowerCase().includes(query)
      );
    }

    setFilteredAppointments(filtered);
  };

  const handleAppointmentBooked = () => {
    fetchAppointments();
    setShowBookModal(false);
    setAlertMessage("Appointment booked successfully!");
    setShowSuccessAlert(true);
  };

  const handleAppointmentUpdated = () => {
    fetchAppointments();
    setShowEditModal(false);
    setAlertMessage("Appointment updated successfully!");
    setShowSuccessAlert(true);
  };

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Action handlers
  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowEditModal(true);
  };

  const handleDeleteAppointment = async (appointment) => {
    if (confirm(`Are you sure you want to delete the appointment for ${appointment.patient_name}?`)) {
      try {
        const { error } = await supabase
          .from('appointments')
          .delete()
          .eq('id', appointment.id);

        if (error) throw error;

        setAlertMessage("Appointment deleted successfully!");
        setShowSuccessAlert(true);
        fetchAppointments();
      } catch (error) {
        console.error("Error deleting appointment:", error);
        setAlertMessage("Failed to delete appointment. Please try again.");
        setShowErrorAlert(true);
      }
    }
  };

  // FIXED: handleDayClick function with proper date formatting
  const handleDayClick = (date) => {
    // Simple date comparison without timezone complications
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed
    const day = date.getDate();
    
    // Format as YYYY-MM-DD to match database
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    const dayAppointments = filteredAppointments.filter(apt => {
      return apt.appointment_date === dateStr;
    });
    
    if (dayAppointments.length > 0) {
      setSelectedDate(date);
      setSelectedDayAppointments(dayAppointments);
      setShowDayModal(true);
    }
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  // Close modal handlers
  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedAppointment(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedAppointment(null);
  };

  const closeDayModal = () => {
    setShowDayModal(false);
    setSelectedDayAppointments([]);
    setSelectedDate(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Beautiful Alerts */}
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

      {/* Main Search */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search by Doctor, Patient Name, or Phone..."
        className="mb-6"
      />

      {/* Header Actions */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <ViewToggleButtons viewMode={viewMode} onViewModeChange={setViewMode} />
          
          {/* Export Buttons */}
          <ExportButtons appointments={filteredAppointments} />
        </div>
        
        {/* Quick Search and Book Button */}
        <HeaderActions
          quickSearch={quickSearch}
          onQuickSearchChange={setQuickSearch}
          onBookAppointment={() => setShowBookModal(true)}
        />
      </div>

      {/* Content */}
      <AppointmentsContent
        loading={loading}
        viewMode={viewMode}
        appointments={filteredAppointments}
        currentDate={currentDate}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
        onDateClick={handleDayClick}
        onViewAppointment={handleViewAppointment}
        onEditAppointment={handleEditAppointment}
        onDeleteAppointment={handleDeleteAppointment}
        onAppointmentClick={handleAppointmentClick}
      />

      {/* Modals */}
      <BookAppointmentModal 
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        onSuccess={handleAppointmentBooked}
      />

      <ViewAppointmentModal
        isOpen={showViewModal}
        onClose={closeViewModal}
        appointment={selectedAppointment}
      />

      <EditAppointmentModal
        isOpen={showEditModal}
        onClose={closeEditModal}
        appointment={selectedAppointment}
        onSuccess={handleAppointmentUpdated}
      />

      <DayAppointmentsModal
        isOpen={showDayModal}
        onClose={closeDayModal}
        appointments={selectedDayAppointments}
        selectedDate={selectedDate}
        onAppointmentClick={handleAppointmentClick}
      />
    </div>
  );
}

// Sub-components for the main page
function ViewToggleButtons({ viewMode, onViewModeChange }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onViewModeChange("list")}
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
          viewMode === "list"
            ? "bg-blue-100 border-blue-400 text-blue-900"
            : "border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        List
      </button>
      
      <button
        onClick={() => onViewModeChange("calendar")}
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
          viewMode === "calendar"
            ? "bg-blue-100 border-blue-400 text-blue-900"
            : "border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Calendar
      </button>
    </div>
  );
}

function HeaderActions({ quickSearch, onQuickSearchChange, onBookAppointment }) {
  return (
    <div className="flex items-center gap-3">
      <SearchBar
        searchQuery={quickSearch}
        onSearchChange={onQuickSearchChange}
        placeholder="Quick search..."
        className="w-48"
      />
      <button
        onClick={onBookAppointment}
        className="flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-all text-white"
        style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}
        onMouseOver={(e) => e.target.style.background = 'linear-gradient(135deg, #2d5a7b 0%, #3d6a8b 100%)'}
        onMouseOut={(e) => e.target.style.background = 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)'}
      >
        <span className="text-xl">+</span>
        Book New
      </button>
    </div>
  );
}

function AppointmentsContent({
  loading,
  viewMode,
  appointments,
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
  onDateClick,
  onViewAppointment,
  onEditAppointment,
  onDeleteAppointment,
  onAppointmentClick
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Loading appointments...</div>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <AppointmentsList
        appointments={appointments}
        onView={onViewAppointment}
        onEdit={onEditAppointment}
        onDelete={onDeleteAppointment}
      />
    );
  }

  return (
    <AppointmentsCalendar
      appointments={appointments}
      currentDate={currentDate}
      onPrevious={onPreviousMonth}
      onNext={onNextMonth}
      onToday={onToday}
      onDateClick={onDateClick}
      onAppointmentClick={onAppointmentClick}
    />
  );
}