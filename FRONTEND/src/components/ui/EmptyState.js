import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import Button from './Button';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  buttonText, 
  onButtonClick 
}) => {
  return (
    <div className="text-center py-12">
      {Icon && (
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          <Icon className="w-full h-full" />
        </div>
      )}
      
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        {title}
      </h3>
      
      <p className="mt-1 text-sm text-gray-500">
        {description}
      </p>
      
      {buttonText && onButtonClick && (
        <div className="mt-6">
          <Button
            variant="primary"
            onClick={onButtonClick}
            className="inline-flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            {buttonText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;