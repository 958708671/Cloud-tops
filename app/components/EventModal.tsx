'use client';

import React, { useEffect } from 'react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
}

const EventModal = ({ isOpen, onClose, event }: EventModalProps) => {
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

  if (!isOpen || !event) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-mc-gold/20 text-mc-gold';
      case 'ongoing': return 'bg-mc-green-light/20 text-mc-green-light';
      case 'ended': return 'bg-mc-stone-dark/20 text-mc-stone';
      default: return 'bg-mc-green/20 text-mc-green-light';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return '即将开始';
      case 'ongoing': return '进行中';
      case 'ended': return '已结束';
      default: return '未知';
    }
  };

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
          <h3 className="text-2xl font-bold text-white">{event.title}</h3>
          <button 
            onClick={onClose}
            className="text-mc-stone hover:text-white text-2xl font-bold"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center gap-4 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
              {getStatusText(event.status)}
            </span>
            <span className="text-sm text-mc-stone">
              {new Date(event.start_time).toLocaleDateString('zh-CN')} - {new Date(event.end_time).toLocaleDateString('zh-CN')}
            </span>
          </div>
          <div className="bg-mc-stone-dark/70 rounded-sm p-4 md:p-6 border border-mc-stone-dark mb-4">
            <p className="text-mc-stone-light leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>
          {event.rewards && (
            <div className="bg-mc-gold/10 rounded-sm p-4 border border-yellow-500/30">
              <h4 className="text-mc-gold font-semibold mb-2 flex items-center gap-2"><img src="/images/ender_chest.png" alt="奖励" className="w-6 h-6 pixelated" />活动奖励</h4>
              <p className="text-yellow-300/80 text-sm">{event.rewards}</p>
            </div>
          )}
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

export default EventModal;