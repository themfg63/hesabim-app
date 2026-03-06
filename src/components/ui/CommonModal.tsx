'use client';

import { IconAlertTriangle, IconInfoCircle, IconCircleCheck, IconX } from '@tabler/icons-react';

export const MODAL_TYPES = {
  ERROR: 'error',
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
} as const;

type ModalType = typeof MODAL_TYPES[keyof typeof MODAL_TYPES];

interface CommonModalProps {
  isOpen: boolean;
  type: ModalType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose: () => void;
  showCancel?: boolean;
}

const CommonModal = ({
  isOpen,
  type,
  title,
  message,
  confirmText = 'Tamam',
  cancelText = 'İptal',
  onConfirm,
  onCancel,
  onClose,
  showCancel = false,
}: CommonModalProps) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case MODAL_TYPES.ERROR:
        return <IconAlertTriangle className="w-12 h-12 text-red-500" strokeWidth={2} />;
      case MODAL_TYPES.WARNING:
        return <IconAlertTriangle className="w-12 h-12 text-yellow-500" strokeWidth={2} />;
      case MODAL_TYPES.SUCCESS:
        return <IconCircleCheck className="w-12 h-12 text-green-500" strokeWidth={2} />;
      case MODAL_TYPES.INFO:
        return <IconInfoCircle className="w-12 h-12 text-blue-500" strokeWidth={2} />;
      default:
        return <IconInfoCircle className="w-12 h-12 text-gray-500" strokeWidth={2} />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case MODAL_TYPES.ERROR:
        return 'from-red-500 to-red-600';
      case MODAL_TYPES.WARNING:
        return 'from-yellow-500 to-yellow-600';
      case MODAL_TYPES.SUCCESS:
        return 'from-green-500 to-green-600';
      case MODAL_TYPES.INFO:
        return 'from-blue-500 to-blue-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 opacity-0"
        style={{
          animation: 'fadeIn 0.3s ease-out forwards'
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 opacity-0 scale-90"
        style={{
          animation: 'fadeInScale 0.3s ease-out forwards'
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          {/* Header */}
          <div className={`bg-linear-to-br ${getColorClasses()} p-6 relative`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <IconX className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="mb-3">{getIcon()}</div>
              <h2 className="text-2xl font-bold text-white">{title}</h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-600 text-center mb-6 whitespace-pre-line">{message}</p>

            {/* Actions */}
            <div className={`flex gap-3 ${showCancel ? 'justify-between' : 'justify-center'}`}>
              {showCancel && onCancel && (
                <button
                  onClick={onCancel}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-300"
                >
                  {cancelText}
                </button>
              )}
              <button
                onClick={onConfirm || onClose}
                className={`${showCancel ? 'flex-1' : 'px-12'} px-6 py-3 bg-linear-to-r ${getColorClasses()} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animations CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default CommonModal;
