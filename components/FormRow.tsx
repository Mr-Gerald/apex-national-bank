
import React from 'react';

interface FormRowProps {
  label: string;
  name: string;
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  pattern?: string; // For input patterns like SSN
  children?: React.ReactNode; // For select elements or custom inputs
}

const FormRowComponent: React.FC<FormRowProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  maxLength,
  pattern,
  children
}) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-neutral-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children || (
        <input
          type={type}
          name={name}
          id={name}
          value={value || ''}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
          pattern={pattern}
          className="mt-1 block w-full p-2 border border-neutral-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
        />
      )}
    </div>
  );
};

export const FormRow = React.memo(FormRowComponent);