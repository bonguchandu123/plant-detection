import React from 'react';
import { ChevronRight } from 'lucide-react';

// Stat Card Component
export const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className={`w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

// Quick Action Button Component
export const QuickActionButton = ({ icon: Icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
  >
    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
      <Icon className="w-5 h-5 text-green-600" />
    </div>
    <span className="font-medium text-gray-900">{label}</span>
    <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
  </button>
);

// Activity Item Component
export const ActivityItem = ({ title, description, time }) => (
  <div className="flex items-start space-x-3">
    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
    <div className="flex-1">
      <h4 className="font-semibold text-gray-900">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
      <p className="text-xs text-gray-400 mt-1">{time}</p>
    </div>
  </div>
);

// Impact Card Component
export const ImpactCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    green: 'text-green-600 bg-green-50',
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50'
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className={`w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

// Weather Card Component
export const WeatherCard = ({ icon: Icon, label, value }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 text-center">
    <Icon className="w-12 h-12 text-blue-600 mx-auto mb-2" />
    <p className="text-gray-600 text-sm mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

// Solution Card Component
export const SolutionCard = ({ title, description, successRate, cost, onViewDetails }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <span className="text-green-600 text-sm font-semibold">{successRate}</span>
    </div>
    <p className="text-gray-600 text-sm mb-4">{description}</p>
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">Cost: {cost}</span>
      <button 
        onClick={onViewDetails}
        className="text-green-600 font-semibold hover:underline"
      >
        View Details
      </button>
    </div>
  </div>
);

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} border-4 border-green-600 border-t-transparent rounded-full animate-spin`}></div>
    </div>
  );
};

// Alert Component
export const Alert = ({ type = 'info', title, message, icon: Icon }) => {
  const types = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };

  const iconColors = {
    info: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  };

  return (
    <div className={`p-4 ${types[type]} border rounded-lg flex items-start space-x-3`}>
      {Icon && <Icon className={`w-5 h-5 ${iconColors[type]} flex-shrink-0 mt-0.5`} />}
      <div>
        {title && <p className="font-semibold mb-1">{title}</p>}
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
};

// Empty State Component
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="text-center py-12">
    {Icon && <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />}
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6">{description}</p>
    {action && action}
  </div>
);