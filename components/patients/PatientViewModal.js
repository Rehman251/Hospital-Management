import { X, Mail, Phone, Calendar, MapPin, Edit2, User, Stethoscope, FileText, AlertCircle } from "lucide-react";

export default function PatientViewModal({ patient, onClose, onEdit }) {
  if (!patient) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getAgeGroup = (age) => {
    if (!age) return "N/A";
    if (age < 18) return "Child";
    if (age < 60) return "Adult";
    return "Senior";
  };

  // Mock medical data - in real app this would come from props
  const medicalData = {
    lastVisit: "2024-01-15",
    nextAppointment: "2024-02-20",
    bloodType: "A+",
    allergies: ["Penicillin", "Peanuts"],
    conditions: ["Hypertension", "Type 2 Diabetes"],
    medications: ["Lisinopril 10mg", "Metformin 500mg"]
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
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
              patient.status === 'Active' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-400 text-white'
            }`}>
              {patient.status}
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
            {patient.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'P'}
          </div>
        </div>

        {/* Content */}
        <div 
          className="px-8 pb-8 pt-6 overflow-y-auto max-h-[calc(90vh-200px)]"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {/* Name */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {patient.full_name || 'Unnamed Patient'}
            </h2>
            <p className="text-gray-600 mb-3">Patient ID: {patient.id}</p>
            <span className="inline-block px-4 py-1.5 text-sm font-medium rounded-full bg-blue-100 text-blue-700">
              {getAgeGroup(patient.age)} Patient
            </span>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact & Personal Information */}
            <div className="space-y-6">
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
                    <p className="text-sm text-gray-900">{patient.email_address || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="p-2 rounded-lg bg-green-50 mr-3">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Phone</p>
                    <p className="text-sm text-gray-900">{patient.phone_number || 'N/A'}</p>
                  </div>
                </div>

                {patient.address && (
                  <div className="flex items-start">
                    <div className="p-2 rounded-lg bg-purple-50 mr-3">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Address</p>
                      <p className="text-sm text-gray-900">{patient.address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                  Personal Information
                </h3>

                {patient.age && (
                  <div className="flex items-start">
                    <div className="p-2 rounded-lg bg-orange-50 mr-3">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Age</p>
                      <p className="text-sm text-gray-900 font-semibold">{patient.age} years</p>
                    </div>
                  </div>
                )}

                {patient.gender && (
                  <div className="flex items-start">
                    <div className="p-2 rounded-lg bg-indigo-50 mr-3">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Gender</p>
                      <p className="text-sm text-gray-900">{patient.gender}</p>
                    </div>
                  </div>
                )}

                {patient.registration_date && (
                  <div className="flex items-start">
                    <div className="p-2 rounded-lg bg-teal-50 mr-3">
                      <User className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Registration Date</p>
                      <p className="text-sm text-gray-900">{formatDate(patient.registration_date)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-6">
              {/* Medical Overview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                  Medical Overview
                </h3>

                <div className="flex items-start">
                  <div className="p-2 rounded-lg bg-red-50 mr-3">
                    <Stethoscope className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Last Visit</p>
                    <p className="text-sm text-gray-900">{formatDate(medicalData.lastVisit)}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="p-2 rounded-lg bg-emerald-50 mr-3">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Next Appointment</p>
                    <p className="text-sm text-gray-900">{formatDate(medicalData.nextAppointment)}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="p-2 rounded-lg bg-amber-50 mr-3">
                    <FileText className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Blood Type</p>
                    <p className="text-sm text-gray-900 font-semibold">{medicalData.bloodType}</p>
                  </div>
                </div>
              </div>

              {/* Medical Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                  Health Details
                </h3>

                <div className="flex items-start">
                  <div className="p-2 rounded-lg bg-rose-50 mr-3">
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Allergies</p>
                    <p className="text-sm text-gray-900">
                      {medicalData.allergies.length > 0 ? medicalData.allergies.join(', ') : 'None'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="p-2 rounded-lg bg-violet-50 mr-3">
                    <FileText className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Conditions</p>
                    <p className="text-sm text-gray-900">
                      {medicalData.conditions.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="p-2 rounded-lg bg-cyan-50 mr-3">
                    <FileText className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Medications</p>
                    <p className="text-sm text-gray-900">
                      {medicalData.medications.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="mt-8 grid grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{patient.age || 'N/A'}</p>
              <p className="text-xs text-gray-600 mt-1">Age</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {patient.status === 'Active' ? '✓' : '✗'}
              </p>
              <p className="text-xs text-gray-600 mt-1">Status</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {getAgeGroup(patient.age).charAt(0)}
              </p>
              <p className="text-xs text-gray-600 mt-1">Group</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {medicalData.conditions.length}
              </p>
              <p className="text-xs text-gray-600 mt-1">Conditions</p>
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
              className="flex items-center gap-2 px-6 py-2.5 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)'
              }}
            >
              <Edit2 className="w-4 h-4" />
              Edit Patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}