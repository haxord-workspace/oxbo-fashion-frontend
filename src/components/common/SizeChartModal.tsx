import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'tops' | 'bottoms' | 'long-sleeve';
}

const topsData = [
  { size: 'S', chest: '38', shoulder: '17', length: '27', sleeve: '13' },
  { size: 'M', chest: '40', shoulder: '17.5', length: '28', sleeve: '13.5' },
  { size: 'L', chest: '42', shoulder: '18', length: '29', sleeve: '14' },
  { size: 'XL', chest: '44', shoulder: '18.5', length: '30', sleeve: '14.5' },
  { size: 'XXL', chest: '46', shoulder: '19', length: '31', sleeve: '15' },
  { size: '3XL', chest: '48', shoulder: '19.5', length: '32', sleeve: '-' },
];

const longSleeveData = [
  { size: 'S', chest: '38', shoulder: '17.5', length: '27', sleeve: '24' },
  { size: 'M', chest: '40', shoulder: '18', length: '28', sleeve: '24.5' },
  { size: 'L', chest: '42', shoulder: '18.5', length: '29', sleeve: '25' },
  { size: 'XL', chest: '44', shoulder: '19', length: '30', sleeve: '25.5' },
  { size: 'XXL', chest: '46', shoulder: '19.5', length: '31', sleeve: '26' },
];

const bottomsData = [
  { size: '28', waist: '28', hip: '38', inseam: '30', outseam: '40' },
  { size: '30', waist: '30', hip: '40', inseam: '30', outseam: '41' },
  { size: '32', waist: '32', hip: '42', inseam: '31', outseam: '42' },
  { size: '34', waist: '34', hip: '44', inseam: '31', outseam: '43' },
  { size: '36', waist: '36', hip: '46', inseam: '32', outseam: '44' },
  { size: '38', waist: '38', hip: '48', inseam: '32', outseam: '45' },
];

const SizeChartModal: React.FC<SizeChartModalProps> = ({ isOpen, onClose, defaultTab = 'tops' }) => {
  const [activeTab, setActiveTab] = useState<'tops' | 'bottoms' | 'long-sleeve'>(defaultTab);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div 
        className="bg-black text-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-gray-800">
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wider">Size Guide</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-5 sm:p-6">
            {/* Tabs */}
            <div className="flex space-x-2 border-b border-gray-800 mb-8 overflow-x-auto hide-scrollbar pb-1">
              <button
                className={`px-4 py-2 font-medium text-sm transition-colors uppercase tracking-wider whitespace-nowrap ${
                  activeTab === 'tops' ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('tops')}
              >
                Shirts / T-Shirts
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm transition-colors uppercase tracking-wider whitespace-nowrap ${
                  activeTab === 'long-sleeve' ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('long-sleeve')}
              >
                Long Sleeve
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm transition-colors uppercase tracking-wider whitespace-nowrap ${
                  activeTab === 'bottoms' ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('bottoms')}
              >
                Pants / Jeans
              </button>
            </div>

            {/* Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 uppercase text-xs sm:text-sm tracking-wider">
                    {activeTab === 'bottoms' ? (
                      <>
                        <th className="py-4 px-4 font-semibold text-white">Waist Size</th>
                        <th className="py-4 px-4 font-semibold text-white">Waist (in)</th>
                        <th className="py-4 px-4 font-semibold text-white">Hip (in)</th>
                        <th className="py-4 px-4 font-semibold text-white">Inseam (in)</th>
                        <th className="py-4 px-4 font-semibold text-white">Outseam (in)</th>
                      </>
                    ) : (
                      <>
                        <th className="py-4 px-4 font-semibold text-white">Size</th>
                        <th className="py-4 px-4 font-semibold text-white">Chest (in)</th>
                        <th className="py-4 px-4 font-semibold text-white">Shoulder (in)</th>
                        <th className="py-4 px-4 font-semibold text-white">Length (in)</th>
                        <th className="py-4 px-4 font-semibold text-white">Sleeve Length (in)</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="text-gray-200">
                  {activeTab === 'tops' && topsData.map((row, i) => (
                    <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors">
                      <td className="py-4 px-4 font-medium">{row.size}</td>
                      <td className="py-4 px-4">{row.chest}</td>
                      <td className="py-4 px-4">{row.shoulder}</td>
                      <td className="py-4 px-4">{row.length}</td>
                      <td className="py-4 px-4">{row.sleeve}</td>
                    </tr>
                  ))}
                  {activeTab === 'long-sleeve' && longSleeveData.map((row, i) => (
                    <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors">
                      <td className="py-4 px-4 font-medium">{row.size}</td>
                      <td className="py-4 px-4">{row.chest}</td>
                      <td className="py-4 px-4">{row.shoulder}</td>
                      <td className="py-4 px-4">{row.length}</td>
                      <td className="py-4 px-4">{row.sleeve}</td>
                    </tr>
                  ))}
                  {activeTab === 'bottoms' && bottomsData.map((row, i) => (
                    <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors">
                      <td className="py-4 px-4 font-medium">{row.size}</td>
                      <td className="py-4 px-4">{row.waist}</td>
                      <td className="py-4 px-4">{row.hip}</td>
                      <td className="py-4 px-4">{row.inseam}</td>
                      <td className="py-4 px-4">{row.outseam}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-gray-500 text-xs mt-6 italic">
              * Measurements are in inches. Please allow 0.5-1 inch difference due to manual measurement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeChartModal;
