"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import InvoiceForm from "@/components/invoice/InvoiceForm";
import InvoiceCalculator from "@/components/invoice/InvoiceCalculator";
import { SuccessAlert, ErrorAlert } from "@/components/alerts/alert";

export default function AddInvoicePage() {
  const router = useRouter();
  const [invoiceData, setInvoiceData] = useState({
    doctor_id: "",
    patient_id: "",
    invoice_date: new Date().toISOString().split('T')[0],
    services: [],
    payments: [],
    settlement_discount: 0,
    notes: ""
  });

  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 4000);
  };

  // Calculate totals
  const calculations = {
    grossTotal: invoiceData.services.reduce((sum, service) => sum + (parseFloat(service.charges) || 0), 0),
    totalDiscount: invoiceData.services.reduce((sum, service) => sum + (parseFloat(service.discount) || 0), 0),
    get subTotal() {
      return this.grossTotal - this.totalDiscount;
    },
    get finalPayable() {
      return this.subTotal - (parseFloat(invoiceData.settlement_discount) || 0);
    },
    totalPaid: invoiceData.payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0),
    get balanceDue() {
      return this.finalPayable - this.totalPaid;
    }
  };

  // Generate unique invoice number
  const generateInvoiceNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `INV-${timestamp}-${random}`;
  };

  const handleCreateInvoice = async () => {
    // Validation
    if (!invoiceData.doctor_id) {
      showAlert('error', 'Please select a doctor');
      return;
    }
    if (!invoiceData.patient_id) {
      showAlert('error', 'Please select a patient');
      return;
    }
    if (invoiceData.services.length === 0) {
      showAlert('error', 'Please add at least one service');
      return;
    }

    setLoading(true);

    try {
      const invoiceNumber = generateInvoiceNumber();
      
      // Determine invoice status
      let status = 'unpaid';
      if (calculations.balanceDue === 0 && calculations.finalPayable > 0) {
        status = 'paid';
      } else if (calculations.totalPaid > 0 && calculations.balanceDue > 0) {
        status = 'partial';
      }

      // 1. Insert main invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          invoice_number: invoiceNumber,
          doctor_id: invoiceData.doctor_id,
          patient_id: invoiceData.patient_id,
          invoice_date: invoiceData.invoice_date,
          gross_total: calculations.grossTotal,
          total_discount: calculations.totalDiscount,
          sub_total: calculations.subTotal,
          settlement_discount: parseFloat(invoiceData.settlement_discount) || 0,
          final_payable: calculations.finalPayable,
          total_paid: calculations.totalPaid,
          balance_due: calculations.balanceDue,
          notes: invoiceData.notes,
          status: status
        }])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // 2. Insert services
      if (invoiceData.services.length > 0) {
        const servicesData = invoiceData.services.map(service => ({
          invoice_id: invoice.id,
          service_name: service.service,
          charges: parseFloat(service.charges) || 0,
          discount: parseFloat(service.discount) || 0,
          sub_total: (parseFloat(service.charges) || 0) - (parseFloat(service.discount) || 0)
        }));

        const { error: servicesError } = await supabase
          .from('invoice_services')
          .insert(servicesData);

        if (servicesError) throw servicesError;
      }

      // 3. Insert payments
      if (invoiceData.payments.length > 0) {
        const paymentsData = invoiceData.payments.map(payment => ({
          invoice_id: invoice.id,
          payment_date: payment.date,
          amount: parseFloat(payment.amount) || 0,
          mode: payment.mode
        }));

        const { error: paymentsError } = await supabase
          .from('invoice_payments')
          .insert(paymentsData);

        if (paymentsError) throw paymentsError;
      }

      showAlert('success', `Invoice ${invoiceNumber} created successfully!`);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/invoice/all');
      }, 2000);

    } catch (error) {
      console.error('Error creating invoice:', error);
      showAlert('error', 'Failed to create invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    setShowDiscardConfirm(true);
  };

  const confirmDiscard = () => {
    router.push('/invoice/all');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Alert Component */}
      {alert.show && (
        <div className="fixed top-4 right-4 z-50">
          {alert.type === 'success' && <SuccessAlert message={alert.message} />}
          {alert.type === 'error' && <ErrorAlert message={alert.message} />}
        </div>
      )}

      {/* Discard Confirmation Modal */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Discard Invoice</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to discard this invoice? All unsaved data will be lost.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDiscardConfirm(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDiscard}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          <span className="font-normal text-gray-600">Invoice</span>{" "}
          <span className="text-gray-900 font-semibold">Create New Invoice</span>
        </h1>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Invoice Form (2/3 width) */}
        <div className="lg:col-span-2">
          <InvoiceForm 
            invoiceData={invoiceData}
            setInvoiceData={setInvoiceData}
          />
        </div>

        {/* Right Side - Calculator (1/3 width, sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <InvoiceCalculator 
              calculations={calculations}
              settlementDiscount={invoiceData.settlement_discount}
              setSettlementDiscount={(value) => setInvoiceData(prev => ({...prev, settlement_discount: value}))}
              onCreateInvoice={handleCreateInvoice}
              onDiscard={handleDiscard}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}