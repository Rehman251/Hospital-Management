"use client";

export default function AppointmentsList({ appointments, onEdit, onDelete, onView }) {
  if (appointments.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-500 text-lg">No appointments found</p>
          <p className="text-gray-400 text-sm mt-2">Book your first appointment to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-sm border border-gray-200/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-purple-50/80 backdrop-blur-sm border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                Doctor
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                Patient Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/60 divide-y divide-gray-100">
            {appointments.map((appointment) => (
              <AppointmentRow 
                key={appointment.id} 
                appointment={appointment}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AppointmentRow({ appointment, onEdit, onDelete, onView }) {
  return (
    <tr className="hover:bg-gray-50/70 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {appointment.doctor_name || "N/A"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-600">
          {appointment.patient_name || "N/A"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-600">
          {appointment.phone || "N/A"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-600">
          {appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString() : "N/A"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-600">
          {appointment.appointment_time || "N/A"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={appointment.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <AppointmentActions 
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          appointment={appointment}
        />
      </td>
    </tr>
  );
}

function StatusBadge({ status }) {
  const statusConfig = {
    Confirmed: { bg: "bg-green-100", text: "text-green-700" },
    Pending: { bg: "bg-yellow-100", text: "text-yellow-700" },
    Cancelled: { bg: "bg-red-100", text: "text-red-700" },
    Scheduled: { bg: "bg-blue-100", text: "text-blue-700" },
    Completed: { bg: "bg-gray-100", text: "text-gray-700" }
  };

  const config = statusConfig[status] || statusConfig.Scheduled;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {status || "Scheduled"}
    </span>
  );
}

function AppointmentActions({ onEdit, onDelete, onView, appointment }) {
  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => onView?.(appointment)}
        className="p-1.5 text-green-600 hover:bg-green-50/70 rounded transition-colors" 
        title="View"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>
      <button 
        onClick={() => onEdit?.(appointment)}
        className="p-1.5 text-blue-600 hover:bg-blue-50/70 rounded transition-colors" 
        title="Edit"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button 
        onClick={() => onDelete?.(appointment)}
        className="p-1.5 text-red-600 hover:bg-red-50/70 rounded transition-colors" 
        title="Delete"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}