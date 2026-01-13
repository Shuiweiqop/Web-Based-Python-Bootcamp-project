// resources/js/Pages/Admin/Lessons/components/StatisticsCards.jsx
import React from 'react';
import {
  AcademicCapIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

export default function StatisticsCards({ statistics = {}, currentData = [] }) {
  const stats = [
    {
      label: 'Total Lessons',
      value: statistics?.total_lessons || 0,
      icon: AcademicCapIcon,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      iconBg: 'bg-blue-100',
    },
    {
      label: 'Active',
      value: statistics?.active_lessons || 0,
      icon: CheckCircleIcon,
      color: 'bg-green-50 text-green-600 border-green-200',
      iconBg: 'bg-green-100',
    },
    {
      label: 'Drafts',
      value: statistics?.draft_lessons || 0,
      icon: DocumentTextIcon,
      color: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      iconBg: 'bg-yellow-100',
    },
    {
      label: 'Inactive',
      value: (currentData || []).filter(l => l.status === 'inactive').length || 0,
      icon: XCircleIcon,
      color: 'bg-red-50 text-red-600 border-red-200',
      iconBg: 'bg-red-100',
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`${stat.color} rounded-lg border p-4 transition-transform hover:scale-105`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.iconBg} p-3 rounded-lg`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}