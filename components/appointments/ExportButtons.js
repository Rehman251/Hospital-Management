"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExportButtons({ appointments, fileName = "appointments" }) {
  const exportToExcel = () => {
    try {
      const headers = ["Doctor", "Patient Name", "Phone", "Date", "Time", "Status"];
      const csvContent = [
        headers.join(","),
        ...appointments.map(appointment => 
          [
            `"${appointment.doctor_name || ""}"`,
            `"${appointment.patient_name || ""}"`,
            `"${appointment.phone || ""}"`,
            `"${appointment.appointment_date || ""}"`,
            `"${appointment.appointment_time || ""}"`,
            `"${appointment.status || ""}"`
          ].join(",")
        )
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      downloadFile(blob, `${fileName}_${getCurrentDate()}.csv`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Failed to export to Excel. Please try again.");
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.text("Appointments Report", 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      doc.text(`Total Appointments: ${appointments.length}`, 14, 37);

      const tableData = appointments.map(appointment => [
        appointment.doctor_name || "N/A",
        appointment.patient_name || "N/A",
        appointment.phone || "N/A",
        appointment.appointment_date || "N/A",
        appointment.appointment_time || "N/A",
        appointment.status || "N/A"
      ]);

      autoTable(doc, {
        startY: 45,
        head: [["Doctor", "Patient Name", "Phone", "Date", "Time", "Status"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [139, 92, 246],
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

      doc.save(`${fileName}_${getCurrentDate()}.pdf`);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      alert("Failed to export to PDF. Please try again.");
    }
  };

  const downloadFile = (blob, filename) => {
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={exportToExcel}
        className="flex items-center gap-2 px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Excel
      </button>
      
      <button 
        onClick={exportToPDF}
        className="flex items-center gap-2 px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        PDF
      </button>
    </div>
  );
}