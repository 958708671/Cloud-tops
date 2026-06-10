'use client';

import React, { useEffect } from 'react';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: any;
}

const AnnouncementModal = ({ isOpen, onClose, announcement }: AnnouncementModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !announcement) return null;

  return (
    <div 
      className="fixed inset-0 bg-mc-dirt/90 flex items-center justify-center z-9999 overflow-y-auto py-8" 
      onClick={onClose}
    >
      <div 
        className="bg-linear-to-br from-mc-stone-dark to-mc-dirt p-6 md:p-8 rounded-sm border-2 border-mc-stone-dark shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col border-pixel" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 flex justify-between items-center mb-6 pb-4 border-b border-mc-stone-dark">
          <h3 className="text-2xl font-bold text-white">{announcement.title}</h3>
          <button 
            onClick={onClose}
            className="text-mc-stone hover:text-white text-2xl font-bold"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center gap-4 mb-4 text-sm text-mc-stone">
            <span>发布时间: {new Date(announcement.created_at).toLocaleDateString('zh-CN')}</span>
            {announcement.is_important && (
              <span className="bg-mc-red/20 text-mc-red px-2 py-1 rounded text-xs">重要</span>
            )}
          </div>
          <div className="bg-mc-stone-dark/70 rounded-sm p-4 md:p-6 border border-mc-stone-dark">
            <p className="text-mc-stone-light leading-relaxed whitespace-pre-wrap">{announcement.content}</p>
          </div>
        </div>
        
        <div className="shrink-0 mt-6">
          <button 
            onClick={onClose}
            className="w-full bg-mc-green hover:bg-mc-green-dark text-white font-semibold py-3 px-6 rounded-sm transition duration-300 btn-mc"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;