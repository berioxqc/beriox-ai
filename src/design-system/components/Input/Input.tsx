import React from 'react'
import { designTokens } from '../../tokens'
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outlined' | 'filled'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  size = 'md',
  variant = 'default',
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
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
    outline: 'none',
    transition: 'all 0.2s ease-in-out',
    width: fullWidth ? '100%' : 'auto',
    ...style,
  }
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
  }
  const variantStyles = {
    default: {
      background: designTokens.colors.background.primary,
      '&:focus': {
        borderColor: designTokens.colors.primary[500],
        boxShadow: `0 0 0 3px ${designTokens.colors.primary[100]}`,
      },
    },
    outlined: {
      background: 'transparent',
      borderWidth: '2px',
      '&:focus': {
        borderColor: designTokens.colors.primary[500],
        boxShadow: `0 0 0 3px ${designTokens.colors.primary[100]}`,
      },
    },
    filled: {
      background: designTokens.colors.neutral[50],
      borderColor: 'transparent',
      '&:focus': {
        background: designTokens.colors.background.primary,
        borderColor: designTokens.colors.primary[500],
        boxShadow: `0 0 0 3px ${designTokens.colors.primary[100]}`,
      },
    },
  }
  const inputStyles: React.CSSProperties = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
  }
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: designTokens.spacing[1],
    width: fullWidth ? '100%' : 'auto',
  }
  const labelStyles: React.CSSProperties = {
    fontSize: designTokens.typography.fontSize.sm,
    fontWeight: designTokens.typography.fontWeight.medium,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing[1],
  }
  const helperTextStyles: React.CSSProperties = {
    fontSize: designTokens.typography.fontSize.xs,
    color: error ? designTokens.colors.error[600] : designTokens.colors.text.tertiary,
    marginTop: designTokens.spacing[1],
  }
  const inputContainerStyles: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  }
  const iconStyles: React.CSSProperties = {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: designTokens.colors.text.tertiary,
    zIndex: 1,
  }
  const leftIconStyles: React.CSSProperties = {
    ...iconStyles,
    left: designTokens.spacing[3],
  }
  const rightIconStyles: React.CSSProperties = {
    ...iconStyles,
    right: designTokens.spacing[3],
  }
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = designTokens.colors.primary[500]
    e.currentTarget.style.boxShadow = `0 0 0 3px ${designTokens.colors.primary[100]}`
  }
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = error ? designTokens.colors.error[500] : designTokens.colors.border.light
    e.currentTarget.style.boxShadow = 'none'
  }
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
  )
}
export default Input