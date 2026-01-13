import React from 'react';
import { Activity, Sparkles, Clock, Compass } from 'lucide-react';
import NavButton from './Cards/NavButton';

export default function SectionNavigation({ activeSection, onSectionChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <NavButton
        active={activeSection === 'overview'}
        onClick={() => onSectionChange('overview')}
        icon={Activity}
        label="Overview"
      />
      <NavButton
        active={activeSection === 'rewards'}
        onClick={() => onSectionChange('rewards')}
        icon={Sparkles}
        label="My Rewards"
      />
      <NavButton
        active={activeSection === 'activity'}
        onClick={() => onSectionChange('activity')}
        icon={Clock}
        label="Activity"
      />
      <NavButton
        active={activeSection === 'paths'}
        onClick={() => onSectionChange('paths')}
        icon={Compass}
        label="Learning Paths"
      />
    </div>
  );
}