'use client';
import React, { useState, useEffect } from 'react';


interface LoginRecord {
  id: number;
  admin_id: number;
  admin_name: string;
  admin_qq: string;
  ip_address: string;
  created_at: string;
}

interface Admin {
  id: number;
  username: string;
  display_name: string;
  qq: string;
  is_owner: boolean;
  last_login?: string;
  last_ip?: string;
}

export default function AdminMonitorPage() {
  const [loginRecords, setLoginRecords] = useState<LoginRecord[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminInfo');
    if (savedAdmin) {
      try {
        const info = JSON.parse(savedAdmin);
        if (!info.isOwner) {
          alert('权限不足，只有服主可以访问此页面');
          window.location.href = '/admin';
        }
      } catch (e) {
        window.location.href = '/admin';
      }
    } else {
      window.location.href = '/admin';
    }

    fetchLoginRecords();
    fetchAdmins();
  }, []);

  const fetchLoginRecords = async () => {
    try {
      const response = await fetch('/api/admin/logs?action=login');
      const result = await response.json();
      if (result.success) {
        setLoginRecords(result.data);
      }
    } catch (error) {
      console.error('获取登录记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admin/list');
      const result = await response.json();
      if (result.success) {
        setAdmins(result.data);
      }
    } catch (error) {
      console.error('获取管理员列表失败:', error);
    }
  };

  const getAdminLastLogin = (adminId: number) => {
    const records = loginRecords.filter(r => r.admin_id === adminId);
    return records[0] || null;
  };

  if (loading) {
    return (
      <div className="text-white flex items-center justify-center">
        <div className="text-2xl">加载中...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">管理员监控</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">管理员列表</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {admins.map((admin) => {
            const lastLogin = getAdminLastLogin(admin.id);
            return (
              <div key={admin.id} className="rounded-sm p-5" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
                <div className="flex items-start space-x-4">
                  <img
                    src={`https://q.qlogo.cn/g?b=qq&nk=${admin.qq}&s=100`}
                    alt={admin.display_name}
                    className="w-14 h-14 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-white font-medium text-lg">
                        {admin.display_name || admin.username}
                      </span>
                      <span className="text-mc-stone-light text-sm">ID: {admin.username}</span>
                      {admin.is_owner && (
                        <span className="px-2 py-0.5 bg-mc-gold text-yellow-400 text-xs rounded">
                          服主
                        </span>
                      )}
                    </div>
                    <div className="text-mc-stone-light text-sm mb-3">QQ: {admin.qq}</div>
                    
                    <div className="border-t pt-3 space-y-2" style={{borderColor: 'rgba(30, 40, 60, 0.7)'}}>
                      <div className="flex items-center text-sm">
                        <span className="text-mc-stone-dark w-16">最后登录</span>
                        <span className="text-mc-stone-light">
                          {lastLogin ? new Date(lastLogin.created_at).toLocaleString('zh-CN', { hour12: false }) : '从未登录'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-mc-stone-dark w-16">IP地址</span>
                        <span className="text-mc-stone-light font-mono">
                          {lastLogin?.ip_address || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-sm overflow-hidden" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
        <div className="p-4 border-b" style={{borderColor: 'rgba(30, 40, 60, 0.7)'}}>
          <h2 className="text-xl font-semibold text-white">登录记录</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-mc-stone-light text-sm font-medium">管理员</th>
                <th className="px-4 py-3 text-left text-mc-stone-light text-sm font-medium">登录时间</th>
                <th className="px-4 py-3 text-left text-mc-stone-light text-sm font-medium">IP地址</th>
                <th className="px-4 py-3 text-left text-mc-stone-light text-sm font-medium">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{borderColor: 'rgba(30, 40, 60, 0.7)'}}>
              {loginRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-mc-stone-light">
                    暂无登录记录
                  </td>
                </tr>
              ) : (
                loginRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={`https://q.qlogo.cn/g?b=qq&nk=${record.admin_qq}&s=40`}
                          alt={record.admin_name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                        <span className="text-white">{record.admin_name}</span>
                        <span className="text-mc-stone-dark text-xs ml-2">ID: {record.admin_name}</span>
                      </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-mc-stone-light text-sm">
                      {new Date(record.created_at).toLocaleString('zh-CN', { hour12: false })}
                    </td>
                    <td className="px-4 py-3 text-mc-stone-light text-sm font-mono">
                      {record.ip_address || 'unknown'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                        成功
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      

    </div>
  );
}
