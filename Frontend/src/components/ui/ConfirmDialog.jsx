import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

const ConfirmDialogContext = createContext();

export const useConfirmDialog = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirmDialog must be used within a ConfirmDialogProvider');
  }
  return context;
};

const ConfirmDialog = ({ dialog, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && dialog.allowBackdropClose !== false) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (dialog.onConfirm) {
      dialog.onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (dialog.onCancel) {
      dialog.onCancel();
    }
    onClose();
  };

  const getIcon = () => {
    switch (dialog.type) {
      case 'danger':
        return '⚠️';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      default:
        return '❓';
    }
  };

  const getTypeStyles = () => {
    switch (dialog.type) {
      case 'danger':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const getButtonStyles = () => {
    switch (dialog.type) {
      case 'danger':
        return {
          confirm: 'bg-red-600 hover:bg-red-700 text-white',
          cancel: 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        };
      case 'warning':
        return {
          confirm: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          cancel: 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        };
      case 'info':
        return {
          confirm: 'bg-blue-600 hover:bg-blue-700 text-white',
          cancel: 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        };
      case 'success':
        return {
          confirm: 'bg-green-600 hover:bg-green-700 text-white',
          cancel: 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        };
      default:
        return {
          confirm: 'bg-blue-600 hover:bg-blue-700 text-white',
          cancel: 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        };
    }
  };

  const buttonStyles = getButtonStyles();

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      {/* Dialog */}
      <div
        className={`relative bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all duration-300 ${
          isVisible ? 'scale-100' : 'scale-95'
        } ${getTypeStyles()}`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">{getIcon()}</span>
            <h3 className="text-lg font-semibold text-gray-900">
              {dialog.title || 'Confirm Action'}
            </h3>
          </div>
          
          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-700">{dialog.message}</p>
            {dialog.details && (
              <p className="text-sm text-gray-500 mt-2">{dialog.details}</p>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex space-x-3 justify-end">
            <button
              onClick={handleCancel}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${buttonStyles.cancel}`}
            >
              {dialog.cancelText || 'Cancel'}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${buttonStyles.confirm}`}
            >
              {dialog.confirmText || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const ConfirmDialogProvider = ({ children }) => {
  const [dialogs, setDialogs] = useState([]);

  const showConfirm = useCallback((options) => {
    const id = Date.now() + Math.random();
    const dialog = {
      id,
      type: 'info',
      allowBackdropClose: true,
      ...options,
    };
    
    setDialogs(prev => [...prev, dialog]);
    return id;
  }, []);

  const closeDialog = useCallback((id) => {
    setDialogs(prev => prev.filter(dialog => dialog.id !== id));
  }, []);

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      const dialogId = showConfirm({
        message,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
        ...options,
      });
    });
  }, [showConfirm]);

  const confirmDelete = useCallback((itemName, options = {}) => {
    return confirm(
      `Are you sure you want to delete ${itemName}?`,
      {
        type: 'danger',
        title: 'Delete Confirmation',
        confirmText: 'Delete',
        ...options,
      }
    );
  }, [confirm]);

  const confirmAction = useCallback((action, options = {}) => {
    return confirm(
      `Are you sure you want to ${action}?`,
      {
        type: 'warning',
        title: 'Confirm Action',
        ...options,
      }
    );
  }, [confirm]);

  const value = {
    showConfirm,
    closeDialog,
    confirm,
    confirmDelete,
    confirmAction,
  };

  return (
    <ConfirmDialogContext.Provider value={value}>
      {children}
      {dialogs.map((dialog) => (
        <ConfirmDialog key={dialog.id} dialog={dialog} onClose={() => closeDialog(dialog.id)} />
      ))}
    </ConfirmDialogContext.Provider>
  );
};

// Hook for easy confirm dialog usage
export const useConfirm = () => {
  const confirmDialog = useConfirmDialog();
  
  return {
    confirm: confirmDialog.confirm,
    confirmDelete: confirmDialog.confirmDelete,
    confirmAction: confirmDialog.confirmAction,
  };
};
