import React from 'react';

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, description, children, className = '' }) => (
  <div className={`rounded-xl border shadow-sm ${className}`}>
    <div className="p-6 pb-4">
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </div>
    <div className="px-6 pb-6">{children}</div>
  </div>
);

export default ChartCard;

