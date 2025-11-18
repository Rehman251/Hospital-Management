"use client";

export default function DayAppointmentsModal({ isOpen, onClose, appointments, selectedDate, onAppointmentClick }) {
  if (!isOpen) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatSQLDate = (dateString) => {
    // Convert YYYY-MM-DD to readable format
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
              style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {formatDate(selectedDate)}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {appointments.length} Appointment{appointments.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Hidden scrollbar but scrollable */}
        <div className="overflow-y-auto max-h-[60vh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="p-6 space-y-4">
            {appointments.map((appointment) => (
              <div 
                key={appointment.id}
                onClick={() => onAppointmentClick(appointment)}
                className="border border-gray-200/70 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer bg-white/60 hover:bg-white/80 hover:border-blue-300/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}
                        ></div>
                        <span className="font-semibold text-gray-900 text-sm">
                          {appointment.appointment_time}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status || 'Scheduled'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-3">
                        <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Patient Information
                        </h3>
                        <div className="space-y-1 text-xs text-gray-600">
                          <p><span className="font-medium">Name:</span> {appointment.patient_name}</p>
                          <p><span className="font-medium">MR:</span> {appointment.mr_number || 'N/A'}</p>
                          <p><span className="font-medium">Phone:</span> {appointment.phone || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="bg-green-50/50 border border-green-200/50 rounded-lg p-3">
                        <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Doctor Information
                        </h4>
                        <div className="space-y-1 text-xs text-gray-600">
                          <p><span className="font-medium">Doctor:</span> {appointment.doctor_name}</p>
                          <p><span className="font-medium">Fee:</span> {appointment.fee ? `PKR ${appointment.fee}` : 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mt-3 p-3 bg-yellow-50/50 border border-yellow-200/50 rounded-lg text-xs">
                        <p className="text-gray-700 flex items-center gap-2">
                          <svg className="w-4 h-4 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span><span className="font-medium">Notes:</span> {appointment.notes}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end">
          <button
            onClick={onClose}
            className="text-white px-6 py-2 rounded-lg font-medium transition-all"
            style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}
            onMouseOver={(e) => e.target.style.background = 'linear-gradient(135deg, #2d5a7b 0%, #3d6a8b 100%)'}
            onMouseOut={(e) => e.target.style.background = 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)'}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}