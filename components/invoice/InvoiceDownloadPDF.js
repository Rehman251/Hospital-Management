import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/lib/supabase";

export async function downloadInvoicePDF(invoice) {
  try {
    // Fetch services and payments
    const { data: services } = await supabase
      .from('invoice_services')
      .select('*')
      .eq('invoice_id', invoice.id)
      .order('created_at');

    const { data: payments } = await supabase
      .from('invoice_payments')
      .select('*')
      .eq('invoice_id', invoice.id)
      .order('payment_date');

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header with Gradient Effect (simulated with rectangles)
    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Hospital/Clinic Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('MediCare Pro', 15, 20);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Hospital Management System', 15, 28);
    doc.text('123 Medical Center, City', 15, 34);

    // Invoice Title
    doc.setFillColor(45, 90, 123);
    doc.rect(pageWidth - 70, 10, 55, 20, 'F');
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('INVOICE', pageWidth - 42, 22, { align: 'center' });

    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Invoice Details Box
    let yPos = 50;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Invoice Details', 15, yPos);
    
    yPos += 7;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text(`Invoice No: ${invoice.invoice_number}`, 15, yPos);
    doc.text(`Date: ${new Date(invoice.invoice_date).toLocaleDateString()}`, 15, yPos + 5);
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 15, yPos + 10);

    // Patient & Doctor Info
    doc.setFont(undefined, 'bold');
    doc.text('Patient Information', pageWidth - 80, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(`Name: ${invoice.patients?.full_name || 'N/A'}`, pageWidth - 80, yPos + 5);
    doc.text(`Doctor: ${invoice.doctors?.name || 'N/A'}`, pageWidth - 80, yPos + 10);

    yPos += 25;

    // Services Table
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('Services & Charges', 15, yPos);
    yPos += 5;

    const servicesData = (services || []).map(s => [
      s.service_name,
      `Rs. ${s.charges.toFixed(2)}`,
      `Rs. ${s.discount.toFixed(2)}`,
      `Rs. ${s.sub_total.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Service', 'Charges', 'Discount', 'Sub Total']],
      body: servicesData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 58, 95],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 35 },
        2: { cellWidth: 35 },
        3: { cellWidth: 35 }
      }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Payments Table (if exists)
    if (payments && payments.length > 0) {
      doc.setFont(undefined, 'bold');
      doc.setFontSize(11);
      doc.text('Payment History', 15, yPos);
      yPos += 5;

      const paymentsData = payments.map(p => [
        new Date(p.payment_date).toLocaleDateString(),
        `Rs. ${p.amount.toFixed(2)}`,
        p.mode
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Date', 'Amount', 'Mode']],
        body: paymentsData,
        theme: 'grid',
        headStyles: {
          fillColor: [30, 58, 95],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 8
        }
      });

      yPos = doc.lastAutoTable.finalY + 10;
    }

    // Financial Summary Box
    const summaryX = pageWidth - 75;
    yPos = Math.max(yPos, doc.internal.pageSize.height - 80);

    doc.setFillColor(249, 250, 251);
    doc.rect(summaryX - 5, yPos - 5, 70, 60, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(summaryX - 5, yPos - 5, 70, 60);

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('Gross Total:', summaryX, yPos);
    doc.text(`Rs. ${invoice.gross_total.toFixed(2)}`, summaryX + 50, yPos, { align: 'right' });
    
    yPos += 5;
    doc.text('Total Discount:', summaryX, yPos);
    doc.setTextColor(220, 38, 38);
    doc.text(`- Rs. ${invoice.total_discount.toFixed(2)}`, summaryX + 50, yPos, { align: 'right' });
    
    doc.setTextColor(0, 0, 0);
    yPos += 5;
    doc.setDrawColor(150, 150, 150);
    doc.line(summaryX, yPos, summaryX + 60, yPos);
    
    yPos += 5;
    doc.setFont(undefined, 'bold');
    doc.text('Sub Total:', summaryX, yPos);
    doc.text(`Rs. ${invoice.sub_total.toFixed(2)}`, summaryX + 50, yPos, { align: 'right' });
    
    if (invoice.settlement_discount > 0) {
      yPos += 5;
      doc.setFont(undefined, 'normal');
      doc.text('Settlement Discount:', summaryX, yPos);
      doc.setTextColor(220, 38, 38);
      doc.text(`- Rs. ${invoice.settlement_discount.toFixed(2)}`, summaryX + 50, yPos, { align: 'right' });
      doc.setTextColor(0, 0, 0);
    }
    
    yPos += 6;
    doc.setFillColor(34, 197, 94);
    doc.rect(summaryX - 2, yPos - 4, 64, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('FINAL PAYABLE:', summaryX, yPos);
    doc.text(`Rs. ${invoice.final_payable.toFixed(2)}`, summaryX + 50, yPos, { align: 'right' });
    
    doc.setTextColor(0, 0, 0);
    yPos += 8;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('Total Paid:', summaryX, yPos);
    doc.text(`Rs. ${invoice.total_paid.toFixed(2)}`, summaryX + 50, yPos, { align: 'right' });
    
    yPos += 6;
    doc.setFillColor(239, 68, 68);
    doc.rect(summaryX - 2, yPos - 4, 64, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('BALANCE DUE:', summaryX, yPos);
    doc.text(`Rs. ${invoice.balance_due.toFixed(2)}`, summaryX + 50, yPos, { align: 'right' });

    // Notes (if exists)
    if (invoice.notes) {
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      doc.setFontSize(9);
      const notesY = yPos + 15;
      doc.text('Notes:', 15, notesY);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(8);
      const splitNotes = doc.splitTextToSize(invoice.notes, pageWidth - 100);
      doc.text(splitNotes, 15, notesY + 5);
    }

    // Footer
    const footerY = doc.internal.pageSize.height - 15;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
    doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, footerY + 4, { align: 'center' });

    // Save PDF
    doc.save(`Invoice_${invoice.invoice_number}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}