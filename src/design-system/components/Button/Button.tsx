import React from 'apos;react'apos;;
import { designTokens } from 'apos;../../tokens'apos;;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'apos;primary'apos; | 'apos;secondary'apos; | 'apos;success'apos; | 'apos;warning'apos; | 'apos;error'apos; | 'apos;ghost'apos; | 'apos;outline'apos;;
  size?: 'apos;sm'apos; | 'apos;md'apos; | 'apos;lg'apos;;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'apos;left'apos; | 'apos;right'apos;;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'apos;primary'apos;,
  size = 'apos;md'apos;,
  loading = false,
  icon,
  iconPosition = 'apos;left'apos;,
  fullWidth = false,
  children,
  disabled,
  className = 'apos;'apos;,
  style,
  ...props
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'apos;inline-flex'apos;,
    alignItems: 'apos;center'apos;,
    justifyContent: 'apos;center'apos;,
    gap: designTokens.spacing[2],
    fontFamily: designTokens.typography.fontFamily,
    fontWeight: designTokens.typography.fontWeight.semibold,
    border: 'apos;none'apos;,
    borderRadius: designTokens.borderRadius.base,
    cursor: disabled || loading ? 'apos;not-allowed'apos; : 'apos;pointer'apos;,
    transition: 'apos;all 0.2s ease-in-out'apos;,
    outline: 'apos;none'apos;,
    width: fullWidth ? 'apos;100%'apos; : 'apos;auto'apos;,
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
      'apos;&:hover'apos;: {
        boxShadow: designTokens.shadows.berioxHover,
        transform: 'apos;translateY(-1px)'apos;,
      },
    },
    secondary: {
      background: designTokens.colors.neutral[100],
      color: designTokens.colors.text.primary,
      border: `1px solid ${designTokens.colors.border.light}`,
      'apos;&:hover'apos;: {
        background: designTokens.colors.neutral[200],
      },
    },
    success: {
      background: designTokens.colors.success[500],
      color: designTokens.colors.text.inverse,
      'apos;&:hover'apos;: {
        background: designTokens.colors.success[600],
      },
    },
    warning: {
      background: designTokens.colors.warning[500],
      color: designTokens.colors.text.inverse,
      'apos;&:hover'apos;: {
        background: designTokens.colors.warning[600],
      },
    },
    error: {
      background: designTokens.colors.error[500],
      color: designTokens.colors.text.inverse,
      'apos;&:hover'apos;: {
        background: designTokens.colors.error[600],
      },
    },
    ghost: {
      background: 'apos;transparent'apos;,
      color: designTokens.colors.text.secondary,
      'apos;&:hover'apos;: {
        background: designTokens.colors.neutral[100],
      },
    },
    outline: {
      background: 'apos;transparent'apos;,
      color: designTokens.colors.text.primary,
      border: `1px solid ${designTokens.colors.border.medium}`,
      'apos;&:hover'apos;: {
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
    if (!disabled && !loading && variant === 'apos;primary'apos;) {
      e.currentTarget.style.boxShadow = designTokens.shadows.berioxHover;
      e.currentTarget.style.transform = 'apos;translateY(-1px)'apos;;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && variant === 'apos;primary'apos;) {
      e.currentTarget.style.boxShadow = designTokens.shadows.beriox;
      e.currentTarget.style.transform = 'apos;translateY(0)'apos;;
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
        <span style={{ animation: 'apos;spin 1s linear infinite'apos; }}>
          ⟳
        </span>
      )}
      {!loading && icon && iconPosition === 'apos;left'apos; && icon}
      {children}
      {!loading && icon && iconPosition === 'apos;right'apos; && icon}
    </button>
  );
};

export default Button;
