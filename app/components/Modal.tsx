'use client';
import React from 'react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  showCancel = true
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden border border-gray-700">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <div className="p-6">
          <div className="text-gray-300 whitespace-pre-line leading-relaxed">
            {children}
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-900/50 flex gap-3 justify-end border-t border-gray-700">
          {showCancel && (
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-all duration-200 hover:shadow-lg"
            >
              {cancelText}
            </button>
          )}
          {onConfirm && (
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30"
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
