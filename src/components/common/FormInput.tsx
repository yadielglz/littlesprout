import React from 'react';

interface FormInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'datetime-local' | 'date' | 'time' | 'textarea' | 'select';
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  className?: string;
  disabled?: boolean;
  options?: { value: string; label: string }[];
}

const FormInput: React.FC<FormInputProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  required = false,
  min,
  max,
  step,
  rows,
  className = '',
  disabled = false,
  options = []
}) => {
  const baseInputClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  
  const inputClasses = `${baseInputClasses} ${disabledClasses} ${className}`;

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          rows={rows || 3}
          disabled={disabled}
          className={inputClasses}
        />
      );
    }

    if (type === 'select') {
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          className={inputClasses}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={inputClasses}
      />
    );
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {renderInput()}
    </div>
  );
};

export default FormInput;
