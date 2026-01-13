import React from 'react';

/**
 * Basic Info Form Component
 * Responsibility: reward name, description, type and rarity selection
 */
export default function BasicInfo({
  formData,
  onChange,
  rewardTypes,
  rarities,
  errors,
  isEditing = false, // ✅ whether this is edit mode
}) {
  // unified onChange handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ name, value });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>

      <div className="space-y-4">
        {/* Reward name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Reward Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g.: Golden Avatar Frame"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
            required
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe this reward in detail..."
            rows="3"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none"
            required
          />
          {errors.description && (
            <p className="text-red-600 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Reward type & rarity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reward Type *
            </label>
            <select
              name="reward_type"
              value={formData.reward_type}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
            >
              {Object.entries(rewardTypes).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rarity *
            </label>
            <select
              name="rarity"
              value={formData.rarity}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
            >
              {Object.entries(rarities).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
