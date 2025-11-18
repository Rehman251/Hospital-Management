import { Search, Grid, List, Download, FileText, Table, Settings } from "lucide-react";

export default function ExportButtons({ 
  searchQuery, 
  setSearchQuery, 
  viewMode, 
  setViewMode, 
  doctors 
}) {
  
  const handleExportCSV = () => {
    if (!doctors || doctors.length === 0) {
      alert("No data to export");
      return;
    }

    // Create CSV header
    const headers = ["Name", "Email", "Phone", "License Number", "Specialization", "Status", "Experience Years"];
    
    // Create CSV rows
    const rows = doctors.map(doctor => [
      doctor.name,
      doctor.email,
      doctor.phone,
      doctor.license_number,
      doctor.specialization,
      doctor.status,
      doctor.experience_years
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `doctors_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    alert("PDF export functionality - Coming soon!");
    // You can integrate a PDF library like jsPDF here
  };

  const handleColumns = () => {
    alert("Column management - Coming soon!");
    // You can add column visibility toggles here
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctors by name, email, specialization..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "grid"
                  ? "text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              style={viewMode === "grid" ? {
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)'
              } : {}}
              title="Grid View"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "list"
                  ? "text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              style={viewMode === "list" ? {
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)'
              } : {}}
              title="List View"
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {/* Export Buttons - Updated with brand colors */}
          <div className="flex items-center gap-2">
            {/* Excel/CSV Button - Green */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg font-medium transition-all hover:shadow-lg hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #1D6F42 0%, #21A366 100%)'
              }}
            >
              <Table className="w-4 h-4" />
              <span className="hidden sm:inline">Excel</span>
            </button>

            {/* PDF Button - Red */}
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg font-medium transition-all hover:shadow-lg hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #F40F02 0%, #FF6B6B 100%)'
              }}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>

            {/* Columns Button - Blue */}
            <button
              onClick={handleColumns}
              className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg font-medium transition-all hover:shadow-lg hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)'
              }}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Columns</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {searchQuery && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Found <span className="font-semibold text-gray-900">{doctors?.length || 0}</span> doctor(s) matching "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
}