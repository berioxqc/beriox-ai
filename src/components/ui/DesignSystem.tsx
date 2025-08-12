'apos;use client'apos;;

import React from 'apos;react'apos;;
import { cn } from 'apos;@/lib/utils'apos;;

// ===== TYPOGRAPHY =====
export const Typography = {
  h1: ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className={cn('apos;text-4xl font-bold text-gray-900 mb-4'apos;, className)} {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className={cn('apos;text-3xl font-semibold text-gray-900 mb-3'apos;, className)} {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn('apos;text-2xl font-semibold text-gray-900 mb-2'apos;, className)} {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className={cn('apos;text-xl font-medium text-gray-900 mb-2'apos;, className)} {...props}>
      {children}
    </h4>
  ),
  p: ({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn('apos;text-base text-gray-700 leading-relaxed'apos;, className)} {...props}>
      {children}
    </p>
  ),
  small: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <small className={cn('apos;text-sm text-gray-600'apos;, className)} {...props}>
      {children}
    </small>
  ),
};

// ===== BUTTONS =====
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'apos;primary'apos; | 'apos;secondary'apos; | 'apos;outline'apos; | 'apos;ghost'apos; | 'apos;danger'apos;;
  size?: 'apos;sm'apos; | 'apos;md'apos; | 'apos;lg'apos;;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'apos;primary'apos;, size = 'apos;md'apos;, loading = false, icon, children, disabled, ...props }, ref) => {
    const baseClasses = 'apos;inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'apos;;
    
    const variants = {
      primary: 'apos;bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 shadow-sm'apos;,
      secondary: 'apos;bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500'apos;,
      outline: 'apos;border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-purple-500'apos;,
      ghost: 'apos;text-gray-700 hover:bg-gray-100 focus:ring-gray-500'apos;,
      danger: 'apos;bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm'apos;,
    };

    const sizes = {
      sm: 'apos;px-3 py-1.5 text-sm'apos;,
      md: 'apos;px-4 py-2 text-sm'apos;,
      lg: 'apos;px-6 py-3 text-base'apos;,
    };

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {icon && !loading && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'apos;Button'apos;;

// ===== CARDS =====
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'apos;default'apos; | 'apos;elevated'apos; | 'apos;outlined'apos;;
  padding?: 'apos;sm'apos; | 'apos;md'apos; | 'apos;lg'apos;;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'apos;default'apos;, padding = 'apos;md'apos;, children, ...props }, ref) => {
    const baseClasses = 'apos;rounded-xl transition-all duration-200'apos;;
    
    const variants = {
      default: 'apos;bg-white border border-gray-200'apos;,
      elevated: 'apos;bg-white shadow-lg border border-gray-200'apos;,
      outlined: 'apos;bg-white border-2 border-gray-200'apos;,
    };

    const paddings = {
      sm: 'apos;p-4'apos;,
      md: 'apos;p-6'apos;,
      lg: 'apos;p-8'apos;,
    };

    return (
      <div
        ref={ref}
        className={cn(baseClasses, variants[variant], paddings[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'apos;Card'apos;;

// ===== BADGES =====
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'apos;default'apos; | 'apos;success'apos; | 'apos;warning'apos; | 'apos;danger'apos; | 'apos;info'apos;;
  size?: 'apos;sm'apos; | 'apos;md'apos;;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'apos;default'apos;, size = 'apos;md'apos;, children, ...props }, ref) => {
    const baseClasses = 'apos;inline-flex items-center font-medium rounded-full'apos;;
    
    const variants = {
      default: 'apos;bg-gray-100 text-gray-800'apos;,
      success: 'apos;bg-green-100 text-green-800'apos;,
      warning: 'apos;bg-yellow-100 text-yellow-800'apos;,
      danger: 'apos;bg-red-100 text-red-800'apos;,
      info: 'apos;bg-blue-100 text-blue-800'apos;,
    };

    const sizes = {
      sm: 'apos;px-2 py-0.5 text-xs'apos;,
      md: 'apos;px-2.5 py-0.5 text-sm'apos;,
    };

    return (
      <span
        ref={ref}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'apos;Badge'apos;;

// ===== ALERTS =====
interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'apos;info'apos; | 'apos;success'apos; | 'apos;warning'apos; | 'apos;danger'apos;;
  title?: string;
  onClose?: () => void;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'apos;info'apos;, title, children, onClose, ...props }, ref) => {
    const baseClasses = 'apos;rounded-lg p-4 border-l-4'apos;;
    
    const variants = {
      info: 'apos;bg-blue-50 border-blue-400 text-blue-800'apos;,
      success: 'apos;bg-green-50 border-green-400 text-green-800'apos;,
      warning: 'apos;bg-yellow-50 border-yellow-400 text-yellow-800'apos;,
      danger: 'apos;bg-red-50 border-red-400 text-red-800'apos;,
    };

    const icons = {
      info: 'apos;ℹ️'apos;,
      success: 'apos;✅'apos;,
      warning: 'apos;⚠️'apos;,
      danger: 'apos;❌'apos;,
    };

    return (
      <div
        ref={ref}
        className={cn(baseClasses, variants[variant], className)}
        {...props}
      >
        <div className="flex items-start">
          <span className="mr-2 text-lg">{icons[variant]}</span>
          <div className="flex-1">
            {title && <h4 className="font-medium mb-1">{title}</h4>}
            <div className="text-sm">{children}</div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 text-lg hover:opacity-70 transition-opacity"
            >
              ×
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'apos;Alert'apos;;

// ===== INPUTS =====
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{leftIcon}</span>
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'apos;block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm transition-colors'apos;,
              leftIcon && 'apos;pl-10'apos;,
              rightIcon && 'apos;pr-10'apos;,
              error && 'apos;border-red-300 focus:border-red-500 focus:ring-red-500'apos;,
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{rightIcon}</span>
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'apos;Input'apos;;

// ===== TEXTAREA =====
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'apos;block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm transition-colors'apos;,
            error && 'apos;border-red-300 focus:border-red-500 focus:ring-red-500'apos;,
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'apos;Textarea'apos;;

// ===== SELECT =====
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'apos;block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm transition-colors'apos;,
            error && 'apos;border-red-300 focus:border-red-500 focus:ring-red-500'apos;,
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'apos;Select'apos;;

// ===== MODAL =====
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'apos;sm'apos; | 'apos;md'apos; | 'apos;lg'apos; | 'apos;xl'apos;;
}

export const Modal = ({ isOpen, onClose, title, children, size = 'apos;md'apos; }: ModalProps) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'apos;max-w-md'apos;,
    md: 'apos;max-w-lg'apos;,
    lg: 'apos;max-w-2xl'apos;,
    xl: 'apos;max-w-4xl'apos;,
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className={`relative bg-white rounded-xl shadow-xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="sr-only">Fermer</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== TOOLTIP =====
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'apos;top'apos; | 'apos;bottom'apos; | 'apos;left'apos; | 'apos;right'apos;;
}

export const Tooltip = ({ content, children, position = 'apos;top'apos; }: TooltipProps) => {
  const positions = {
    top: 'apos;bottom-full left-1/2 transform -translate-x-1/2 mb-2'apos;,
    bottom: 'apos;top-full left-1/2 transform -translate-x-1/2 mt-2'apos;,
    left: 'apos;right-full top-1/2 transform -translate-y-1/2 mr-2'apos;,
    right: 'apos;left-full top-1/2 transform -translate-y-1/2 ml-2'apos;,
  };

  return (
    <div className="relative group">
      {children}
      <div className={`absolute ${positions[position]} z-10 px-2 py-1 text-sm text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap`}>
        {content}
        <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
          position === 'apos;top'apos; ? 'apos;top-full left-1/2 -translate-x-1/2 -mt-1'apos; :
          position === 'apos;bottom'apos; ? 'apos;bottom-full left-1/2 -translate-x-1/2 -mb-1'apos; :
          position === 'apos;left'apos; ? 'apos;left-full top-1/2 -translate-y-1/2 -ml-1'apos; :
          'apos;right-full top-1/2 -translate-y-1/2 -mr-1'apos;
        }`} />
      </div>
    </div>
  );
};

// ===== SKELETON =====
interface SkeletonProps {
  className?: string;
  lines?: number;
}

export const Skeleton = ({ className, lines = 1 }: SkeletonProps) => {
  if (lines === 1) {
    return (
      <div className={cn('apos;animate-pulse bg-gray-200 rounded'apos;, className)} />
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn('apos;animate-pulse bg-gray-200 rounded h-4'apos;, className)}
          style={{ width: `${100 - (i * 10)}%` }}
        />
      ))}
    </div>
  );
};

// ===== DIVIDER =====
interface DividerProps {
  className?: string;
  text?: string;
}

export const Divider = ({ className, text }: DividerProps) => {
  if (text) {
    return (
      <div className={cn('apos;relative my-6'apos;, className)}>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">{text}</span>
        </div>
      </div>
    );
  }

  return <hr className={cn('apos;border-gray-200 my-4'apos;, className)} />;
};

// ===== EXPORT ALL COMPONENTS =====
export const DesignSystem = {
  Typography,
  Button,
  Card,
  Badge,
  Alert,
  Input,
  Textarea,
  Select,
  Modal,
  Tooltip,
  Skeleton,
  Divider,
};
