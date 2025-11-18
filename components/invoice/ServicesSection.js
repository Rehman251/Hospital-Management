"use client";

export default function ServicesSection({ services, setServices }) {
  const addService = () => {
    setServices([...services, {
      id: Date.now(),
      service: "",
      charges: 0,
      discount: 0
    }]);
  };

  const removeService = (id) => {
    setServices(services.filter(s => s.id !== id));
  };

  const updateService = (id, field, value) => {
    setServices(services.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const calculateSubTotal = (charges, discount) => {
    return (parseFloat(charges) || 0) - (parseFloat(discount) || 0);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}></div>
        <h2 className="text-lg font-semibold" style={{ color: '#1e3a5f' }}>Services & Charges *</h2>
      </div>
      
      {/* Table Header */}
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full">
          <thead>
            <tr className="border-b-2" style={{ borderColor: '#1e3a5f' }}>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider pb-3 pr-2">
                Service / Treatment
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider pb-3 px-2">
                Charges (Rs.)
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider pb-3 px-2">
                Discount (Rs.)
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider pb-3 px-2">
                Sub Total (Rs.)
              </th>
              <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider pb-3 pl-2">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500 text-sm">
                  No services added yet. Click "Add Another Service" to begin.
                </td>
              </tr>
            ) : (
              services.map((service) => (
                <tr key={service.id} className="border-b border-gray-100">
                  <td className="py-3 pr-2">
                    <input
                      type="text"
                      value={service.service}
                      onChange={(e) => updateService(service.id, 'service', e.target.value)}
                      placeholder="Enter service name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm transition-colors"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      value={service.charges}
                      onChange={(e) => updateService(service.id, 'charges', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm transition-colors"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      value={service.discount}
                      onChange={(e) => updateService(service.id, 'discount', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-sm transition-colors"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <div className="px-3 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}>
                      {calculateSubTotal(service.charges, service.discount).toFixed(2)}
                    </div>
                  </td>
                  <td className="py-3 pl-2">
                    <button
                      onClick={() => removeService(service.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Service"
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

      {/* Add Service Button */}
      <button
        onClick={addService}
        className="mt-4 flex items-center gap-2 font-medium transition-colors hover:opacity-80"
        style={{ color: '#1e3a5f' }}
      >
        <span className="text-xl">+</span>
        Add Another Service
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