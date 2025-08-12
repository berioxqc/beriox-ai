import React from 'apos;react'apos;;
import { designTokens } from 'apos;../../tokens'apos;;

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'apos;size'apos;> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'apos;sm'apos; | 'apos;md'apos; | 'apos;lg'apos;;
  variant?: 'apos;default'apos; | 'apos;outlined'apos; | 'apos;filled'apos;;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  size = 'apos;md'apos;,
  variant = 'apos;default'apos;,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = 'apos;'apos;,
  style,
  disabled,
  ...props
}) => {
  const baseStyles: React.CSSProperties = {
    fontFamily: designTokens.typography.fontFamily,
    fontSize: designTokens.typography.fontSize.base,
    border: `1px solid ${error ? designTokens.colors.error[500] : designTokens.colors.border.light}`,
    borderRadius: designTokens.borderRadius.base,
    background: designTokens.colors.background.primary,
    color: designTokens.colors.text.primary,
    outline: 'apos;none'apos;,
    transition: 'apos;all 0.2s ease-in-out'apos;,
    width: fullWidth ? 'apos;100%'apos; : 'apos;auto'apos;,
    ...style,
  };

  const sizeStyles = {
    sm: {
      padding: `${designTokens.spacing[2]} ${designTokens.spacing[3]}`,
      fontSize: designTokens.typography.fontSize.sm,
    },
    md: {
      padding: `${designTokens.spacing[3]} ${designTokens.spacing[4]}`,
      fontSize: designTokens.typography.fontSize.base,
    },
    lg: {
      padding: `${designTokens.spacing[4]} ${designTokens.spacing[5]}`,
      fontSize: designTokens.typography.fontSize.lg,
    },
  };

  const variantStyles = {
    default: {
      background: designTokens.colors.background.primary,
      'apos;&:focus'apos;: {
        borderColor: designTokens.colors.primary[500],
        boxShadow: `0 0 0 3px ${designTokens.colors.primary[100]}`,
      },
    },
    outlined: {
      background: 'apos;transparent'apos;,
      borderWidth: 'apos;2px'apos;,
      'apos;&:focus'apos;: {
        borderColor: designTokens.colors.primary[500],
        boxShadow: `0 0 0 3px ${designTokens.colors.primary[100]}`,
      },
    },
    filled: {
      background: designTokens.colors.neutral[50],
      borderColor: 'apos;transparent'apos;,
      'apos;&:focus'apos;: {
        background: designTokens.colors.background.primary,
        borderColor: designTokens.colors.primary[500],
        boxShadow: `0 0 0 3px ${designTokens.colors.primary[100]}`,
      },
    },
  };

  const inputStyles: React.CSSProperties = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'apos;not-allowed'apos; : 'apos;text'apos;,
  };

  const containerStyles: React.CSSProperties = {
    display: 'apos;flex'apos;,
    flexDirection: 'apos;column'apos;,
    gap: designTokens.spacing[1],
    width: fullWidth ? 'apos;100%'apos; : 'apos;auto'apos;,
  };

  const labelStyles: React.CSSProperties = {
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.medium,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing[1],
  };

  const helperTextStyles: React.CSSProperties = {
    fontSize: designTokens.typography.fontSize.xs,
    color: error ? designTokens.colors.error[600] : designTokens.colors.text.tertiary,
    marginTop: designTokens.spacing[1],
  };

  const inputContainerStyles: React.CSSProperties = {
    position: 'apos;relative'apos;,
    display: 'apos;flex'apos;,
    alignItems: 'apos;center'apos;,
  };

  const iconStyles: React.CSSProperties = {
    position: 'apos;absolute'apos;,
    display: 'apos;flex'apos;,
    alignItems: 'apos;center'apos;,
    justifyContent: 'apos;center'apos;,
    color: designTokens.colors.text.tertiary,
    zIndex: 1,
  };

  const leftIconStyles: React.CSSProperties = {
    ...iconStyles,
    left: designTokens.spacing[3],
  };

  const rightIconStyles: React.CSSProperties = {
    ...iconStyles,
    right: designTokens.spacing[3],
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = designTokens.colors.primary[500];
    e.currentTarget.style.boxShadow = `0 0 0 3px ${designTokens.colors.primary[100]}`;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = error ? designTokens.colors.error[500] : designTokens.colors.border.light;
    e.currentTarget.style.boxShadow = 'apos;none'apos;;
  };

  return (
    <div style={containerStyles}>
      {label && <label style={labelStyles}>{label}</label>}
      <div style={inputContainerStyles}>
        {leftIcon && <div style={leftIconStyles}>{leftIcon}</div>}
        <input
          style={{
            ...inputStyles,
            paddingLeft: leftIcon ? `${designTokens.spacing[10]}` : undefined,
            paddingRight: rightIcon ? `${designTokens.spacing[10]}` : undefined,
          }}
          className={className}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon && <div style={rightIconStyles}>{rightIcon}</div>}
      </div>
      {(helperText || error) && (
        <div style={helperTextStyles}>
          {error || helperText}
        </div>
      )}
    </div>
  );
};

export default Input;
