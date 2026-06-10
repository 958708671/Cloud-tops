'use client';

import { useState, useEffect } from 'react';

interface Complaint {
  id: number;
  reporter_name: string;
  reporter_qq: string;
  target_player: string;
  violation_time: string;
  violation_type: string;
  description: string;
  evidence: string;
  status: 'pending' | 'processing' | 'resolved' | 'rejected';
  created_at: string;
  handler?: string;
  handler_id?: number;
  resolution_note?: string;
  resolution_images?: string;
  investigation_note?: string;
}

interface AdminInfo {
  id: number;
  user: string;
  isOwner: boolean;
}

export default function ComplaintsSupervisePage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [restartNote, setRestartNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [adminInfo, setAdminInfo] = useState<AdminInfo>({ id: 0, user: '', isOwner: false });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [note, setNote] = useState('');
  const [imageUrls, setImageUrls] = useState('');
  const [localStatus, setLocalStatus] = useState<'pending' | 'processing' | 'resolved' | 'rejected'>('pending');

  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminInfo');
    if (savedAdmin) {
      try {
        const info = JSON.parse(savedAdmin);
        setAdminInfo({ id: info.adminId, user: info.user, isOwner: info.isOwner || false });
      } catch (e) {
        window.location.href = '/admin';
      }
    } else {
      window.location.href = '/admin';
    }
  }, []);

  useEffect(() => {
    if (adminInfo.user) {
      fetchComplaints();
    }
  }, [statusFilter, adminInfo.user]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/complaints?isOwner=true&status=${statusFilter}`);
      const result = await response.json();
      if (result.success) {
        // 检查并更新处理人为"服主"的记录
        const updatedComplaints = result.data.map((complaint: any) => {
          if (complaint.handler === '服主' && adminInfo.user) {
            // 如果处理人是"服主"且当前管理员用户名不为空，将其改为当前管理员的用户名
            return {
              ...complaint,
              handler: adminInfo.user
            };
          }
          return complaint;
        });
        setComplaints(updatedComplaints);
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error('获取投诉列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === complaints.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(complaints.map(c => c.id)));
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

  const handleBatchRestart = async () => {
    if (selectedIds.size === 0) {
      alert('请先选择要重启的案件');
      return;
    }
    if (!confirm(`确定要批量重启 ${selectedIds.size} 个案件吗？`)) return;
    
    setProcessing(true);
    try {
      for (const id of selectedIds) {
        await fetch(`/api/complaints/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'restart',
            note: '批量重启',
            adminId: adminInfo?.id,
            adminName: adminInfo?.user
          })
        });
      }
      alert('批量重启成功');
      fetchComplaints();
    } catch (error) {
      alert('操作失败，请重试');
    } finally {
      setProcessing(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) {
      alert('请先选择要删除的案件');
      return;
    }
    if (!confirm(`确定要批量删除 ${selectedIds.size} 个案件吗？\n此操作不可恢复！`)) return;
    
    setProcessing(true);
    try {
      for (const id of selectedIds) {
        await fetch(`/api/complaints/${id}`, {
          method: 'DELETE'
        });
      }
      alert('批量删除成功');
      setSelectedIds(new Set());
      fetchComplaints();
    } catch (error) {
      alert('删除失败，请重试');
    } finally {
      setProcessing(false);
    }
  };

  const handleExport = () => {
    const exportData = selectedIds.size > 0 
      ? complaints.filter(c => selectedIds.has(c.id))
      : complaints;
    
    if (exportData.length === 0) {
      alert('没有可导出的数据');
      return;
    }
    
    const csvContent = [
      ['ID', '举报人', '联系方式', '被举报玩家', '违规类型', '描述', '状态', '处理人', '处理结果', '时间'].join(','),
      ...exportData.map(c => [
        c.id,
        c.reporter_name,
        c.reporter_qq,
        c.target_player,
        c.violation_type,
        (c.description || '').replace(/"/g, '""'),
        c.status === 'pending' ? '待处理' : c.status === 'processing' ? '处理中' : c.status === 'resolved' ? '已解决' : '已驳回',
        c.handler || '-',
        (c.resolution_note || '').replace(/"/g, '""'),
        formatDate(c.created_at)
      ].map(field => `"${field}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `投诉监管_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
    link.click();
  };

  const updateStatus = async (id: number, status: string, note?: string, images?: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          adminId: adminInfo.id,
          adminName: adminInfo.user,
          resolutionNote: note,
          resolutionImages: images
        }),
      });

      const result = await response.json();
      if (result.success) {
        fetchComplaints();
        if (selectedComplaint?.id === id) {
          setSelectedComplaint({ 
            ...selectedComplaint, 
            status: status as any,
            handler: adminInfo.user,
            handler_id: adminInfo.id,
            resolution_note: note,
            resolution_images: images
          });
          setLocalStatus(status as any);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('更新状态失败:', error);
      return false;
    }
  };

  const handleRestart = async (complaintId: number) => {
    if (!restartNote.trim()) {
      alert('请填写重启原因');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restart',
          note: restartNote,
          adminId: adminInfo?.id,
          adminName: adminInfo?.user
        })
      });

      const result = await response.json();
      if (result.success) {
        setSelectedComplaint(null);
        setRestartNote('');
        fetchComplaints();
      } else {
        alert(result.message || '重启失败');
      }
    } catch (error) {
      alert('重启失败，请重试');
    } finally {
      setProcessing(false);
    }
  };

  const handleResolve = async () => {
    if (!note.trim()) {
      alert('请填写处理说明');
      return;
    }
    setProcessing(true);
    try {
      const success = await updateStatus(selectedComplaint!.id, 'resolved', note, imageUrls);
      if (success) {
        setShowResolveForm(false);
        setNote('');
        setImageUrls('');
      } else {
        alert('操作失败，请重试');
      }
    } catch (e) {
      alert('操作失败，请重试');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!note.trim()) {
      alert('请填写驳回原因');
      return;
    }
    setProcessing(true);
    try {
      const success = await updateStatus(selectedComplaint!.id, 'rejected', note, imageUrls);
      if (success) {
        setShowRejectForm(false);
        setNote('');
        setImageUrls('');
      } else {
        alert('操作失败，请重试');
      }
    } catch (e) {
      alert('操作失败，请重试');
    } finally {
      setProcessing(false);
    }
  };

  const handleAccept = async () => {
    setProcessing(true);
    try {
      const success = await updateStatus(selectedComplaint!.id, 'processing');
      if (!success) {
        alert('操作失败，请重试');
      }
    } catch (e) {
      alert('操作失败，请重试');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hour}:${minute}`;
  };

  // 格式化违规时间，支持多种格式转换为24小时制
  const formatViolationTime = (timeStr: string | undefined) => {
    if (!timeStr || timeStr === '未填写') return '未填写';
    
    // 如果是 ISO 格式 (包含 T)
    if (timeStr.includes('T')) {
      return formatDate(timeStr);
    }
    
    // 如果是中文格式 (2026年03月08日 23:59)
    const chineseMatch = timeStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s*(\d{1,2}):(\d{2})/);
    if (chineseMatch) {
      const [, year, month, day, hour, minute] = chineseMatch;
      return `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')} ${hour.padStart(2, '0')}:${minute}`;
    }
    
    // 如果是斜杠格式 (2026/03/08 23:59)
    const slashMatch = timeStr.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})\s*(\d{1,2}):(\d{2})/);
    if (slashMatch) {
      const [, year, month, day, hour, minute] = slashMatch;
      return `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')} ${hour.padStart(2, '0')}:${minute}`;
    }
    
    // 如果是横杠格式 (2026-03-08 23:59)
    const dashMatch = timeStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})\s*(\d{1,2}):(\d{2})/);
    if (dashMatch) {
      const [, year, month, day, hour, minute] = dashMatch;
      return `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')} ${hour.padStart(2, '0')}:${minute}`;
    }
    
    // 如果都不匹配，直接返回原值
    return timeStr;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-transparent text-white rounded text-xs" style={{border: '1px solid #5D7A9C'}}>待处理</span>;
      case 'processing':
        return <span className="px-2 py-1 bg-transparent text-white rounded text-xs" style={{border: '1px solid #5D7A9C'}}>处理中</span>;
      case 'resolved':
        return <span className="px-2 py-1 bg-transparent text-white rounded text-xs" style={{border: '1px solid #5D7A9C'}}>已解决</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-transparent text-mc-stone-light rounded text-xs" style={{border: '1px solid #5D7A9C'}}>已驳回</span>;
      default:
        return <span className="px-2 py-1 bg-transparent text-mc-stone-light rounded text-xs" style={{border: '1px solid #5D7A9C'}}>{status}</span>;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'text-white';
      case 'processing': return 'text-white';
      case 'resolved': return 'text-white';
      case 'rejected': return 'text-mc-stone-light';
      default: return 'text-mc-stone-light';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return ' 待处理';
      case 'processing': return ' 处理中';
      case 'resolved': return ' 已解决';
      case 'rejected': return ' 已驳回';
      default: return '未知';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span></span> 投诉监管
        </h1>
        <p className="text-mc-stone-light text-sm mt-1">查看所有投诉案件，可接取和处理案件</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'processing', 'resolved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-sm font-medium transition-all ${
              statusFilter === status
                ? 'text-white'
                : 'text-mc-stone-light hover:bg-white/10 hover:text-white'
            }`}
            style={{border: '1px solid #8A9EFF', backgroundColor: statusFilter === status ? '#8A9EFF' : 'transparent'}}
          >
            {status === 'all' ? '全部' :
             status === 'pending' ? '待处理' :
             status === 'processing' ? '处理中' :
             status === 'resolved' ? '已解决' : '已驳回'}
          </button>
        ))}
      </div>

      {complaints.length > 0 && selectedIds.size > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-sm font-medium hover:bg-white/30 text-white transition-all flex items-center gap-2"
            style={{border: '1px solid #5D7A9C', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
          >
             选中导出 ({selectedIds.size})
          </button>
          <button
            onClick={handleBatchRestart}
            disabled={processing}
            className="px-4 py-2 rounded-sm font-medium hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all flex items-center gap-2"
            style={{border: '1px solid #5D7A9C', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
          >
             选中重启 ({selectedIds.size})
          </button>
          <button
            onClick={handleBatchDelete}
            disabled={processing}
            className="px-4 py-2 rounded-sm font-medium hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all flex items-center gap-2"
            style={{border: '1px solid #5D7A9C', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
          >
             选中删除 ({selectedIds.size})
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-4xl animate-bounce"></div>
        </div>
      ) : complaints.length === 0 ? (
        <div className="rounded-sm p-12 text-center" style={{border: '1px solid #1E283C', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
          <div className="text-6xl mb-4"></div>
          <p className="text-mc-stone-light text-lg">暂无投诉记录</p>
        </div>
      ) : (
        <div className="rounded-sm overflow-hidden" style={{border: '1px solid #1E283C', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
          <table className="w-full">
            <thead className="bg-transparent">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === complaints.length && complaints.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded bg-transparent text-white focus:ring-white/50"
                    style={{border: '1px solid #5D7A9C'}}
                  />
                </th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium text-sm">ID</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium text-sm">举报人</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium text-sm">被举报</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium text-sm">违规类型</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium text-sm">违规时间</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium text-sm">状态</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium text-sm">处理人</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium text-sm">职位</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium text-sm">操作</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-white/5 transition-colors" style={{borderBottom: '1px solid #5D7A9C'}}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(complaint.id)}
                      onChange={() => toggleSelect(complaint.id)}
                      className="w-4 h-4 rounded bg-transparent text-white focus:ring-white/50"
                    style={{border: '1px solid #5D7A9C'}}
                    />
                  </td>
                  <td className="px-4 py-3 text-white font-medium">#{complaint.id}</td>
                  <td className="px-4 py-3 text-mc-stone-light">{complaint.reporter_name}</td>
                  <td className="px-4 py-3 text-mc-stone-light">{complaint.target_player}</td>
                  <td className="px-4 py-3 text-mc-stone-light text-sm">{complaint.violation_type}</td>
                  <td className="px-4 py-3 text-mc-stone-light text-sm">{formatViolationTime(complaint.violation_time)}</td>
                  <td className="px-4 py-3">{getStatusBadge(complaint.status)}</td>
                  <td className="px-4 py-3 text-mc-stone-light">
                    {complaint.handler === '服主' && adminInfo.user ? adminInfo.user : complaint.handler || '-'}
                  </td>
                  <td className="px-4 py-3 text-mc-stone-light">
                    {adminInfo.isOwner ? '服主' : '管理员'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        // 检查并更新处理人为"服主"的记录
                        const updatedComplaint = {
                          ...complaint,
                          handler: complaint.handler === '服主' && adminInfo.user ? adminInfo.user : complaint.handler
                        };
                        setSelectedComplaint(updatedComplaint);
                        setRestartNote('');
                        setLocalStatus(complaint.status);
                        setShowResolveForm(false);
                        setShowRejectForm(false);
                        setNote('');
                        setImageUrls('');
                      }}
                      className="px-3 py-1.5 hover:bg-white/30 text-white rounded-sm transition-all text-sm"
                      style={{border: '1px solid #5D7A9C', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
                    >
                      详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-sm p-6 w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col" style={{border: '2px solid #1E283C', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span></span> 投诉详情
                  <span className="text-sm font-normal text-mc-stone-light">#{selectedComplaint.id}</span>
                </h2>
                <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium" style={{border: '1px solid #5D7A9C'}}>
                  <span className={getStatusStyle(localStatus)}>{getStatusText(localStatus)}</span>
                </span>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-mc-stone-light hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="rounded-sm p-4 space-y-3" style={{border: '1px solid #5D7A9C', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl"></span>
                  <span className="text-mc-stone-light text-sm">被举报玩家</span>
                </div>
                <div className="text-white font-bold text-xl">{selectedComplaint.target_player}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-sm p-4" style={{border: '1px solid #5D7A9C', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
                  <div className="flex items-center gap-2 mb-1">
                    <span></span>
                    <span className="text-mc-stone-light text-xs">举报人</span>
                  </div>
                  <div className="text-white font-semibold">{selectedComplaint.reporter_name}</div>
                </div>
                <div className="rounded-sm p-4" style={{border: '1px solid #5D7A9C', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
                  <div className="flex items-center gap-2 mb-1">
                    <span></span>
                    <span className="text-mc-stone-light text-xs">QQ号</span>
                  </div>
                  <div className="text-white font-semibold">{selectedComplaint.reporter_qq}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-sm p-4" style={{border: '1px solid #5D7A9C', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
                <div className="flex items-center gap-2 mb-1">
                  <span></span>
                  <span className="text-mc-stone-light text-xs">违规时间</span>
                </div>
                <div className="text-white text-sm">{formatViolationTime(selectedComplaint.violation_time)}</div>
              </div>
                <div className="rounded-sm p-4" style={{border: '1px solid #5D7A9C', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
                  <div className="flex items-center gap-2 mb-1">
                    <span></span>
                    <span className="text-mc-stone-light text-xs">违规类型</span>
                  </div>
                  <div className="text-white text-sm">{selectedComplaint.violation_type}</div>
                </div>
              </div>

              <div className="rounded-sm p-4" style={{border: '1px solid rgba(93, 122, 156, 0.8)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
                <div className="flex items-center gap-2 mb-1">
                  <span></span>
                  <span className="text-mc-stone-light text-xs">违规描述</span>
                </div>
                <div className="text-white text-sm whitespace-pre-wrap">{selectedComplaint.description || '未填写'}</div>
              </div>

              {selectedComplaint.evidence && (
                <div className="rounded-sm p-4" style={{border: '1px solid #5D7A9C', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
                  <div className="flex items-center gap-2 mb-2">
                    <span></span>
                    <span className="text-mc-stone-light text-sm">举报人提交的证据</span>
                  </div>
                  <a 
                    href={selectedComplaint.evidence} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white hover:text-mc-stone-light underline break-all text-sm flex items-center gap-1"
                  >
                    点击查看证据链接 <span>↗</span>
                  </a>
                </div>
              )}

              {selectedComplaint.handler && (
                <div className="rounded-sm p-4" style={{border: '1px solid #5D7A9C', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
                  <div className="flex items-center gap-2 mb-1">
                    <span></span>
                    <span className="text-mc-stone-light text-xs">处理人</span>
                  </div>
                  <div className="text-white font-semibold">{selectedComplaint.handler === '服主' && adminInfo.user ? adminInfo.user : selectedComplaint.handler}</div>
                  <div className="text-mc-stone-light text-xs mt-1">
                    职位: {adminInfo.isOwner ? '服主' : '管理员'}
                  </div>
                </div>
              )}

              {selectedComplaint.investigation_note && (
                <div className="rounded-sm p-4" style={{border: '1px solid #5D7A9C', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
                  <div className="flex items-center gap-2 mb-1">
                    <span></span>
                    <span className="text-mc-stone-light text-xs">调查记录</span>
                  </div>
                  <div className="text-white text-sm whitespace-pre-wrap">{selectedComplaint.investigation_note}</div>
                </div>
              )}

              {selectedComplaint.resolution_note && (
                <div className="rounded-sm p-4" style={{border: '1px solid #5D7A9C', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
                  <div className="flex items-center gap-2 mb-1">
                    <span></span>
                    <span className="text-mc-stone-light text-xs">处理说明</span>
                  </div>
                  <div className="text-white text-sm whitespace-pre-wrap">{selectedComplaint.resolution_note}</div>
                </div>
              )}

              {selectedComplaint.resolution_images && (
                <div className="rounded-sm p-4" style={{border: '1px solid #5D7A9C', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
                  <div className="flex items-center gap-2 mb-2">
                    <span></span>
                    <span className="text-mc-stone-light text-xs">处理结果图片</span>
                  </div>
                  <div className="space-y-2">
                    {selectedComplaint.resolution_images.split(',').filter(url => url.trim()).map((url, index) => (
                      <a 
                        key={index}
                        href={url.trim()} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-white hover:text-mc-stone-light underline break-all text-sm block"
                      >
                        图片 {index + 1} ↗
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {localStatus === 'processing' && !showResolveForm && !showRejectForm && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-mc-stone-light text-sm mb-2 font-medium">调查记录</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="请记录调查过程和发现..."
                      rows={3}
                      className="w-full rounded-sm px-4 py-3 text-white focus:outline-none resize-none text-sm"
                      style={{border: '1px solid #5D7A9C', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-mc-stone-light text-sm mb-2">
                      <span></span>
                      百度云盘证据编号（单个文件夹，格式：日期+被举报人）
                    </label>
                    <input
                      type="text"
                      value={imageUrls}
                      onChange={(e) => setImageUrls(e.target.value)}
                      placeholder="例如：20240101a"
                      className="w-full rounded-sm px-4 py-2 text-white focus:outline-none text-sm"
                      style={{border: '1px solid #5D7A9C', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                    />
                  </div>
                </div>
              )}

              {showResolveForm || showRejectForm && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-base font-semibold text-white">
                    <span>{showResolveForm ? '' : ''}</span>
                    <span>{showResolveForm ? '填写解决说明' : '填写驳回原因'}</span>
                  </div>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={showResolveForm ? '请详细说明处理结果，包括调查过程、处理方式等...' : '请说明驳回原因...'}
                    className="w-full rounded-sm px-4 py-3 text-white focus:outline-none resize-none text-sm"
                    style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                    rows={3}
                  />
                  <div>
                    <label className="flex items-center gap-2 text-mc-stone-light text-sm mb-2">
                      <span></span>
                      百度云盘证据编号（单个文件夹，格式：日期+被举报人）
                    </label>
                    <input
                      type="text"
                      value={imageUrls}
                      onChange={(e) => setImageUrls(e.target.value)}
                      placeholder="例如：20240101a"
                      className="w-full rounded-sm px-4 py-2 text-white focus:outline-none text-sm"
                      style={{border: '1px solid #5D7A9C', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                    />
                  </div>
                </div>
              )}

              {localStatus !== 'pending' && (localStatus !== 'processing' || showResolveForm || showRejectForm) && (
                <div>
                  <label className="block text-mc-stone-light text-sm mb-2 font-medium">重启原因</label>
                  <textarea
                    value={restartNote}
                    onChange={(e) => setRestartNote(e.target.value)}
                    placeholder="填写重启此案件的原因..."
                    rows={3}
                    className="w-full rounded-sm px-4 py-3 text-white focus:outline-none resize-none"
                    style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              {showResolveForm || showRejectForm ? (
                <>
                  <button
                    onClick={() => { setShowResolveForm(false); setShowRejectForm(false); setNote(''); setImageUrls(''); }}
                    className="flex-1 px-4 py-3 hover:bg-white/10 text-white rounded-sm transition-all"
                    style={{border: '1px solid #5D7A9C', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
                  >
                    取消
                  </button>
                  <button
                    onClick={showResolveForm ? handleResolve : handleReject}
                    disabled={processing}
                    className={`flex-1 px-4 py-3 hover:bg-white/30 text-white rounded-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
                    style={{border: '1px solid #5D7A9C', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
                  >
                    {processing ? '处理中...' : (showResolveForm ? '确认解决' : '确认驳回')}
                  </button>
                </>
              ) : (
                <>
                  {localStatus === 'pending' && (
                    <button
                      onClick={handleAccept}
                      disabled={processing}
                      className="flex-1 px-4 py-3 hover:bg-white/30 text-white rounded-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{border: '1px solid #5D7A9C', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
                    >
                      <span></span>
                      <span>{processing ? '接取中...' : '接取处理'}</span>
                    </button>
                  )}
                  {localStatus === 'processing' && (
                    <>
                      <button
                        onClick={() => setShowResolveForm(true)}
                        className="flex-1 px-4 py-3 hover:bg-white/30 text-white rounded-sm transition-all flex items-center justify-center gap-2"
                        style={{border: '1px solid #5D7A9C', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
                      >
                        <span></span>
                        <span>已解决</span>
                      </button>
                      <button
                        onClick={() => setShowRejectForm(true)}
                        className="flex-1 px-4 py-3 hover:bg-white/30 text-white rounded-sm transition-all flex items-center justify-center gap-2"
                        style={{border: '1px solid #5D7A9C', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
                      >
                        <span></span>
                        <span>已驳回</span>
                      </button>
                    </>
                  )}
                  {(localStatus === 'resolved' || localStatus === 'rejected') && (
                    <>
                      <div className="w-full text-center py-2 text-mc-stone-light text-sm mb-2">
                        此投诉已处理完毕
                      </div>
                      <button
                        onClick={() => handleRestart(selectedComplaint.id)}
                        disabled={processing}
                        className="w-full px-4 py-3 hover:bg-white/30 text-white rounded-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{border: '1px solid #5D7A9C', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
                      >
                        <span></span>
                        <span>重启案件</span>
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
