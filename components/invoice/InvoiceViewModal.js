"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";

export default function InvoiceViewModal({ invoice, onClose, onEdit }) {
  const [services, setServices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (invoice) {
      fetchInvoiceDetails();
    }
  }, [invoice]);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('invoice_services')
        .select('*')
        .eq('invoice_id', invoice.id)
        .order('created_at');

      if (servicesError) throw servicesError;

      // Fetch payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('invoice_payments')
        .select('*')
        .eq('invoice_id', invoice.id)
        .order('payment_date');

      if (paymentsError) throw paymentsError;

      setServices(servicesData || []);
      setPayments(paymentsData || []);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!invoice) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div 
          className="px-6 py-4 flex items-center justify-between rounded-t-2xl"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}
        >
          <h2 className="text-xl font-bold text-white">Invoice Details</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-gray-500">Loading invoice details...</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Invoice Header Info */}
              <div className="grid grid-cols-2 gap-6 pb-6 border-b border-gray-200">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Invoice Information</h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-gray-600">Invoice No:</span>{" "}
                      <span className="font-semibold" style={{ color: '#1e3a5f' }}>{invoice.invoice_number}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Date:</span>{" "}
                      <span className="font-semibold text-gray-900">{new Date(invoice.invoice_date).toLocaleDateString()}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Status:</span>{" "}
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                        invoice.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {invoice.status.toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Patient & Doctor</h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-gray-600">Patient:</span>{" "}
                      <span className="font-semibold text-gray-900">{invoice.patients?.full_name || "N/A"}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Doctor:</span>{" "}
                      <span className="font-semibold text-gray-900">{invoice.doctors?.name || "N/A"}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Services Table */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Services & Charges</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead style={{ background: 'linear-gradient(135deg, #1e3a5f15 0%, #2d5a7b15 100%)' }}>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Service</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Charges</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Discount</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Sub Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {services.map((service) => (
                        <tr key={service.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{service.service_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">Rs. {service.charges.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-red-600">Rs. {service.discount.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">Rs. {service.sub_total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payments Table */}
              {payments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full">
                      <thead style={{ background: 'linear-gradient(135deg, #1e3a5f15 0%, #2d5a7b15 100%)' }}>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Mode</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {payments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-4 py-3 text-sm text-gray-900">{new Date(payment.payment_date).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">Rs. {payment.amount.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{payment.mode}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Financial Summary */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Gross Total:</span>
                  <span className="text-sm font-semibold text-gray-900">Rs. {invoice.gross_total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Discount:</span>
                  <span className="text-sm font-semibold text-red-600">- Rs. {invoice.total_discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-gray-300">
                  <span className="text-sm font-semibold text-gray-700">Sub Total:</span>
                  <span className="text-sm font-bold text-gray-900">Rs. {invoice.sub_total.toFixed(2)}</span>
                </div>
                {invoice.settlement_discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Settlement Discount:</span>
                    <span className="text-sm font-semibold text-red-600">- Rs. {invoice.settlement_discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 bg-green-50 px-4 rounded-lg">
                  <span className="text-sm font-bold text-green-700">Final Payable:</span>
                  <span className="text-sm font-bold text-green-700">Rs. {invoice.final_payable.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Paid:</span>
                  <span className="text-sm font-semibold text-gray-900">Rs. {invoice.total_paid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-red-50 px-4 rounded-lg border-t-2 border-gray-300">
                  <span className="text-sm font-bold text-red-700">Balance Due:</span>
                  <span className="text-sm font-bold text-red-700">Rs. {invoice.balance_due.toFixed(2)}</span>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">{invoice.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex items-center justify-end gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2.5 border text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            style={{ borderColor: '#1e3a5f' }}
          >
            Print
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(invoice);
            }}
            className="px-6 py-2.5 text-white rounded-lg font-medium transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}
          >
            Edit Invoice
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