'use client';

import { useState, useEffect } from 'react';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { RichTextEditor } from '../components/RichTextEditor';

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  is_pinned: boolean;
  created_by: string | null;
  created_at: string;
  expires_at: string | null;
  sort_order: number;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'normal',
    is_pinned: false,
    expires_at: ''
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
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/announcements');
      const result = await response.json();
      if (result.success) {
        setAnnouncements(result.data);
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error('获取公告列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === announcements.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(announcements.map(a => a.id)));
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
      alert('请先选择要删除的公告');
      return;
    }
    setIsBatchDelete(true);
    setDeleteTarget(null);
    setDeleteModalOpen(true);
  };

  const handleDelete = (id: number) => {
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
          await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
        }
        alert('批量删除成功');
      } else if (deleteTarget) {
        const response = await fetch(`/api/announcements/${deleteTarget}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
          alert('删除成功');
        } else {
          alert(result.message || '删除失败');
        }
      }
      fetchAnnouncements();
    } catch (error) {
      alert('删除失败，请重试');
    } finally {
      setProcessing(false);
      setDeleteTarget(null);
    }
  };

  const handleExport = () => {
    const exportData = selectedIds.size > 0 
      ? announcements.filter(a => selectedIds.has(a.id))
      : announcements;
    
    if (exportData.length === 0) {
      alert('没有可导出的数据');
      return;
    }
    
    const csvContent = [
      ['标题', '内容', '类型', '是否置顶', '创建人', '创建时间', '过期时间'].join(','),
      ...exportData.map(a => [
        a.title,
        (a.content || '').replace(/"/g, '""'),
        a.type === 'important' ? '重要' : a.type === 'event' ? '活动' : a.type === 'update' ? '更新' : '普通',
        a.is_pinned ? '是' : '否',
        a.created_by || '系统',
        formatDate(a.created_at),
        formatDate(a.expires_at)
      ].map(field => `"${field}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `公告列表_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
    link.click();
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      alert('请填写标题和内容');
      return;
    }
    if (!adminInfo) {
      alert('请先登录');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const response = await fetch(`/api/announcements/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (result.success) {
          setShowEditor(false);
          setEditingId(null);
          resetForm();
          fetchAnnouncements();
        } else {
          alert(result.message || '更新失败');
        }
      } else {
        const response = await fetch('/api/announcements', {
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
          fetchAnnouncements();
        } else {
          alert(result.message || '发布失败');
        }
      }
    } catch (error) {
      alert('操作失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      is_pinned: announcement.is_pinned,
      expires_at: announcement.expires_at ? announcement.expires_at.slice(0, 16) : ''
    });
    setShowEditor(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'normal',
      is_pinned: false,
      expires_at: ''
    });
    setEditingId(null);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'important':
        return <span className="px-2 py-1 text-white rounded text-xs" style={{border: '1px solid rgba(239, 68, 68, 0.9)', backgroundColor: 'rgba(239, 68, 68, 0.3)'}}>重要</span>;
      case 'event':
        return <span className="px-2 py-1 text-white rounded text-xs" style={{border: '1px solid rgba(138, 158, 255, 0.9)', backgroundColor: 'rgba(138, 158, 255, 0.3)'}}>活动</span>;
      case 'update':
        return <span className="px-2 py-1 text-white rounded text-xs" style={{border: '1px solid rgba(34, 197, 94, 0.9)', backgroundColor: 'rgba(34, 197, 94, 0.3)'}}>更新</span>;
      default:
        return <span className="px-2 py-1 text-mc-stone-light rounded text-xs" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.3)'}}>普通</span>;
    }
  };

  const handleMoveUp = async (id: number, currentOrder: number) => {
    const sortedAnnouncements = [...announcements].sort((a, b) => a.sort_order - b.sort_order);
    const currentIndex = sortedAnnouncements.findIndex(a => a.id === id);
    
    if (currentIndex > 0) {
      const prevAnnouncement = sortedAnnouncements[currentIndex - 1];
      
      setProcessing(true);
      try {
        await Promise.all([
          fetch('/api/announcements', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, sort_order: prevAnnouncement.sort_order })
          }),
          fetch('/api/announcements', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: prevAnnouncement.id, sort_order: currentOrder })
          })
        ]);
        fetchAnnouncements();
      } catch (error) {
        alert('移动失败，请重试');
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleMoveDown = async (id: number, currentOrder: number) => {
    const sortedAnnouncements = [...announcements].sort((a, b) => a.sort_order - b.sort_order);
    const currentIndex = sortedAnnouncements.findIndex(a => a.id === id);
    
    if (currentIndex < sortedAnnouncements.length - 1) {
      const nextAnnouncement = sortedAnnouncements[currentIndex + 1];
      
      setProcessing(true);
      try {
        await Promise.all([
          fetch('/api/announcements', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, sort_order: nextAnnouncement.sort_order })
          }),
          fetch('/api/announcements', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: nextAnnouncement.id, sort_order: currentOrder })
          })
        ]);
        fetchAnnouncements();
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
          <h1 className="text-2xl font-bold text-white">公告管理</h1>
          <p className="text-mc-stone-light text-sm mt-1">发布和管理服务器公告</p>
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
          发布公告
        </button>
      </div>

      {announcements.length > 0 && (
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
          <div className="text-4xl animate-bounce text-white">加载中...</div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-sm p-12 text-center" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
          <p className="text-mc-stone-light text-lg">暂无公告</p>
        </div>
      ) : (
        <div className="rounded-sm overflow-hidden" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
          <table className="w-full">
            <thead className="bg-transparent">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === announcements.length && announcements.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-white focus:ring-white/50" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.3)'}}
                  />
                </th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium">排序</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium">标题</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium">类型</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium">创建人</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium">创建时间</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {announcements.map((announcement) => (
                <tr key={announcement.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(announcement.id)}
                      onChange={() => toggleSelect(announcement.id)}
                      className="w-4 h-4 rounded text-white focus:ring-white/50" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.3)'}}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => handleMoveUp(announcement.id, announcement.sort_order)}
                        disabled={processing}
                        className="w-6 h-6 flex items-center justify-center text-mc-stone-light hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleMoveDown(announcement.id, announcement.sort_order)}
                        disabled={processing}
                        className="w-6 h-6 flex items-center justify-center text-mc-stone-light hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {announcement.is_pinned && <span className="text-mc-stone-light">置顶</span>}
                      <span className="text-white font-medium">{announcement.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getTypeBadge(announcement.type)}</td>
                  <td className="px-4 py-3 text-mc-stone-light">{announcement.created_by || '系统'}</td>
                  <td className="px-4 py-3 text-mc-stone-light">{formatDate(announcement.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="px-3 py-1.5 text-white rounded-sm transition-all text-sm"
                        style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(93, 122, 156, 1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(93, 122, 156, 0.9)';
                        }}
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="px-3 py-1.5 text-white rounded-sm transition-all text-sm"
                        style={{border: '1px solid rgba(239, 68, 68, 0.9)', backgroundColor: 'rgba(239, 68, 68, 0.9)'}}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.9)';
                        }}
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
          <div className="rounded-sm p-6 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.95)'}}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingId ? '编辑公告' : '发布公告'}
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
                  placeholder="输入公告标题"
                  className="w-full rounded-sm px-4 py-3 text-white focus:outline-none"
                  style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                />
              </div>
              
              <div>
                <label className="block text-white text-sm mb-2 font-medium">内容 <span className="text-mc-stone-light">*</span></label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  placeholder="输入公告内容，支持Markdown语法"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm mb-2 font-medium">类型</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-sm px-4 py-3 text-white focus:outline-none"
                    style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                  >
                    <option value="normal">普通</option>
                    <option value="important">重要</option>
                    <option value="event">活动</option>
                    <option value="update">更新</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-white text-sm mb-2 font-medium">过期时间（可选）</label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={formData.expires_at ? formData.expires_at.split('T')[0] : ''}
                      onChange={(e) => {
                        const date = e.target.value;
                        const time = formData.expires_at ? formData.expires_at.split('T')[1] || '23:59' : '23:59';
                        setFormData({ ...formData, expires_at: date ? `${date}T${time}` : '' });
                      }}
                      className="w-full rounded-sm px-4 py-3 text-white focus:outline-none"
                      style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                    />
                    <input
                      type="time"
                      value={formData.expires_at ? formData.expires_at.split('T')[1] || '' : ''}
                      onChange={(e) => {
                        const date = formData.expires_at ? formData.expires_at.split('T')[0] : new Date().toISOString().split('T')[0];
                        const time = e.target.value;
                        setFormData({ ...formData, expires_at: time ? `${date}T${time}` : '' });
                      }}
                      className="w-full rounded-sm px-4 py-3 text-white focus:outline-none"
                      style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_pinned"
                  checked={formData.is_pinned}
                  onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                  className="w-5 h-5 rounded"
                  style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.3)'}}
                />
                <label htmlFor="is_pinned" className="text-white"> 置顶公告</label>
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(93, 122, 156, 1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(93, 122, 156, 0.9)';
                }}
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 px-4 py-3 text-white rounded-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{border: '1px solid rgba(138, 158, 255, 0.9)', backgroundColor: 'rgba(138, 158, 255, 0.9)', opacity: saving ? '0.5' : '1', cursor: saving ? 'not-allowed' : 'pointer'}}
                onMouseEnter={(e) => {
                  if (!saving) {
                    e.currentTarget.style.backgroundColor = 'rgba(138, 158, 255, 1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!saving) {
                    e.currentTarget.style.backgroundColor = 'rgba(138, 158, 255, 0.9)';
                  }
                }}
              >
                {saving ? '保存中...' : (editingId ? '保存修改' : '发布公告')}
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
        itemName="条公告"
        processing={processing}
      />
    </div>
  );
}