import React from 'apos;react'apos;;

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'apos;sm'apos; | 'apos;md'apos; | 'apos;lg'apos; | 'apos;xl'apos;;
  shadow?: 'apos;none'apos; | 'apos;sm'apos; | 'apos;md'apos; | 'apos;lg'apos;;
  border?: boolean;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = 'apos;'apos;,
  padding = 'apos;md'apos;,
  shadow = 'apos;md'apos;,
  border = true,
  hover = false
}) => {
  const paddingStyles = {
    sm: 'apos;p-4'apos;,
    md: 'apos;p-6'apos;,
    lg: 'apos;p-8'apos;,
    xl: 'apos;p-10'apos;
  };
  
  const shadowStyles = {
    none: 'apos;'apos;,
    sm: 'apos;shadow-sm'apos;,
    md: 'apos;shadow-md'apos;,
    lg: 'apos;shadow-lg'apos;
  };
  
  const borderStyles = border ? 'apos;border border-gray-200'apos; : 'apos;'apos;;
  const hoverStyles = hover ? 'apos;hover:shadow-lg hover:-translate-y-1 transition-all duration-200'apos; : 'apos;'apos;;
  
  const styles = `bg-white rounded-lg ${paddingStyles[padding]} ${shadowStyles[shadow]} ${borderStyles} ${hoverStyles} ${className}`;
  
  return (
    <div className={styles}>
      {children}
    </div>
  );
};

export default Card;
