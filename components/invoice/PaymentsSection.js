"use client";

export default function PaymentsSection({ payments, setPayments }) {
  const paymentModes = ["Cash", "Card", "Online", "Cheque", "Bank Transfer"];

  const addPayment = () => {
    setPayments([...payments, {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      mode: "Cash"
    }]);
  };

  const removePayment = (id) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  const updatePayment = (id, field, value) => {
    setPayments(payments.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}></div>
        <h2 className="text-lg font-semibold" style={{ color: '#1e3a5f' }}>Record Payments</h2>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full">
          <thead>
            <tr className="border-b-2" style={{ borderColor: '#1e3a5f' }}>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider pb-3 pr-2">
                Date
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider pb-3 px-2">
                Amount (Rs.)
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider pb-3 px-2">
                Mode
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider pb-3 pl-2">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-500 text-sm">
                  No payments recorded yet. Click "Add Another Payment" to begin.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-100">
                  <td className="py-3 pr-2">
                    <input
                      type="date"
                      value={payment.date}
                      onChange={(e) => updatePayment(payment.id, 'date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm transition-colors"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      value={payment.amount}
                      onChange={(e) => updatePayment(payment.id, 'amount', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm transition-colors"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <select
                      value={payment.mode}
                      onChange={(e) => updatePayment(payment.id, 'mode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm transition-colors"
                    >
                      {paymentModes.map(mode => (
                        <option key={mode} value={mode}>{mode}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 pl-2">
                    <button
                      onClick={() => removePayment(payment.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Payment"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Payment Button */}
      <button
        onClick={addPayment}
        className="mt-4 flex items-center gap-2 font-medium transition-colors hover:opacity-80"
        style={{ color: '#1e3a5f' }}
      >
        <span className="text-xl">+</span>
        Add Another Payment
      </button>

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