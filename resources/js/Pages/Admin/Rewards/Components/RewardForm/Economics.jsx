import React from 'react';

/**
 * Economics Configuration Form Component
 * Responsibility: point cost, stock quantity, max owned per user, activation status
 */
export default function Economics({ formData, onChange, errors }) {
  // Unified onChange handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onChange({
      name,
      value: type === 'checkbox' ? checked : value,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Economics</h2>

      <div className="space-y-4">
        {/* Point cost */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Points required to purchase *
          </label>
          <input
            type="number"
            name="point_cost"
            value={formData.point_cost}
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
            required
          />
          {errors.point_cost && (
            <p className="text-red-600 text-sm mt-1">{errors.point_cost}</p>
          )}
        </div>

        {/* Stock and per-user limit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Stock quantity
            </label>
            <input
              type="number"
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleChange}
              min="-1"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">-1 = unlimited</p>
            {errors.stock_quantity && (
              <p className="text-red-600 text-sm mt-1">{errors.stock_quantity}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Max owned per user
            </label>
            <input
              type="number"
              name="max_owned"
              value={formData.max_owned}
              onChange={handleChange}
              min="-1"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">-1 = unlimited</p>
            {errors.max_owned && (
              <p className="text-red-600 text-sm mt-1">{errors.max_owned}</p>
            )}
          </div>
        </div>

        {/* Activation */}
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300"
          />
          <label className="text-sm font-medium text-gray-900">
            Activate this reward immediately
          </label>
        </div>
      </div>
    </div>
  );
}
