import { X, Mail, Phone, Award, Briefcase, GraduationCap, MapPin, Stethoscope, Calendar, Edit2 } from "lucide-react";

export default function DoctorViewModal({ doctor, onClose, onEdit }) {
  if (!doctor) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header with Gradient */}
        <div 
          className="relative h-32"
          style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)'
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <span className={`px-4 py-1.5 text-sm font-medium rounded-full ${
              doctor.status === 'Active' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-400 text-white'
            }`}>
              {doctor.status}
            </span>
          </div>
        </div>

        {/* Avatar */}
        <div className="relative -mt-16 flex justify-center">
          <div 
            className="w-32 h-32 rounded-full border-4 border-white flex items-center justify-center text-white text-3xl font-bold shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)'
            }}
          >
            {doctor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 pt-6 overflow-y-auto max-h-[calc(90vh-200px)] scrollbar-hide">
          {/* Name and Qualification */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {doctor.name}
            </h2>
            <p className="text-gray-600 mb-3">{doctor.qualification}</p>
            <span className="inline-block px-4 py-1.5 text-sm font-medium rounded-full bg-blue-100 text-blue-700">
              {doctor.specialization}
            </span>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                Contact Information
              </h3>
              
              <div className="flex items-start">
                <div className="p-2 rounded-lg bg-blue-50 mr-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Email</p>
                  <p className="text-sm text-gray-900">{doctor.email}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 rounded-lg bg-green-50 mr-3">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Phone</p>
                  <p className="text-sm text-gray-900">{doctor.phone}</p>
                </div>
              </div>

              {doctor.address && (
                <div className="flex items-start">
                  <div className="p-2 rounded-lg bg-purple-50 mr-3">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Address</p>
                    <p className="text-sm text-gray-900">{doctor.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Professional Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                Professional Information
              </h3>

              <div className="flex items-start">
                <div className="p-2 rounded-lg bg-orange-50 mr-3">
                  <Award className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">License Number</p>
                  <p className="text-sm text-gray-900 font-semibold">{doctor.license_number}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 rounded-lg bg-indigo-50 mr-3">
                  <Stethoscope className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Specialization</p>
                  <p className="text-sm text-gray-900">{doctor.specialization}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 rounded-lg bg-teal-50 mr-3">
                  <Briefcase className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Experience</p>
                  <p className="text-sm text-gray-900">{doctor.experience_years} years</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 rounded-lg bg-pink-50 mr-3">
                  <GraduationCap className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Qualification</p>
                  <p className="text-sm text-gray-900">{doctor.qualification}</p>
                </div>
              </div>

              {doctor.created_at && (
                <div className="flex items-start">
                  <div className="p-2 rounded-lg bg-yellow-50 mr-3">
                    <Calendar className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Joined On</p>
                    <p className="text-sm text-gray-900">{formatDate(doctor.created_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{doctor.experience_years}</p>
              <p className="text-xs text-gray-600 mt-1">Years Experience</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {doctor.status === 'Active' ? '✓' : '✗'}
              </p>
              <p className="text-xs text-gray-600 mt-1">Status</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {doctor.specialization?.substring(0, 3).toUpperCase()}
              </p>
              <p className="text-xs text-gray-600 mt-1">Department</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-6 py-2.5 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)'
              }}
            >
              <Edit2 className="w-4 h-4" />
              Edit Doctor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}