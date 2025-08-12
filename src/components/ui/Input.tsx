import React from 'apos;react'apos;;

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  type?: 'apos;text'apos; | 'apos;email'apos; | 'apos;password'apos; | 'apos;number'apos; | 'apos;textarea'apos;;
  disabled?: boolean;
  error?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  rows?: number;
}

const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder = 'apos;'apos;,
  label,
  type = 'apos;text'apos;,
  disabled = false,
  error,
  className = 'apos;'apos;,
  onKeyDown,
  rows = 3
}) => {
  const baseStyles = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200";
  const errorStyles = error ? "border-red-500 focus:ring-red-500" : "";
  const disabledStyles = disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white";
  
  const styles = `${baseStyles} ${errorStyles} ${disabledStyles} ${className}`;
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      {type === 'apos;textarea'apos; ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={styles}
          onKeyDown={onKeyDown}
          rows={rows}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={styles}
          onKeyDown={onKeyDown}
        />
      )}
      
      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
