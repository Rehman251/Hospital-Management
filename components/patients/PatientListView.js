export default function PatientListView({ patients, onView, onEdit, onDelete }) {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
      <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <table className="w-full">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider"
                  style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}>
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider"
                  style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}>
                Phone
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider"
                  style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}>
                MR Number
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider"
                  style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}>
                Registration Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider"
                  style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/60 divide-y divide-gray-100">
            {patients.map((patient, index) => (
              <tr key={patient.id || index} className="hover:bg-gray-50/70 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {patient.full_name || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {patient.phone_number || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
                       style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}>
                    {patient.mr_number || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {patient.registration_date ? new Date(patient.registration_date).toLocaleDateString() : "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {/* View Icon */}
                    <button
                      onClick={() => onView(patient)}
                      className="p-1.5 text-green-600 hover:bg-green-50/70 rounded-lg transition-colors border border-green-200/50"
                      title="View Patient"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    
                    {/* Edit Icon */}
                    <button
                      onClick={() => onEdit(patient)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50/70 rounded-lg transition-colors border border-blue-200/50"
                      title="Edit Patient"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    {/* Delete Icon */}
                    <button
                      onClick={() => onDelete(patient)}
                      className="p-1.5 text-red-600 hover:bg-red-50/70 rounded-lg transition-colors border border-red-200/50"
                      title="Delete Patient"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}