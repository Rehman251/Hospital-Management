"use client";

import { useEffect } from 'react';

// Alert Types
export const ALERT_TYPES = {
  SUCCESS: 'success',
  WARNING: 'warning', 
  ERROR: 'error',
  INFO: 'info'
};

// Main Alert Component
export default function Alert({ 
  type = ALERT_TYPES.INFO, 
  message, 
  duration = 5000, 
  onClose,
  isVisible = true 
}) {
  useEffect(() => {
    if (duration && isVisible) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, isVisible, onClose]);

  if (!isVisible) return null;

  const alertConfig = {
    [ALERT_TYPES.SUCCESS]: {
      gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)', // Your theme blue
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Success'
    },
    [ALERT_TYPES.WARNING]: {
      gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)', // Your theme blue
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      title: 'Warning'
    },
    [ALERT_TYPES.ERROR]: {
      gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)', // Your theme blue
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Error'
    },
    [ALERT_TYPES.INFO]: {
      gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%)', // Your theme blue
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Information'
    }
  };

  const config = alertConfig[type];

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div 
        className="flex items-center space-x-3 bg-white rounded-lg shadow-lg p-4 min-w-80 max-w-md border-l-4 border-white/20"
        style={{ background: config.gradient }}
      >
        {/* Icon */}
        <div className="flex-shrink-0 text-white">
          {config.icon}
        </div>
        
        {/* Content */}
        <div className="flex-1 text-white">
          <h3 className="font-semibold text-sm">{config.title}</h3>
          <p className="text-sm opacity-90 mt-1">{message}</p>
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 text-white/80 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Success Alert Shortcut
export function SuccessAlert({ message, duration, onClose, isVisible }) {
  return (
    <Alert
      type={ALERT_TYPES.SUCCESS}
      message={message}
      duration={duration}
      onClose={onClose}
      isVisible={isVisible}
    />
  );
}

// Warning Alert Shortcut
export function WarningAlert({ message, duration, onClose, isVisible }) {
  return (
    <Alert
      type={ALERT_TYPES.WARNING}
      message={message}
      duration={duration}
      onClose={onClose}
      isVisible={isVisible}
    />
  );
}

// Error Alert Shortcut
export function ErrorAlert({ message, duration, onClose, isVisible }) {
  return (
    <Alert
      type={ALERT_TYPES.ERROR}
      message={message}
      duration={duration}
      onClose={onClose}
      isVisible={isVisible}
    />
  );
}

// Info Alert Shortcut
export function InfoAlert({ message, duration, onClose, isVisible }) {
  return (
    <Alert
      type={ALERT_TYPES.INFO}
      message={message}
      duration={duration}
      onClose={onClose}
      isVisible={isVisible}
    />
  );
}