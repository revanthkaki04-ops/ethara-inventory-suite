import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function Notification({ notification, onClose }) {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto close after 5s
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification || !notification.message) return null;

  const { message, type } = notification;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="noti-icon success" size={20} />;
      case 'error':
        return <XCircle className="noti-icon error" size={20} />;
      case 'warning':
        return <AlertTriangle className="noti-icon warning" size={20} />;
      default:
        return <Info className="noti-icon info" size={20} />;
    }
  };

  return (
    <div className={`notification-toast ${type || 'info'} animate-slide-up`}>
      <div className="noti-body">
        {getIcon()}
        <span className="noti-message">{message}</span>
      </div>
      <button className="noti-close-btn" onClick={onClose} aria-label="Close Notification">
        <X size={14} />
      </button>
    </div>
  );
}
