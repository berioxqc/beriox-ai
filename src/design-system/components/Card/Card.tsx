import React from 'react'
import { designTokens } from '../../tokens'
export interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'interactive'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  hover?: boolean
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  children,
  className = '',
  style,
  onClick,
  hover = false,
}) => {
  const baseStyles: React.CSSProperties = {
    background: designTokens.colors.background.primary,
    borderRadius: designTokens.borderRadius.lg,
    fontFamily: designTokens.typography.fontFamily,
    transition: 'all 0.2s ease-in-out',
    ...style,
  }
  const variantStyles = {
    default: {
      border: `1px solid ${designTokens.colors.border.light}`,
      boxShadow: designTokens.shadows.sm,
    },
    elevated: {
      border: 'none',
      boxShadow: designTokens.shadows.lg,
    },
    outlined: {
      border: `2px solid ${designTokens.colors.border.medium}`,
      boxShadow: 'none',
    },
    interactive: {
      border: `1px solid ${designTokens.colors.border.light}`,
      boxShadow: designTokens.shadows.sm,
      cursor: 'pointer',
    },
  }
  const paddingStyles = {
    none: { padding: '0' },
    sm: { padding: designTokens.spacing[4] },
    md: { padding: designTokens.spacing[6] },
    lg: { padding: designTokens.spacing[8] },
  }
  const cardStyles: React.CSSProperties = {
    ...baseStyles,
    ...variantStyles[variant],
    ...paddingStyles[padding],
  }
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hover || variant === 'interactive') {
      e.currentTarget.style.transform = 'translateY(-2px)'
      e.currentTarget.style.boxShadow = designTokens.shadows.xl
    }
  }
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hover || variant === 'interactive') {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = variantStyles[variant].boxShadow
    }
  }
  return (
    <div
      style={cardStyles}
      className={className}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}
export default Card