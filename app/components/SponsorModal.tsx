'use client';

import React, { useState, useEffect } from 'react';

interface SponsorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SponsorModal = ({ isOpen, onClose }: SponsorModalProps) => {
  const [activeTab, setActiveTab] = useState<'wechat' | 'alipay'>('wechat');
  const [wechatLoaded, setWechatLoaded] = useState(false);
  const [alipayLoaded, setAlipayLoaded] = useState(false);
  
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
  
  if (!isOpen) return null;
  
  const titleColor = 'text-mc-green-light';
  const tabBg = 'bg-mc-stone-dark';
  const tabActiveBg = 'bg-mc-green';
  const tabText = 'text-mc-stone-light';
  const tabTextActive = 'text-white';
  const closeColor = 'text-mc-stone-light hover:text-white';
  const qrTitleColor = 'text-mc-green-dark';
  const qrTextColor = 'text-mc-stone-dark';
  const infoBg = 'bg-mc-stone-dark/60';
  const infoBorder = 'border-mc-stone-dark';
  const infoText = 'text-white';
  
  return (
    <div className="fixed inset-0 bg-mc-dirt/90 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className={`bg-linear-to-br from-mc-stone-dark to-mc-dirt p-6 rounded-sm border-2 border-mc-stone-dark shadow-2xl max-w-md mx-4 border-pixel`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-2xl font-bold ${titleColor}`}>自愿赞助</h3>
          <button 
            onClick={onClose}
            className={`${closeColor} text-2xl font-bold`}
          >
            ✕
          </button>
        </div>
        
        {/* 切换标签 */}
        <div className={`flex mb-6 ${tabBg} rounded-sm p-1`}>
          <button
            onClick={() => setActiveTab('wechat')}
            className={`flex-1 py-3 rounded-md text-center font-semibold transition-colors duration-200 ${
              activeTab === 'wechat' 
                ? `${tabActiveBg} text-white shadow-md` 
                : `${tabText} hover:${tabTextActive}`
            }`}
          >
            微信赞助
          </button>
          <button
            onClick={() => setActiveTab('alipay')}
            className={`flex-1 py-3 rounded-md text-center font-semibold transition-colors duration-200 ${
              activeTab === 'alipay' 
                ? `${tabActiveBg} text-white shadow-md` 
                : `${tabText} hover:${tabTextActive}`
            }`}
          >
            支付宝赞助
          </button>
        </div>
        
        {/* 二维码显示区域 */}
        <div className="bg-white p-4 rounded-sm border border-mc-stone shadow-lg mb-6">
          {activeTab === 'wechat' ? (
            <div className="text-center">
              <p className={`font-semibold mb-3 text-lg ${qrTitleColor}`}>微信收款码</p>
              <div className="flex justify-center">
                <img 
                  src="/images/微信收款码.png" 
                  alt="微信收款码" 
                  className="w-64 h-64 object-contain"
                  loading="lazy"
                  onLoad={() => setWechatLoaded(true)}
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'%3E%3Crect width='256' height='256' fill='%23f0f0f0' rx='12'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='18' text-anchor='middle' fill='%23999' dy='.3em'%3E微信二维码%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
              {!wechatLoaded && (
                <p className="text-sm mt-2 text-mc-stone-dark">正在加载二维码...</p>
              )}
              <p className={`text-sm mt-3 ${qrTextColor}`}>打开微信，扫描上方二维码</p>
            </div>
          ) : (
            <div className="text-center">
              <p className={`font-semibold mb-3 text-lg ${qrTitleColor}`}>支付宝收款码</p>
              <div className="flex justify-center">
                <img 
                  src="/images/支付宝收款码.png" 
                  alt="支付宝收款码" 
                  className="w-64 h-64 object-contain"
                  loading="lazy"
                  onLoad={() => setAlipayLoaded(true)}
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'%3E%3Crect width='256' height='256' fill='%23f0f0f0' rx='12'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='18' text-anchor='middle' fill='%23999' dy='.3em'%3E支付宝二维码%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
              {!alipayLoaded && (
                <p className="text-sm mt-2 text-mc-stone-dark">正在加载二维码...</p>
              )}
              <p className={`text-sm mt-3 ${qrTextColor}`}>打开支付宝，扫描上方二维码</p>
            </div>
          )}
        </div>
        
        <div className={`${infoBg} rounded-sm p-4 border ${infoBorder} mb-6`}>
          <p className={`text-sm text-center ${infoText}`}>
            <span className="font-semibold">重要提示：</span>服务器为公益性质，自愿赞助将用于服务器维护和升级，非常感谢您的支持！
          </p>
        </div>
        
        <div className="flex justify-center">
          <button 
            onClick={onClose}
            className={`bg-mc-green hover:bg-mc-green-dark text-white font-semibold py-3 px-8 rounded-sm transition duration-300 btn-mc`}
          >
            关闭窗口
          </button>
        </div>
      </div>
    </div>
  );
};

export default SponsorModal;