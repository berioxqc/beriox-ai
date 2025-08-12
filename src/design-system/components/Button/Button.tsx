import React from 'react';
import { designTokens } from '../../tokens';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  disabled,
  className = '',
  style,
  ...props
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: designTokens.spacing[2],
    fontFamily: designTokens.typography.fontFamily,
    fontWeight: designTokens.typography.fontWeight.semibold,
    border: 'none',
    borderRadius: designTokens.borderRadius.base,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    width: fullWidth ? '100%' : 'auto',
    ...style,
  };

  const sizeStyles = {
    sm: {
      padding: `${designTokens.spacing[2]} ${designTokens.spacing[4]}`,
      fontSize: designTokens.typography.fontSize.sm,
    },
    md: {
      padding: `${designTokens.spacing[3]} ${designTokens.spacing[5]}`,
      fontSize: designTokens.typography.fontSize.base,
    },
    lg: {
      padding: `${designTokens.spacing[4]} ${designTokens.spacing[6]}`,
      fontSize: designTokens.typography.fontSize.lg,
    },
  };

  const variantStyles = {
    primary: {
      background: designTokens.colors.beriox.gradient,
      color: designTokens.colors.text.inverse,
      boxShadow: designTokens.shadows.beriox,
      '&:hover': {
        boxShadow: designTokens.shadows.berioxHover,
        transform: 'translateY(-1px)',
      },
    },
    secondary: {
      background: designTokens.colors.neutral[100],
      color: designTokens.colors.text.primary,
      border: `1px solid ${designTokens.colors.border.light}`,
      '&:hover': {
        background: designTokens.colors.neutral[200],
      },
    },
    success: {
      background: designTokens.colors.success[500],
      color: designTokens.colors.text.inverse,
      '&:hover': {
        background: designTokens.colors.success[600],
      },
    },
    warning: {
      background: designTokens.colors.warning[500],
      color: designTokens.colors.text.inverse,
      '&:hover': {
        background: designTokens.colors.warning[600],
      },
    },
    error: {
      background: designTokens.colors.error[500],
      color: designTokens.colors.text.inverse,
      '&:hover': {
        background: designTokens.colors.error[600],
      },
    },
    ghost: {
      background: 'transparent',
      color: designTokens.colors.text.secondary,
      '&:hover': {
        background: designTokens.colors.neutral[100],
      },
    },
    outline: {
      background: 'transparent',
      color: designTokens.colors.text.primary,
      border: `1px solid ${designTokens.colors.border.medium}`,
      '&:hover': {
        background: designTokens.colors.neutral[50],
        borderColor: designTokens.colors.border.dark,
      },
    },
  };

  const buttonStyles: React.CSSProperties = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    opacity: disabled || loading ? 0.6 : 1,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && variant === 'primary') {
      e.currentTarget.style.boxShadow = designTokens.shadows.berioxHover;
      e.currentTarget.style.transform = 'translateY(-1px)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && variant === 'primary') {
      e.currentTarget.style.boxShadow = designTokens.shadows.beriox;
      e.currentTarget.style.transform = 'translateY(0)';
    }
  };

  return (
    <button
      style={buttonStyles}
      disabled={disabled || loading}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {loading && (
        <span style={{ animation: 'spin 1s linear infinite' }}>
          ⟳
        </span>
      )}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  );
};

export default Button;
