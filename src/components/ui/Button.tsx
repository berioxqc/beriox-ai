import React from 'apos;react'apos;;
import Icon from 'apos;./Icon'apos;;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'apos;primary'apos; | 'apos;secondary'apos; | 'apos;outline'apos; | 'apos;ghost'apos; | 'apos;danger'apos; | 'apos;success'apos;;
  size?: 'apos;sm'apos; | 'apos;md'apos; | 'apos;lg'apos; | 'apos;xl'apos;;
  icon?: string;
  iconPosition?: 'apos;left'apos; | 'apos;right'apos;;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'apos;primary'apos;,
  size = 'apos;md'apos;,
  icon,
  iconPosition = 'apos;left'apos;,
  loading = false,
  fullWidth = false,
  children,
  className = 'apos;'apos;,
  disabled,
  ...props
}) => {
  const baseClasses = 'apos;inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'apos;;
  
  const variantClasses = {
    primary: 'apos;bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 focus:ring-purple-500 shadow-lg hover:shadow-xl'apos;,
    secondary: 'apos;bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 border border-gray-300'apos;,
    outline: 'apos;border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white focus:ring-purple-500'apos;,
    ghost: 'apos;text-gray-700 hover:bg-gray-100 focus:ring-gray-500'apos;,
    danger: 'apos;bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg hover:shadow-xl'apos;,
    success: 'apos;bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-lg hover:shadow-xl'apos;
  };

  const sizeClasses = {
    sm: 'apos;px-3 py-1.5 text-sm gap-1.5'apos;,
    md: 'apos;px-4 py-2 text-sm gap-2'apos;,
    lg: 'apos;px-6 py-3 text-base gap-2'apos;,
    xl: 'apos;px-8 py-4 text-lg gap-3'apos;
  };

  const widthClass = fullWidth ? 'apos;w-full'apos; : 'apos;'apos;;
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClass,
    className
  ].filter(Boolean).join('apos; 'apos;);

  const iconSize = {
    sm: 16,
    md: 18,
    lg: 20,
    xl: 24
  }[size];

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full border-2 border-current border-t-transparent" style={{ width: iconSize, height: iconSize }} />
      )}
      
      {!loading && icon && iconPosition === 'apos;left'apos; && (
        <Icon name={icon} size={iconSize} />
      )}
      
      <span>{children}</span>
      
      {!loading && icon && iconPosition === 'apos;right'apos; && (
        <Icon name={icon} size={iconSize} />
      )}
    </button>
  );
};

export default Button;
