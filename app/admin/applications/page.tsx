'use client';

import { useState, useEffect } from 'react';
import { Application, AdminInfo } from './types';
import { formatDate, exportToCsv } from './utils';
import BlacklistModal from '../components/BlacklistModal';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'reviewed'>('pending');
  const [processing, setProcessing] = useState(false);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [blacklistingId, setBlacklistingId] = useState<number | null>(null);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [blacklistTarget, setBlacklistTarget] = useState<Application | null>(null);

  useEffect(() => {
    // 从后端检查登录状态
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/api/admin/check', {
          credentials: 'include'
        });
        const result = await response.json();
        if (result.success && result.admin) {
          setAdminInfo({
            user: result.admin.username,
            adminId: result.admin.adminId,
            isOwner: result.admin.isOwner
          });
        } else {
          // 未登录，重定向回主页
          window.location.href = '/';
        }
      } catch (error) {
        console.error('检查登录状态失败:', error);
        // 检查失败，重定向回主页
        window.location.href = '/';
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (adminInfo) {
      fetchApplications();
    }
  }, [activeTab, adminInfo]);

  useEffect(() => {
    if (processing) {
      const timeout = setTimeout(() => {
        console.log('安全重置processing');
        setProcessing(false);
      }, 15000);
      return () => clearTimeout(timeout);
    }
  }, [processing]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const url = activeTab === 'pending' 
        ? '/api/applications?status=pending'
        : '/api/applications';
      const response = await fetch(url, {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        setApplications(result.data);
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error('获取申请列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === applications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(applications.map(app => app.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBatchApprove = async () => {
    if (selectedIds.size === 0) {
      alert('请先选择要通过的申请');
      return;
    }
    if (!confirm(`确定要批量通过 ${selectedIds.size} 个申请吗？`)) return;
    
    setProcessing(true);
    try {
      for (const id of selectedIds) {
        await fetch(`/api/applications/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'approved',
            reviewer: adminInfo?.user,
            reviewerId: adminInfo?.adminId,
            note: '批量通过'
          })
        });
      }
      alert('批量通过成功');
      fetchApplications();
    } catch (error) {
      alert('操作失败，请重试');
    } finally {
      setProcessing(false);
    }
  };

  const handleBatchReject = async () => {
    if (selectedIds.size === 0) {
      alert('请先选择要拒绝的申请');
      return;
    }
    if (!confirm(`确定要批量拒绝 ${selectedIds.size} 个申请吗？`)) return;
    
    setProcessing(true);
    try {
      for (const id of selectedIds) {
        await fetch(`/api/applications/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'rejected',
            reviewer: adminInfo?.user,
            reviewerId: adminInfo?.adminId,
            note: '批量拒绝'
          })
        });
      }
      alert('批量拒绝成功');
      fetchApplications();
    } catch (error) {
      alert('操作失败，请重试');
    } finally {
      setProcessing(false);
    }
  };

  const handleExport = () => {
    const exportData = selectedIds.size > 0 
      ? applications.filter(app => selectedIds.has(app.id))
      : applications;
    
    exportToCsv(exportData, `白名单申请_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`);
  };



  const handleAddToBlacklistClick = (app: Application) => {
    setBlacklistTarget(app);
    setShowBlacklistModal(true);
  };

  const handleBlacklistConfirm = async (reason: string, duration: number | null, isPermanent: boolean) => {
    if (!blacklistTarget) return;
    
    const app = blacklistTarget;
    setShowBlacklistModal(false);
    setBlacklistingId(app.id);
    
    try {
      const response = await fetch('/api/blacklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minecraft_id: app.minecraft_id,
          ip_address: app.ip_address,
          reason: reason,
          banned_by: adminInfo?.user || '管理员',
          banned_by_id: adminInfo?.adminId,
          application_id: app.id,
          duration: duration,
          is_permanent: isPermanent
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        const durationText = isPermanent ? '永久' : duration ? `${Math.round(duration / 1440)}天` : '永久';
        alert(`已拉入黑名单并封禁IP\n\n游戏ID：${app.minecraft_id}\nIP地址：${app.ip_address || '未知'}\n封禁原因：${reason}\n封禁时长：${durationText}\n\n服务器封禁结果：${result.banResult?.message || '未执行'}`);
        fetchApplications();
      } else {
        alert(result.message || '操作失败');
      }
    } catch (error) {
      console.error('拉黑操作失败:', error);
      alert('操作失败，请重试');
    } finally {
      setBlacklistingId(null);
      setBlacklistTarget(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-transparent text-white rounded text-xs" style={{border: '1px solid rgba(93, 122, 156, 0.8)'}}>{status === 'pending' ? '待审核' : status === 'approved' ? '已通过' : '已拒绝'}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">白名单审核</h1>
          <p className="text-mc-stone-light text-sm mt-1">审核玩家的白名单申请</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-sm font-medium transition-all ${
              activeTab === 'pending'
                ? 'text-white'
                : 'text-mc-stone-light hover:bg-white/10 hover:text-white'
            }`}
            style={{border: '1px solid rgba(138, 158, 255, 0.9)', backgroundColor: activeTab === 'pending' ? 'rgba(138, 158, 255, 0.9)' : 'transparent'}}>
            待审核
          </button>
          <button
            onClick={() => setActiveTab('reviewed')}
            className={`px-4 py-2 rounded-sm font-medium transition-all ${
              activeTab === 'reviewed'
                ? 'text-white'
                : 'text-mc-stone-light hover:bg-white/10 hover:text-white'
            }`}
            style={{border: '1px solid rgba(138, 158, 255, 0.9)', backgroundColor: activeTab === 'reviewed' ? 'rgba(138, 158, 255, 0.9)' : 'transparent'}}>
            我的审核记录
          </button>
        </div>
      </div>

      {applications.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-sm font-medium hover:bg-white/10 text-white transition-all flex items-center gap-2"
            style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}>
             {selectedIds.size > 0 ? `选中导出 (${selectedIds.size})` : '导出全部'}
          </button>
          {activeTab === 'pending' && (
            <>
              <button
                onClick={handleBatchApprove}
                disabled={selectedIds.size === 0 || processing}
                className={`px-4 py-2 rounded-sm font-medium hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all flex items-center gap-2`}
                style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}>
                {processing ? '处理中...' : <> 选中通过 {selectedIds.size > 0 && `(${selectedIds.size})`}</>}
              </button>
              <button
                onClick={handleBatchReject}
                disabled={selectedIds.size === 0 || processing}
                className={`px-4 py-2 rounded-sm font-medium hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all flex items-center gap-2`}
                style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}>
                {processing ? '处理中...' : <> 选中拒绝 {selectedIds.size > 0 && `(${selectedIds.size})`}</>}
              </button>
            </>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-4xl animate-bounce"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-sm p-12 text-center" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
          <p className="text-mc-stone-light text-lg">暂无申请记录</p>
        </div>
      ) : (
        <div className="rounded-sm overflow-hidden" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
          <table className="w-full">
            <thead className="bg-transparent">
              <tr>
                {activeTab === 'pending' && (
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === applications.length && applications.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded bg-transparent text-white focus:ring-white/50"
                    style={{border: '1px solid rgba(93, 122, 156, 0.8)'}}
                    />
                  </th>
                )}
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium text-sm">游戏ID</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium text-sm">年龄</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium text-sm">联系方式</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium text-sm">状态</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium text-sm">操作</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-white/5 transition-colors" style={{borderBottom: '1px solid rgba(93, 122, 156, 0.5)'}}>
                  {activeTab === 'pending' && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(app.id)}
                        onChange={() => toggleSelect(app.id)}
                        className="w-4 h-4 rounded bg-transparent text-white focus:ring-white/50"
                    style={{border: '1px solid rgba(93, 122, 156, 0.8)'}}
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 text-white font-medium">{app.minecraft_id}</td>
                  <td className="px-4 py-3 text-mc-stone-light">{app.age || '-'}</td>
                  <td className="px-4 py-3 text-mc-stone-light">{app.contact}</td>
                  <td className="px-4 py-3">{getStatusBadge(app.status)}</td>
                  <td className="px-4 py-3">
                    {app.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            window.location.href = `/admin/applications/${app.id}`;
                          }}
                          className="px-3 py-1.5 hover:bg-white/30 text-white rounded-sm transition-all text-sm"
                          style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}>
                          审核
                        </button>
                        <button
                          onClick={() => handleAddToBlacklistClick(app)}
                          disabled={blacklistingId === app.id}
                          className="px-3 py-1.5 hover:bg-white/30 disabled:opacity-50 text-white rounded-sm transition-all text-sm"
                          style={{border: '1px solid rgba(93, 122, 156, 0.8)', backgroundColor: 'rgba(93, 122, 156, 0.5)'}}
                        >
                          {blacklistingId === app.id ? '处理中...' : '拉黑'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}



      {showBlacklistModal && blacklistTarget && (
        <BlacklistModal
          isOpen={showBlacklistModal}
          onClose={() => {
            setShowBlacklistModal(false);
            setBlacklistTarget(null);
          }}
          onConfirm={handleBlacklistConfirm}
          minecraftId={blacklistTarget.minecraft_id}
          ipAddress={blacklistTarget.ip_address}
          loading={blacklistingId !== null}
        />
      )}
    </div>
  );
}
