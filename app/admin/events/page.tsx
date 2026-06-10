'use client';

import { useState, useEffect } from 'react';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { RichTextEditor } from '../components/RichTextEditor';

interface Event {
  id: number;
  title: string;
  description: string;
  content: string;
  image_url: string;
  start_time: string | null;
  end_time: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
  sort_order: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    image_url: '',
    start_time: '',
    end_time: '',
    status: 'upcoming'
  });
  const [saving, setSaving] = useState(false);
  const [adminInfo, setAdminInfo] = useState<{ user: string; adminId: number } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [isBatchDelete, setIsBatchDelete] = useState(false);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminInfo');
    if (savedAdmin) {
      setAdminInfo(JSON.parse(savedAdmin));
    }
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/events');
      const result = await response.json();
      if (result.success) {
        setEvents(result.data);
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error('获取活动列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === events.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(events.map(e => e.id)));
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

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) {
      alert('请先选择要删除的活动');
      return;
    }
    setIsBatchDelete(true);
    setDeleteTarget(null);
    setDeleteModalOpen(true);
  };

  const handleSingleDelete = (id: number) => {
    setDeleteTarget(id);
    setIsBatchDelete(false);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setDeleteModalOpen(false);
    setProcessing(true);
    try {
      if (isBatchDelete) {
        for (const id of selectedIds) {
          await fetch(`/api/events/${id}`, { method: 'DELETE' });
        }
        alert('批量删除成功');
      } else if (deleteTarget) {
        const response = await fetch(`/api/events/${deleteTarget}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
          alert('删除成功');
        } else {
          alert(result.message || '删除失败');
        }
      }
      fetchEvents();
    } catch (error) {
      alert('删除失败，请重试');
    } finally {
      setProcessing(false);
      setDeleteTarget(null);
    }
  };

  const handleExport = () => {
    const exportData = selectedIds.size > 0 
      ? events.filter(e => selectedIds.has(e.id))
      : events;
    
    if (exportData.length === 0) {
      alert('没有可导出的数据');
      return;
    }
    
    const csvContent = [
      ['标题', '描述', '内容', '开始时间', '结束时间', '状态', '创建人', '创建时间'].join(','),
      ...exportData.map(e => [
        e.title,
        (e.description || '').replace(/"/g, '""'),
        (e.content || '').replace(/"/g, '""'),
        formatDate(e.start_time),
        formatDate(e.end_time),
        e.status === 'ongoing' ? '进行中' : e.status === 'ended' ? '已结束' : e.status === 'cancelled' ? '已取消' : '即将开始',
        e.created_by || '系统',
        formatDate(e.created_at)
      ].map(field => `"${field}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `活动列表_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
    link.click();
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      alert('请填写标题');
      return;
    }
    if (!adminInfo) {
      alert('请先登录');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const response = await fetch(`/api/events/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (result.success) {
          setShowEditor(false);
          setEditingId(null);
          resetForm();
          fetchEvents();
        } else {
          alert(result.message || '更新失败');
        }
      } else {
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            created_by: adminInfo.user,
            created_by_id: adminInfo.adminId
          })
        });
        const result = await response.json();
        if (result.success) {
          setShowEditor(false);
          resetForm();
          fetchEvents();
        } else {
          alert(result.message || '创建失败');
        }
      }
    } catch (error) {
      alert('操作失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingId(event.id);
    setFormData({
      title: event.title,
      description: event.description,
      content: event.content,
      image_url: event.image_url,
      start_time: event.start_time ? event.start_time.slice(0, 16) : '',
      end_time: event.end_time ? event.end_time.slice(0, 16) : '',
      status: event.status
    });
    setShowEditor(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      image_url: '',
      start_time: '',
      end_time: '',
      status: 'upcoming'
    });
    setEditingId(null);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '未设置';
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ongoing':
        return <span className="px-2 py-1 text-white rounded text-xs" style={{border: '1px solid rgba(34, 197, 94, 0.9)', backgroundColor: 'rgba(34, 197, 94, 0.3)'}}>进行中</span>;
      case 'ended':
        return <span className="px-2 py-1 text-mc-stone-light rounded text-xs" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.3)'}}>已结束</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-white rounded text-xs" style={{border: '1px solid rgba(239, 68, 68, 0.9)', backgroundColor: 'rgba(239, 68, 68, 0.3)'}}>已取消</span>;
      default:
        return <span className="px-2 py-1 text-white rounded text-xs" style={{border: '1px solid rgba(138, 158, 255, 0.9)', backgroundColor: 'rgba(138, 158, 255, 0.3)'}}>即将开始</span>;
    }
  };

  const handleMoveUp = async (id: number, currentOrder: number) => {
    const sortedEvents = [...events].sort((a, b) => a.sort_order - b.sort_order);
    const currentIndex = sortedEvents.findIndex(e => e.id === id);
    
    if (currentIndex > 0) {
      const prevEvent = sortedEvents[currentIndex - 1];
      
      setProcessing(true);
      try {
        // 交换排序值
        await Promise.all([
          fetch('/api/events', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, sort_order: prevEvent.sort_order })
          }),
          fetch('/api/events', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: prevEvent.id, sort_order: currentOrder })
          })
        ]);
        fetchEvents();
      } catch (error) {
        alert('移动失败，请重试');
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleMoveDown = async (id: number, currentOrder: number) => {
    const sortedEvents = [...events].sort((a, b) => a.sort_order - b.sort_order);
    const currentIndex = sortedEvents.findIndex(e => e.id === id);
    
    if (currentIndex < sortedEvents.length - 1) {
      const nextEvent = sortedEvents[currentIndex + 1];
      
      setProcessing(true);
      try {
        // 交换排序值
        await Promise.all([
          fetch('/api/events', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, sort_order: nextEvent.sort_order })
          }),
          fetch('/api/events', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: nextEvent.id, sort_order: currentOrder })
          })
        ]);
        fetchEvents();
      } catch (error) {
        alert('移动失败，请重试');
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            活动管理
          </h1>
          <p className="text-mc-stone-light text-sm mt-1">创建和管理服务器活动</p>
        </div>
        
        <button
          onClick={() => {
            resetForm();
            setShowEditor(true);
          }}
          className="px-4 py-2 text-white rounded-sm transition-all flex items-center gap-2"
          style={{border: '1px solid rgba(138, 158, 255, 0.9)', backgroundColor: 'rgba(138, 158, 255, 0.9)'}}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(138, 158, 255, 1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(138, 158, 255, 0.9)';
          }}
        >
           创建活动
        </button>
      </div>

      {events.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-sm font-medium text-white transition-all flex items-center gap-2"
            style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(93, 122, 156, 1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(93, 122, 156, 0.9)';
            }}
          >
             {selectedIds.size > 0 ? `选中导出 (${selectedIds.size})` : '导出全部'}
          </button>
          <button
            onClick={handleBatchDelete}
            disabled={selectedIds.size === 0 || processing}
            className="px-4 py-2 rounded-sm font-medium text-white transition-all flex items-center gap-2"
            style={{border: '1px solid rgba(239, 68, 68, 0.9)', backgroundColor: 'rgba(239, 68, 68, 0.9)', opacity: selectedIds.size === 0 || processing ? '0.5' : '1', cursor: selectedIds.size === 0 || processing ? 'not-allowed' : 'pointer'}}
            onMouseEnter={(e) => {
              if (selectedIds.size > 0 && !processing) {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 1)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedIds.size > 0 && !processing) {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.9)';
              }
            }}
          >
             选中删除 {selectedIds.size > 0 && `(${selectedIds.size})`}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-4xl animate-bounce"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-sm p-12 text-center" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
          <div className="text-6xl mb-4"></div>
          <p className="text-mc-stone-light text-lg">暂无活动</p>
        </div>
      ) : (
        <div className="rounded-sm overflow-hidden" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
          <table className="w-full">
            <thead className="bg-transparent">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === events.length && events.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-white focus:ring-white/50" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.3)'}}
                  />
                </th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium">排序</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium">标题</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium">状态</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium">开始时间</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium">结束时间</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(event.id)}
                      onChange={() => toggleSelect(event.id)}
                      className="w-4 h-4 rounded text-white focus:ring-white/50" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.3)'}}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => handleMoveUp(event.id, event.sort_order)}
                        disabled={processing}
                        className="w-6 h-6 flex items-center justify-center text-mc-stone-light hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleMoveDown(event.id, event.sort_order)}
                        disabled={processing}
                        className="w-6 h-6 flex items-center justify-center text-mc-stone-light hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{event.title}</td>
                  <td className="px-4 py-3">{getStatusBadge(event.status)}</td>
                  <td className="px-4 py-3 text-white">{formatDate(event.start_time)}</td>
                  <td className="px-4 py-3 text-white">{formatDate(event.end_time)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="px-3 py-1.5 text-white rounded-sm transition-all text-sm"
                        style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(93, 122, 156, 1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(93, 122, 156, 0.9)'}
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleSingleDelete(event.id)}
                        className="px-3 py-1.5 text-white rounded-sm transition-all text-sm"
                        style={{border: '1px solid rgba(239, 68, 68, 0.9)', backgroundColor: 'rgba(239, 68, 68, 0.9)'}}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.9)'}
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showEditor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-sm p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.95)'}}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 {editingId ? '编辑活动' : '创建活动'}
              </h2>
              <button
                onClick={() => {
                  setShowEditor(false);
                  resetForm();
                }}
                className="text-mc-stone-light hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm mb-2 font-medium">标题 <span className="text-mc-stone-light">*</span></label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="输入活动标题"
                  className="w-full rounded-sm px-4 py-3 text-white focus:outline-none" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                />
              </div>
              
              <div>
                <label className="block text-white text-sm mb-2 font-medium">简短描述</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="一句话描述活动"
                  className="w-full rounded-sm px-4 py-3 text-white focus:outline-none" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                />
              </div>
              
              <div>
                <label className="block text-white text-sm mb-2 font-medium">详细内容</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="活动详情、规则、奖励等"
                  rows={5}
                  className="w-full bg-transparent border border-mc-stone-dark rounded-sm px-4 py-3 text-white focus:outline-none focus:border-mc-stone-light resize-none"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm mb-2 font-medium">封面图片URL</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.png"
                  className="w-full rounded-sm px-4 py-3 text-white focus:outline-none" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm mb-2 font-medium">开始时间</label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={formData.start_time ? formData.start_time.split('T')[0] : ''}
                      onChange={(e) => {
                        const date = e.target.value;
                        const time = formData.start_time ? formData.start_time.split('T')[1] || '00:00' : '00:00';
                        setFormData({ ...formData, start_time: `${date}T${time}` });
                      }}
                      className="w-full rounded-sm px-4 py-3 text-white focus:outline-none" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                    />
                    <input
                      type="time"
                      value={formData.start_time ? formData.start_time.split('T')[1] || '' : ''}
                      onChange={(e) => {
                        const date = formData.start_time ? formData.start_time.split('T')[0] : new Date().toISOString().split('T')[0];
                        const time = e.target.value;
                        setFormData({ ...formData, start_time: `${date}T${time}` });
                      }}
                      className="w-full rounded-sm px-4 py-3 text-white focus:outline-none" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white text-sm mb-2 font-medium">结束时间</label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={formData.end_time ? formData.end_time.split('T')[0] : ''}
                      onChange={(e) => {
                        const date = e.target.value;
                        const time = formData.end_time ? formData.end_time.split('T')[1] || '00:00' : '00:00';
                        setFormData({ ...formData, end_time: `${date}T${time}` });
                      }}
                      className="w-full rounded-sm px-4 py-3 text-white focus:outline-none" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                    />
                    <input
                      type="time"
                      value={formData.end_time ? formData.end_time.split('T')[1] || '' : ''}
                      onChange={(e) => {
                        const date = formData.end_time ? formData.end_time.split('T')[0] : new Date().toISOString().split('T')[0];
                        const time = e.target.value;
                        setFormData({ ...formData, end_time: `${date}T${time}` });
                      }}
                      className="w-full rounded-sm px-4 py-3 text-white focus:outline-none" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-white text-sm mb-2 font-medium">状态</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded-sm px-4 py-3 text-white focus:outline-none" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                >
                  <option value="upcoming">即将开始</option>
                  <option value="ongoing">进行中</option>
                  <option value="ended">已结束</option>
                  <option value="cancelled">已取消</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditor(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-3 text-white rounded-sm transition-all"
                style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(93, 122, 156, 1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(93, 122, 156, 0.9)'}
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 px-4 py-3 text-white rounded-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{border: '1px solid rgba(138, 158, 255, 0.9)', backgroundColor: 'rgba(138, 158, 255, 0.9)', opacity: saving ? '0.5' : '1', cursor: saving ? 'not-allowed' : 'pointer'}}
                onMouseEnter={(e) => { if (!saving) e.currentTarget.style.backgroundColor = 'rgba(138, 158, 255, 1)' }}
                onMouseLeave={(e) => { if (!saving) e.currentTarget.style.backgroundColor = 'rgba(138, 158, 255, 0.9)' }}
              >
                {saving ? '保存中...' : (editingId ? '保存修改' : '创建活动')}
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
        count={isBatchDelete ? selectedIds.size : 1}
        itemName="个活动"
        processing={processing}
      />
    </div>
  );
}
