import React from 'react';

const PageWrapper: React.FC<{ title: React.ReactNode; children?: React.ReactNode; headerAction?: React.ReactNode }> = ({ title, children, headerAction }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      {headerAction}
    </div>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {children || (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">{title} Management</p>
          <p className="text-sm mt-1">This module is under development.</p>
        </div>
      )}
    </div>
  </div>
);

export default PageWrapper;
