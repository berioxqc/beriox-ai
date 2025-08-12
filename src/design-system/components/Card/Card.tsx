import React from 'apos;react'apos;;
import { designTokens } from 'apos;../../tokens'apos;;

export interface CardProps {
  variant?: 'apos;default'apos; | 'apos;elevated'apos; | 'apos;outlined'apos; | 'apos;interactive'apos;;
  padding?: 'apos;none'apos; | 'apos;sm'apos; | 'apos;md'apos; | 'apos;lg'apos;;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  variant = 'apos;default'apos;,
  padding = 'apos;md'apos;,
  children,
  className = 'apos;'apos;,
  style,
  onClick,
  hover = false,
}) => {
  const baseStyles: React.CSSProperties = {
    background: designTokens.colors.background.primary,
    borderRadius: designTokens.borderRadius.lg,
    fontFamily: designTokens.typography.fontFamily,
    transition: 'apos;all 0.2s ease-in-out'apos;,
    ...style,
  };

  const variantStyles = {
    default: {
      border: `1px solid ${designTokens.colors.border.light}`,
      boxShadow: designTokens.shadows.sm,
    },
    elevated: {
      border: 'apos;none'apos;,
      boxShadow: designTokens.shadows.lg,
    },
    outlined: {
      border: `2px solid ${designTokens.colors.border.medium}`,
      boxShadow: 'apos;none'apos;,
    },
    interactive: {
      border: `1px solid ${designTokens.colors.border.light}`,
      boxShadow: designTokens.shadows.sm,
      cursor: 'apos;pointer'apos;,
    },
  };

  const paddingStyles = {
    none: { padding: 'apos;0'apos; },
    sm: { padding: designTokens.spacing[4] },
    md: { padding: designTokens.spacing[6] },
    lg: { padding: designTokens.spacing[8] },
  };

  const cardStyles: React.CSSProperties = {
    ...baseStyles,
    ...variantStyles[variant],
    ...paddingStyles[padding],
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hover || variant === 'apos;interactive'apos;) {
      e.currentTarget.style.transform = 'apos;translateY(-2px)'apos;;
      e.currentTarget.style.boxShadow = designTokens.shadows.xl;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hover || variant === 'apos;interactive'apos;) {
      e.currentTarget.style.transform = 'apos;translateY(0)'apos;;
      e.currentTarget.style.boxShadow = variantStyles[variant].boxShadow;
    }
  };

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
  );
};

export default Card;
