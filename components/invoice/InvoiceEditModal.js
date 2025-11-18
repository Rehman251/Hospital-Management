"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";
import ServicesSection from "./ServicesSection";
import PaymentsSection from "./PaymentsSection";

export default function InvoiceEditModal({ invoice, onClose, onSuccess }) {
  const [invoiceData, setInvoiceData] = useState({
    doctor_id: "",
    patient_id: "",
    invoice_date: "",
    services: [],
    payments: [],
    settlement_discount: 0,
    notes: ""
  });

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (invoice) {
      loadInvoiceData();
      fetchDoctors();
      fetchPatients();
    }
  }, [invoice]);

  const loadInvoiceData = async () => {
    try {
      setInitialLoading(true);

      // Fetch services
      const { data: servicesData } = await supabase
        .from('invoice_services')
        .select('*')
        .eq('invoice_id', invoice.id);

      // Fetch payments
      const { data: paymentsData } = await supabase
        .from('invoice_payments')
        .select('*')
        .eq('invoice_id', invoice.id);

      // Map services to match form structure
      const mappedServices = (servicesData || []).map(s => ({
        id: s.id,
        service: s.service_name,
        charges: s.charges,
        discount: s.discount
      }));

      // Map payments to match form structure
      const mappedPayments = (paymentsData || []).map(p => ({
        id: p.id,
        date: p.payment_date,
        amount: p.amount,
        mode: p.mode
      }));

      setInvoiceData({
        doctor_id: invoice.doctor_id,
        patient_id: invoice.patient_id,
        invoice_date: invoice.invoice_date,
        services: mappedServices,
        payments: mappedPayments,
        settlement_discount: invoice.settlement_discount || 0,
        notes: invoice.notes || ""
      });
    } catch (error) {
      console.error('Error loading invoice data:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchDoctors = async () => {
    const { data } = await supabase
      .from('doctors')
      .select('id, name')
      .eq('status', 'Active')
      .order('name');
    setDoctors(data || []);
  };

  const fetchPatients = async () => {
    const { data } = await supabase
      .from('patients')
      .select('id, full_name')
      .eq('status', 'Active')
      .order('full_name');
    setPatients(data || []);
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

  const handleUpdate = async () => {
    if (!invoiceData.doctor_id || !invoiceData.patient_id || invoiceData.services.length === 0) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      // Determine status
      let status = 'unpaid';
      if (calculations.balanceDue === 0 && calculations.finalPayable > 0) {
        status = 'paid';
      } else if (calculations.totalPaid > 0 && calculations.balanceDue > 0) {
        status = 'partial';
      }

      // 1. Update main invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
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
        })
        .eq('id', invoice.id);

      if (invoiceError) throw invoiceError;

      // 2. Delete old services and insert new ones
      await supabase.from('invoice_services').delete().eq('invoice_id', invoice.id);
      
      if (invoiceData.services.length > 0) {
        const servicesData = invoiceData.services.map(service => ({
          invoice_id: invoice.id,
          service_name: service.service,
          charges: parseFloat(service.charges) || 0,
          discount: parseFloat(service.discount) || 0,
          sub_total: (parseFloat(service.charges) || 0) - (parseFloat(service.discount) || 0)
        }));

        await supabase.from('invoice_services').insert(servicesData);
      }

      // 3. Delete old payments and insert new ones
      await supabase.from('invoice_payments').delete().eq('invoice_id', invoice.id);
      
      if (invoiceData.payments.length > 0) {
        const paymentsData = invoiceData.payments.map(payment => ({
          invoice_id: invoice.id,
          payment_date: payment.date,
          amount: parseFloat(payment.amount) || 0,
          mode: payment.mode
        }));

        await supabase.from('invoice_payments').insert(paymentsData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error updating invoice:', error);
      alert('Failed to update invoice');
    } finally {
      setLoading(false);
    }
  };

  if (!invoice) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8">
        {/* Header */}
        <div 
          className="px-6 py-4 flex items-center justify-between rounded-t-2xl"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}
        >
          <h2 className="text-xl font-bold text-white">Edit Invoice - {invoice.invoice_number}</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide">
          {initialLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-gray-500">Loading invoice...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Doctor *</label>
                  <select
                    value={invoiceData.doctor_id}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, doctor_id: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient *</label>
                  <select
                    value={invoiceData.patient_id}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, patient_id: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  >
                    <option value="">Select Patient</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>{patient.full_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date *</label>
                  <input
                    type="date"
                    value={invoiceData.invoice_date}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, invoice_date: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Services Section */}
              <ServicesSection 
                services={invoiceData.services}
                setServices={(services) => setInvoiceData(prev => ({ ...prev, services }))}
              />

              {/* Payments Section */}
              <PaymentsSection 
                payments={invoiceData.payments}
                setPayments={(payments) => setInvoiceData(prev => ({ ...prev, payments }))}
              />

              {/* Settlement Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Settlement Discount</label>
                <input
                  type="number"
                  value={invoiceData.settlement_discount}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, settlement_discount: e.target.value }))}
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={invoiceData.notes}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                  rows="3"
                  placeholder="Add notes..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                />
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Final Payable:</span>
                  <span className="font-bold text-green-700">Rs. {calculations.finalPayable.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Balance Due:</span>
                  <span className="font-bold text-red-700">Rs. {calculations.balanceDue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex items-center justify-end gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="px-6 py-2.5 text-white rounded-lg font-medium transition-all hover:shadow-lg disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}
          >
            {loading ? 'Updating...' : 'Update Invoice'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}