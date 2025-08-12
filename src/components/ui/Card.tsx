import React from 'react'
interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg' | 'xl'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  border?: boolean
  hover?: boolean
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  border = true,
  hover = false
}) => {
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  }
  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  }
  const borderStyles = border ? 'border border-gray-200' : ''
  const hoverStyles = hover ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-200' : ''
  const styles = `bg-white rounded-lg ${paddingStyles[padding]} ${shadowStyles[shadow]} ${borderStyles} ${hoverStyles} ${className}`
  return (
    <div className={styles}>
      {children}
    </div>
  )
}
export default Card