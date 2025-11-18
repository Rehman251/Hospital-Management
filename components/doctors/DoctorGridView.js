import { Eye, Edit2, Trash2, Mail, Phone, Award, Briefcase } from "lucide-react";

export default function DoctorGridView({ doctors, onView, onEdit, onDelete }) {
  if (!doctors || doctors.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-gray-500 text-lg">No doctors found</p>
          <p className="text-gray-400 text-sm mt-2">Add your first doctor to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {doctors.map((doctor) => (
        <div
          key={doctor.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
        >
          {/* Card Header with Gradient */}
          <div 
            className="h-24 relative"
            style={{
              background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)'
            }}
          >
            {/* Status Badge */}
            <div className="absolute top-3 right-3">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                doctor.status === 'Active' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-400 text-white'
              }`}>
                {doctor.status}
              </span>
            </div>
          </div>

          {/* Avatar */}
          <div className="relative -mt-12 flex justify-center">
            <div 
              className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center text-white text-2xl font-bold shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)'
              }}
            >
              {doctor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
          </div>

          {/* Card Content */}
          <div className="px-6 pb-6 pt-4">
            {/* Name and Qualification */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {doctor.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {doctor.qualification}
              </p>
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                {doctor.specialization}
              </span>
            </div>

            {/* Contact Information */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                <span className="truncate">{doctor.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                <span>{doctor.phone}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Award className="w-4 h-4 mr-2 text-gray-400" />
                <span>{doctor.license_number}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                <span>{doctor.experience_years} years experience</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => onView(doctor)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              <button
                onClick={() => onEdit(doctor)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                title="Edit Doctor"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => onDelete(doctor.id)}
                className="flex items-center justify-center p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                title="Delete Doctor"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}