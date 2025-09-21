import React from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

const Alert = ({ type = 'info', message, onClose, className = '' }) => {
  const types = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircleIcon,
      iconColor: 'text-green-400'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: XCircleIcon,
      iconColor: 'text-red-400'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-yellow-400'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: InformationCircleIcon,
      iconColor: 'text-blue-400'
    }
  };

  const config = types[type];
  const Icon = config.icon;

  if (!message) return null;

  return (
    <div className={`${config.bg} ${config.border} border rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <Icon className={`w-5 h-5 ${config.iconColor} mr-3 flex-shrink-0 mt-0.5`} />
        <div className={`${config.text} text-sm flex-1`}>
          {message}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-auto -mx-1.5 -my-1.5 ${config.text} rounded-lg focus:ring-2 p-1.5 hover:bg-opacity-20 inline-flex h-8 w-8`}
          >
            <span className="sr-only">Cerrar</span>
            <XCircleIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;