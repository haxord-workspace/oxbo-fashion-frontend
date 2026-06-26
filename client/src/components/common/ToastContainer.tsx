import React from 'react';
import { useAppSelector } from '../../app/hooks';

const ToastContainer: React.FC = () => {
  const toasts = useAppSelector((state) => state.ui.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} className="bg-gray-800 text-white p-3 rounded shadow">
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
