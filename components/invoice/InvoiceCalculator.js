"use client";

export default function InvoiceCalculator({ 
  calculations, 
  settlementDiscount, 
  setSettlementDiscount, 
  onCreateInvoice,
  onDiscard
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}>
        <h3 className="text-base font-bold text-white">Invoice Summary</h3>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Gross Total */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-xs">Gross Total:</span>
          <span className="text-gray-900 font-semibold text-sm">Rs. {calculations.grossTotal.toFixed(2)}</span>
        </div>

        {/* Total Discount */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-xs">Total Discount:</span>
          <span className="text-red-600 font-semibold text-sm">- Rs. {calculations.totalDiscount.toFixed(2)}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Sub Total */}
        <div className="flex justify-between items-center py-2 px-3 rounded-lg" style={{ background: 'linear-gradient(135deg, #1e3a5f15 0%, #2d5a7b15 100%)' }}>
          <span className="font-bold text-sm" style={{ color: '#1e3a5f' }}>Sub Total:</span>
          <span className="font-bold text-sm" style={{ color: '#1e3a5f' }}>Rs. {calculations.subTotal.toFixed(2)}</span>
        </div>

        {/* Settlement Discount */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Settlement Discount
          </label>
          <input
            type="number"
            value={settlementDiscount}
            onChange={(e) => setSettlementDiscount(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors text-sm"
          />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Final Payable */}
        <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-green-50">
          <span className="text-green-700 font-bold text-xs">FINAL PAYABLE:</span>
          <span className="text-green-700 font-bold text-sm">Rs. {calculations.finalPayable.toFixed(2)}</span>
        </div>

        {/* Total Paid */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-xs">Total Paid:</span>
          <span className="text-gray-900 font-semibold text-sm">Rs. {calculations.totalPaid.toFixed(2)}</span>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-gray-300"></div>

        {/* Balance Due */}
        <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-red-50">
          <span className="text-red-700 font-bold text-xs">BALANCE DUE:</span>
          <span className="text-red-700 font-bold text-sm">Rs. {calculations.balanceDue.toFixed(2)}</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-3">
          <button
            onClick={onCreateInvoice}
            className="w-full flex items-center justify-center gap-2 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 hover:shadow-lg shadow-md"
            style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)' }}
          >
            <span className="text-lg">+</span>
            Create Invoice
          </button>

          <button
            onClick={onDiscard}
            className="w-full px-4 py-2 border-2 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors duration-200"
            style={{ borderColor: '#1e3a5f' }}
          >
            Discard
          </button>
        </div>

        {/* Warning if balance due */}
        {calculations.balanceDue > 0 && calculations.finalPayable > 0 && (
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 text-center font-medium">
              ⚠️ Balance: Rs. {calculations.balanceDue.toFixed(2)}
            </p>
          </div>
        )}

        {/* Success if fully paid */}
        {calculations.balanceDue === 0 && calculations.finalPayable > 0 && (
          <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs text-green-800 text-center font-medium">
              ✓ Fully Paid
            </p>
          </div>
        )}
      </div>
    </div>
  );
}