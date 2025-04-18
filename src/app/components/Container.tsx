import React, { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string;
  className?: string;
}

export const Container = ({ 
  children, 
  maxWidth = 'lg', 
  className = '' 
}: ContainerProps) => {
  const getMaxWidth = () => {
    switch (maxWidth) {
      case 'xs':
        return 'max-w-xs';
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-lg';
      case 'xl':
        return 'max-w-xl';
      default:
        return maxWidth;
    }
  };

  return (
    <div className={`mx-auto w-full px-4 ${getMaxWidth()} ${className}`}>
      {children}
    </div>
  );
};

export default Container; 