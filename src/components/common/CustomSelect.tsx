import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface Option {
  value: string;
  label: string;
  isGroup?: boolean;
}

interface CustomSelectProps {
  name: string;
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  error?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  name,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  error = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
  };

  const selectedLabel = options.find(opt => opt.value === value)?.label || value || placeholder;

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between border rounded-none px-3 py-2.5 text-base sm:text-sm focus:outline-none transition-colors bg-white ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown size={16} className={`text-gray-500 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-[100] mt-1 bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto w-full">
          {options.map((opt, index) => {
            if (opt.isGroup) {
              return (
                <div key={`group-${index}`} className="px-3 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10">
                  {opt.label}
                </div>
              );
            }
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-3 py-2.5 text-base sm:text-sm hover:bg-gray-100 transition-colors truncate block ${
                  value === opt.value ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700'
                }`}
                title={opt.label}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
