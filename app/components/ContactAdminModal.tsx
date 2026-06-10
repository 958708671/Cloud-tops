'use client';

import React, { useState, useEffect } from 'react';

interface ContactAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactAdminModal = ({ isOpen, onClose }: ContactAdminModalProps) => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchAdmins();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/list');
      const result = await response.json();
      if (result.success && result.data) {
        const filteredAdmins = result.data.filter((admin: any) => admin.show_in_contact !== false);
        setAdmins(filteredAdmins);
      }
    } catch (error) {
      console.error('获取管理员列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-mc-dirt/90 flex items-center justify-center z-9999 overflow-y-auto py-8" 
      onClick={onClose}
    >
      <div 
        className="bg-linear-to-br from-mc-stone-dark to-mc-dirt p-6 md:p-8 rounded-sm border-2 border-mc-stone-dark shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col border-pixel" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 flex justify-between items-center mb-6 pb-4 border-b border-mc-stone-dark">
          <h3 className="text-2xl md:text-3xl font-bold text-mc-green-light">联系管理团队</h3>
          <button 
            onClick={onClose}
            className="text-mc-stone-light hover:text-white text-2xl font-bold"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mc-green"></div>
            </div>
          ) : (
            <div className="bg-white rounded-sm shadow-lg border border-mc-green overflow-hidden">
              {/* 表头 */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-mc-stone-dark/50 border-b border-mc-green text-center">
                <div className="text-mc-green-dark font-semibold">头像</div>
                <div className="text-mc-green-dark font-semibold">标签</div>
                <div className="text-mc-green-dark font-semibold">QQ号</div>
                <div className="text-mc-green-dark font-semibold">复制</div>
              </div>
              
              {/* 数据行 */}
              {admins.map((admin) => (
                <div key={admin.id} className="grid grid-cols-4 gap-4 p-4 border-b border-mc-stone-dark last:border-b-0 items-center hover:bg-mc-stone-dark/50 transition-colors text-center">
                  {/* 头像列 */}
                  <div className="flex justify-center">
                    <div className="w-14 h-14 bg-white border-2 border-mc-stone-dark rounded-full flex items-center justify-center overflow-hidden">
                      <img
                        src={`https://q.qlogo.cn/g?b=qq&nk=${admin.qq}&s=100`}
                        alt={`${admin.is_owner ? '服主' : '管理员'}的头像`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = document.createElement('img');
                            fallback.src = admin.is_owner ? '/images/diamond_block.png' : '/images/player_head.png';
                            fallback.alt = admin.is_owner ? '服主' : '管理员';
                            fallback.className = 'w-10 h-10 pixelated';
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* 标签列 */}
                  <div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${admin.is_owner ? 'bg-mc-gold/20 text-mc-gold' : 'bg-mc-green/20 text-mc-green-dark'}`}>
                      {admin.is_owner ? '服主' : '管理员'}
                    </span>
                    <div className="text-mc-stone-dark text-sm mt-1">{admin.username}</div>
                  </div>
                  
                  {/* QQ号列 */}
                  <div className="text-mc-green-dark font-medium">
                    {admin.qq}
                  </div>
                  
                  {/* 复制按钮列 */}
                  <div>
                    <button
                      onClick={() => navigator.clipboard.writeText(admin.qq)}
                      className="bg-mc-green hover:bg-mc-green-dark text-white font-semibold py-2 px-4 rounded-sm transition-colors text-sm"
                    >
                      复制QQ号
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="shrink-0 mt-6 pt-4 border-t border-mc-stone-dark">
          <div className="bg-mc-stone-dark/50 rounded-sm p-4 border border-mc-green mb-4">
            <h4 className="font-semibold text-white mb-2">使用说明：</h4>
            <ul className="text-mc-stone-light space-y-1 text-sm">
              <li>• 点击"复制QQ号"按钮可以复制对应的QQ号</li>
              <li>• 添加好友时请备注"CloudTops服务器"以便管理员识别</li>
              <li>• 服主和管理员会在24小时内处理好友申请</li>
              <li>• 紧急问题请直接联系服主</li>
            </ul>
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={onClose}
              className="bg-mc-green hover:bg-mc-green-dark text-white font-semibold py-3 px-8 rounded-sm transition duration-300 btn-mc"
            >
              关闭窗口
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactAdminModal;