import { Search, Grid, List, Download, FileText } from "lucide-react";

export default function ExportButtons({ 
  searchQuery, 
  setSearchQuery, 
  viewMode, 
  setViewMode, 
  patients 
}) {
  const handleExportCSV = () => {
    if (patients.length === 0) {
      alert("No patients to export");
      return;
    }

    const headers = ['Full Name', 'Email', 'Phone', 'Age', 'Gender', 'Address', 'Status', 'Registration Date'];
    const csvData = patients.map(patient => [
      patient.full_name || '',
      patient.email_address || '',
      patient.phone_number || '',
      patient.age || '',
      patient.gender || '',
      patient.address || '',
      patient.status || 'Active',
      patient.registration_date ? new Date(patient.registration_date).toLocaleDateString() : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patients-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    alert("PDF export functionality would be implemented here");
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search patients by name, email, phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* View Controls and Export Buttons */}
      <div className="flex items-center gap-3">
        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)'
            }}
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>
    </div>
  );
}