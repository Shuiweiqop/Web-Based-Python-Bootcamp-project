import React, { useState } from 'react';
import BasicTab from './BasicTab';
import AnimationTab from './AnimationTab';
import FiltersTab from './FiltersTab';
import TransformTab from './TransformTab';
import LayersTab from './LayersTab';

/**
 * EffectsInspector Component
 * Tabbed interface for managing all image effects
 * 
 * @param {Object} props
 * @param {Object} props.effects - Current effects state
 * @param {Function} props.updateEffects - Function to update effects
 */
const EffectsInspector = ({ effects, updateEffects }) => {
  const [activeTab, setActiveTab] = useState('basic');

  const tabs = [
    { id: 'basic', label: 'Basic', icon: '🎨' },
    { id: 'transform', label: 'Transform', icon: '🔄' },
    { id: 'filters', label: 'Filters', icon: '✨' },
    { id: 'animation', label: 'Animation', icon: '🎬' },
    { id: 'layers', label: 'Layers', icon: '📚' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return <BasicTab effects={effects} updateEffects={updateEffects} />;
      case 'transform':
        return <TransformTab effects={effects} updateEffects={updateEffects} />;
      case 'filters':
        return <FiltersTab effects={effects} updateEffects={updateEffects} />;
      case 'animation':
        return <AnimationTab effects={effects} updateEffects={updateEffects} />;
      case 'layers':
        return <LayersTab effects={effects} updateEffects={updateEffects} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[100px] px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default EffectsInspector;