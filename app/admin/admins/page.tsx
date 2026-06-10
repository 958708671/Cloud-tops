'use client';

import { useState, useEffect } from 'react';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

interface Admin {
  id: number;
  username: string;
  display_name: string;
  qq: string;
  is_owner: boolean;
  permissions: Permissions;
  show_in_contact: boolean;
  show_in_logs: boolean;
  receive_complaint_email: boolean;
  receive_application_email: boolean;
  receive_qq_notifications: boolean;
  created_at: string;
}

interface Permissions {
  whitelist_review: boolean;
  complaint_handle: boolean;
  blacklist_manage: boolean;
  announcement_manage: boolean;
  event_manage: boolean;
  statistics_view: boolean;
  settings_view: boolean;
  website_edit: boolean;
  admin_manage: boolean;
  logs_view: boolean;
  monitor_view: boolean;
}

const defaultPermissions: Permissions = {
  whitelist_review: true,
  complaint_handle: true,
  blacklist_manage: true,
  announcement_manage: true,
  event_manage: true,
  statistics_view: true,
  settings_view: false,
  website_edit: false,
  admin_manage: false,
  logs_view: false,
  monitor_view: false
};

const permissionLabels: Record<keyof Permissions, string> = {
  whitelist_review: '白名单审核',
  complaint_handle: '投诉处理',
  blacklist_manage: '黑名单管理',
  announcement_manage: '公告管理',
  event_manage: '活动管理',
  statistics_view: '数据统计',
  settings_view: '系统设置',
  website_edit: '官网编辑',
  admin_manage: '管理员管理',
  logs_view: '日志查看',
  monitor_view: '监控查看'
};

const permissionCategories = [
  {
    name: ' 用户管理',
    permissions: ['whitelist_review', 'blacklist_manage'] as const
  },
  {
    name: ' 内容管理',
    permissions: ['announcement_manage', 'event_manage', 'website_edit'] as const
  },
  {
    name: ' 系统管理',
    permissions: ['settings_view', 'admin_manage', 'logs_view', 'monitor_view'] as const
  },
  {
    name: ' 投诉处理',
    permissions: ['complaint_handle'] as const
  },
  {
    name: ' 数据统计',
    permissions: ['statistics_view'] as const
  }
];

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionAdmin, setPermissionAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    display_name: '',
    qq: '',
    is_owner: false,
    permissions: { ...defaultPermissions },
    show_in_contact: true,
    show_in_logs: true,
    receive_complaint_email: false,
    receive_application_email: false,
    receive_qq_notifications: true
  });
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleteUsername, setDeleteUsername] = useState<string>('');
  const [isBatchDelete, setIsBatchDelete] = useState(false);
  const [showBatchPermissionModal, setShowBatchPermissionModal] = useState(false);
  const [batchPermissions, setBatchPermissions] = useState<Partial<Permissions>>({});
  const [batchReceiveComplaintEmail, setBatchReceiveComplaintEmail] = useState<boolean | null>(null);
  const [batchReceiveApplicationEmail, setBatchReceiveApplicationEmail] = useState<boolean | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/list');
      const result = await response.json();
      if (result.success) {
        setAdmins(result.data);
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error('获取管理员列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    const nonOwnerAdmins = admins.filter(a => !a.is_owner);
    if (selectedIds.size === nonOwnerAdmins.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(nonOwnerAdmins.map(a => a.id)));
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
      alert('请先选择要删除的管理员');
      return;
    }
    setIsBatchDelete(true);
    setDeleteTarget(null);
    setDeleteUsername('');
    setDeleteModalOpen(true);
  };

  const handleSingleDelete = (id: number, username: string) => {
    setDeleteTarget(id);
    setDeleteUsername(username);
    setIsBatchDelete(false);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setDeleteModalOpen(false);
    setProcessing(true);
    try {
      if (isBatchDelete) {
        for (const id of selectedIds) {
          await fetch(`/api/admin/manage?id=${id}`, { method: 'DELETE' });
        }
        alert('批量删除成功');
      } else if (deleteTarget) {
        const response = await fetch(`/api/admin/manage?id=${deleteTarget}`, { method: 'DELETE' });
        const result = await response.json();
        if (result.success) {
          alert('删除成功');
        } else {
          alert(result.message || '删除失败');
        }
      }
      fetchAdmins();
    } catch (error) {
      alert('删除失败，请重试');
    } finally {
      setProcessing(false);
      setDeleteTarget(null);
      setDeleteUsername('');
    }
  };

  const handleExport = () => {
    const exportData = selectedIds.size > 0 
      ? admins.filter(a => selectedIds.has(a.id))
      : admins;
    
    if (exportData.length === 0) {
      alert('没有可导出的数据');
      return;
    }
    
    const csvContent = [
      ['ID', '用户名', '昵称', 'QQ', '角色', '展示设置', '创建时间'].join(','),
      ...exportData.map(a => [
        a.id,
        a.username,
        a.display_name || '-',
        a.qq || '-',
        a.is_owner ? '服主' : '管理员',
        `联系页面:${a.show_in_contact ? '是' : '否'}/日志:${a.show_in_logs ? '是' : '否'}`,
        formatDate(a.created_at)
      ].map(field => `"${field}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `管理员列表_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
    link.click();
  };

  const handleAdd = async () => {
    if (!formData.username || !formData.password) {
      alert('请填写用户名和密码');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.success) {
        setShowAddModal(false);
        resetForm();
        fetchAdmins();
      } else {
        alert(result.message || '添加失败');
      }
    } catch (error) {
      alert('添加失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingAdmin) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/manage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAdmin.id,
          username: formData.username,
          password: formData.password || undefined,
          display_name: formData.display_name,
          qq: formData.qq,
          show_in_contact: formData.show_in_contact,
          show_in_logs: formData.show_in_logs,
          receive_complaint_email: formData.receive_complaint_email,
          receive_application_email: formData.receive_application_email
        })
      });
      const result = await response.json();
      if (result.success) {
        setEditingAdmin(null);
        resetForm();
        fetchAdmins();
      } else {
        alert(result.message || '更新失败');
      }
    } catch (error) {
      alert('更新失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePermissions = async () => {
    if (!permissionAdmin) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/manage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: permissionAdmin.id,
          permissions: permissionAdmin.permissions,
          receive_complaint_email: permissionAdmin.receive_complaint_email,
          receive_application_email: permissionAdmin.receive_application_email,
          receive_qq_notifications: permissionAdmin.receive_qq_notifications
        })
      });
      const result = await response.json();
      if (result.success) {
        setShowPermissionModal(false);
        setPermissionAdmin(null);
        fetchAdmins();
      } else {
        alert(result.message || '更新失败');
      }
    } catch (error) {
      alert('更新失败，请重试');
    } finally {
      setSaving(false);
    }
  };



  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      display_name: '',
      qq: '',
      is_owner: false,
      permissions: { ...defaultPermissions },
      show_in_contact: true,
      show_in_logs: true,
      receive_complaint_email: false,
      receive_qq_notifications: false,
      receive_application_email: false
    });
  };

  const openEditModal = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      username: admin.username,
      password: '',
      display_name: admin.display_name,
      qq: admin.qq,
      is_owner: admin.is_owner,
      permissions: admin.permissions || { ...defaultPermissions },
      show_in_contact: admin.show_in_contact,
      show_in_logs: admin.show_in_logs,
      receive_complaint_email: admin.receive_complaint_email,
      receive_qq_notifications: admin.receive_qq_notifications,
      receive_application_email: admin.receive_application_email
    });
  };

  const openPermissionModal = (admin: Admin) => {
    setPermissionAdmin({
      ...admin,
      permissions: admin.permissions || { ...defaultPermissions }
    });
    setShowPermissionModal(true);
  };

  const togglePermission = (key: keyof Permissions) => {
    if (!permissionAdmin) return;
    setPermissionAdmin({
      ...permissionAdmin,
      permissions: {
        ...permissionAdmin.permissions,
        [key]: !permissionAdmin.permissions[key]
      }
    });
  };

  const openBatchPermissionModal = () => {
    setBatchPermissions({});
    setBatchReceiveComplaintEmail(null);
    setBatchReceiveApplicationEmail(null);
    setShowBatchPermissionModal(true);
  };

  const toggleBatchPermission = (key: keyof Permissions) => {
    setBatchPermissions(prev => ({
      ...prev,
      [key]: prev[key] === undefined ? true : (prev[key] === true ? false : undefined)
    }));
  };

  const handleBatchUpdatePermissions = async () => {
    if (selectedIds.size === 0) {
      alert('请先选择要修改权限的管理员');
      return;
    }

    setProcessing(true);
    try {
      for (const id of selectedIds) {
        const admin = admins.find(a => a.id === id);
        if (!admin) continue;

        const updateData: any = { id };
        
        if (Object.keys(batchPermissions).length > 0) {
          const newPermissions = { ...admin.permissions };
          for (const [key, value] of Object.entries(batchPermissions)) {
            if (value !== undefined) {
              newPermissions[key as keyof Permissions] = value;
            }
          }
          updateData.permissions = newPermissions;
        }
        
        if (batchReceiveComplaintEmail !== null) {
          updateData.receive_complaint_email = batchReceiveComplaintEmail;
        }
        
        if (batchReceiveApplicationEmail !== null) {
          updateData.receive_application_email = batchReceiveApplicationEmail;
        }

        await fetch('/api/admin/manage', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });
      }
      
      alert('批量修改权限成功');
      setShowBatchPermissionModal(false);
      fetchAdmins();
    } catch (error) {
      alert('批量修改权限失败，请重试');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
             管理员管理
          </h1>
          <p className="text-mc-stone-light text-sm mt-1">添加、编辑和删除管理员账号，配置权限</p>
        </div>
        
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-4 py-2 text-white rounded-sm transition-all flex items-center gap-2"
          style={{border: '1px solid rgba(138, 158, 255, 0.9)', backgroundColor: 'rgba(138, 158, 255, 0.9)'}}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(138, 158, 255, 1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(138, 158, 255, 0.9)'; }}
        >
           管理员管理
        </button>
      </div>

      {admins.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-sm font-medium text-white transition-all flex items-center gap-2"
            style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(93, 122, 156, 1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(93, 122, 156, 0.9)'; }}
          >
             {selectedIds.size > 0 ? `导出选中 (${selectedIds.size})` : '导出全部'}
          </button>
          <button
            onClick={openBatchPermissionModal}
            disabled={selectedIds.size === 0 || processing}
            className="px-4 py-2 rounded-sm font-medium text-white transition-all flex items-center gap-2"
            style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)', opacity: selectedIds.size === 0 || processing ? '0.5' : '1', cursor: selectedIds.size === 0 || processing ? 'not-allowed' : 'pointer'}}
            onMouseEnter={(e) => { if (selectedIds.size > 0 && !processing) e.currentTarget.style.backgroundColor = 'rgba(93, 122, 156, 1)' }}
            onMouseLeave={(e) => { if (selectedIds.size > 0 && !processing) e.currentTarget.style.backgroundColor = 'rgba(93, 122, 156, 0.9)' }}
          >
             批量权限 {selectedIds.size > 0 && `(${selectedIds.size})`}
          </button>
          <button
            onClick={handleBatchDelete}
            disabled={selectedIds.size === 0 || processing}
            className="px-4 py-2 rounded-sm font-medium text-white transition-all flex items-center gap-2"
            style={{border: '1px solid rgba(239, 68, 68, 0.9)', backgroundColor: 'rgba(239, 68, 68, 0.9)', opacity: selectedIds.size === 0 || processing ? '0.5' : '1', cursor: selectedIds.size === 0 || processing ? 'not-allowed' : 'pointer'}}
            onMouseEnter={(e) => { if (selectedIds.size > 0 && !processing) e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 1)' }}
            onMouseLeave={(e) => { if (selectedIds.size > 0 && !processing) e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.9)' }}
          >
             选中删除 {selectedIds.size > 0 && `(${selectedIds.size})`}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-4xl animate-bounce"></div>
        </div>
      ) : (
        <div className="rounded-sm overflow-hidden" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === admins.filter(a => !a.is_owner).length && admins.filter(a => !a.is_owner).length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-white focus:ring-white/50"
                    style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.3)'}}
                  />
                </th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium">ID</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium">用户名</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium">昵称</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium">QQ</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium">角色</th>
                <th className="text-left px-4 py-3 text-mc-stone-light font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{borderColor: 'rgba(30, 40, 60, 0.7)'}}>
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    {!admin.is_owner && (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(admin.id)}
                        onChange={() => toggleSelect(admin.id)}
                        className="w-4 h-4 rounded text-white focus:ring-white/50"
                        style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.3)'}}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{admin.username}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
                      </span>
                      <span className="text-white font-medium">{admin.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white">{admin.display_name || '-'}</td>
                  <td className="px-4 py-3 text-white">{admin.qq || '-'}</td>
                  <td className="px-4 py-3">
                    {admin.is_owner ? (
                      <span className="px-2 py-1 text-white rounded text-xs" style={{border: '1px solid rgba(138, 158, 255, 0.9)', backgroundColor: 'rgba(138, 158, 255, 0.3)'}}>服主</span>
                    ) : (
                      <span className="px-2 py-1 text-white rounded text-xs" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.3)'}}>管理员</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => openEditModal(admin)}
                        className="px-3 py-1.5 text-white rounded-sm transition-all text-sm"
                        style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(93, 122, 156, 1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(93, 122, 156, 0.9)'; }}
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => openPermissionModal(admin)}
                        className="px-3 py-1.5 text-white rounded-sm transition-all text-sm"
                        style={{border: '1px solid rgba(138, 158, 255, 0.9)', backgroundColor: 'rgba(138, 158, 255, 0.9)'}}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(138, 158, 255, 1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(138, 158, 255, 0.9)'; }}
                      >
                        权限
                      </button>
                      {!admin.is_owner && (
                        <button
                          onClick={() => handleSingleDelete(admin.id, admin.username)}
                          className="px-3 py-1.5 text-white rounded-sm transition-all text-sm"
                          style={{border: '1px solid rgba(239, 68, 68, 0.9)', backgroundColor: 'rgba(239, 68, 68, 0.9)'}}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 1)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.9)'; }}
                        >
                          删除
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 添加/编辑管理员弹窗 */}
      {(showAddModal || editingAdmin) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-mc-stone-dark rounded-sm p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 {editingAdmin ? '编辑管理员' : '管理员管理'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingAdmin(null);
                  resetForm();
                }}
                className="text-mc-stone-light hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm mb-2 font-medium">用户名 <span className="text-mc-stone-light">*</span></label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="登录用户名"
                  className="w-full bg-transparent border border-mc-stone-dark rounded-sm px-4 py-3 text-white focus:outline-none focus:border-mc-stone-light"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm mb-2 font-medium">
                  密码 {editingAdmin && '(留空不修改)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="登录密码"
                  className="w-full bg-transparent border border-mc-stone-dark rounded-sm px-4 py-3 text-white focus:outline-none focus:border-mc-stone-light"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm mb-2 font-medium">显示昵称</label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="显示名称（可选）"
                  className="w-full bg-transparent border border-mc-stone-dark rounded-sm px-4 py-3 text-white focus:outline-none focus:border-mc-stone-light"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm mb-2 font-medium">QQ号</label>
                <input
                  type="text"
                  value={formData.qq}
                  onChange={(e) => setFormData({ ...formData, qq: e.target.value })}
                  placeholder="联系QQ（可选）"
                  className="w-full bg-transparent border border-mc-stone-dark rounded-sm px-4 py-3 text-white focus:outline-none focus:border-mc-stone-light"
                />
              </div>

              {/* 展示设置 */}
              <div className="border-t border-mc-stone-dark pt-4">
                <label className="block text-white text-sm mb-3 font-medium">展示设置</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="show_in_contact"
                      checked={formData.show_in_contact}
                      onChange={(e) => setFormData({ ...formData, show_in_contact: e.target.checked })}
                      className="w-5 h-5 rounded bg-transparent border-mc-stone-dark"
                    />
                    <label htmlFor="show_in_contact" className="text-white text-sm">在联系页面显示</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="show_in_logs"
                      checked={formData.show_in_logs}
                      onChange={(e) => setFormData({ ...formData, show_in_logs: e.target.checked })}
                      className="w-5 h-5 rounded bg-transparent border-mc-stone-dark"
                    />
                    <label htmlFor="show_in_logs" className="text-white text-sm">在操作日志中显示</label>
                  </div>
                </div>
              </div>
              
              {!editingAdmin && (
                <div className="flex items-center gap-3 border-t border-mc-stone-dark pt-4">
                  <input
                    type="checkbox"
                    id="is_owner"
                    checked={formData.is_owner}
                    onChange={(e) => setFormData({ ...formData, is_owner: e.target.checked })}
                    className="w-5 h-5 rounded bg-transparent border-mc-stone-dark"
                  />
                  <label htmlFor="is_owner" className="text-white"> 设为服主（拥有所有权限）</label>
                </div>
              )}
              {editingAdmin && editingAdmin.is_owner && (
                <div className="flex items-center gap-3 border-t border-mc-stone-dark pt-4">
                  <div className="w-5 h-5 rounded bg-transparent border border-mc-stone-dark flex items-center justify-center">
                    <span className="text-sm text-white"></span>
                  </div>
                  <label className="text-white"> 服主（拥有所有权限）</label>
                </div>
              )}

              {/* 权限配置（仅在添加时显示，编辑在单独弹窗） */}
              {!editingAdmin && !formData.is_owner && (
                <div className="border-t border-mc-stone-dark pt-4">
                  <label className="block text-white text-sm mb-3 font-medium">权限配置</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(permissionLabels).map(([key, label]) => (
                      <div key={key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`perm_${key}`}
                          checked={formData.permissions[key as keyof Permissions]}
                          onChange={(e) => setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              [key]: e.target.checked
                            }
                          })}
                          className="w-4 h-4 rounded bg-transparent border-mc-stone-dark"
                        />
                        <label htmlFor={`perm_${key}`} className="text-mc-stone-light text-xs">{label}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingAdmin(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-3 bg-transparent border border-mc-stone-dark hover:bg-mc-stone-dark/20 text-white rounded-sm transition-all"
              >
                取消
              </button>
              <button
                onClick={editingAdmin ? handleUpdate : handleAdd}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-mc-stone-dark/40 hover:bg-mc-stone-dark/50 text-white rounded-sm transition-all disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 权限配置弹窗 */}
      {showPermissionModal && permissionAdmin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-mc-stone-dark rounded-sm p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 配置权限 - {permissionAdmin.display_name || permissionAdmin.username}
              </h2>
              <button
                onClick={async () => {
                  const allAdmins = await fetch('/api/admin/list').then(res => res.json());
                  if (allAdmins.success) {
                    const adminsWithPermission = allAdmins.data.filter((admin: Admin) => 
                      admin.permissions && admin.permissions.whitelist_review
                    );
                    
                    if (adminsWithPermission.length === 0) {
                      alert('警告：没有管理员拥有白名单审核权限！请至少为一个管理员开启此权限。');
                    }
                  }
                  
                  setShowPermissionModal(false);
                  setPermissionAdmin(null);
                }}
                className="text-mc-stone-light hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-5">
              {permissionCategories.map((category) => (
                <div key={category.name} className="bg-transparent rounded-sm p-4 border border-mc-stone-dark">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    {category.name}
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {category.permissions.map((key) => (
                      <div key={key} className="flex items-center justify-between bg-transparent rounded-sm p-3 hover:bg-white/5 transition-colors border border-white/10">
                        <span className="text-white">{permissionLabels[key]}</span>
                        {permissionAdmin.is_owner ? (
                          <button
                            disabled
                            className="px-3 py-1.5 rounded-sm text-sm transition-all font-medium bg-transparent border border-mc-stone text-mc-stone-light cursor-not-allowed"
                          >
                             允许
                          </button>
                        ) : (
                          <button
                            onClick={() => togglePermission(key)}
                            className={`px-3 py-1.5 rounded-sm text-sm transition-all font-medium ${
                              permissionAdmin.permissions[key]
                                ? 'bg-transparent border border-mc-stone text-white hover:bg-mc-stone-dark/20'
                                : 'bg-transparent border border-mc-stone-dark text-mc-stone-light hover:bg-mc-stone-dark/20'
                            }`}
                          >
                            {permissionAdmin.permissions[key] ? ' 允许' : ' 禁止'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="bg-transparent rounded-sm p-4 border border-mc-stone-dark">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                   邮件通知设置
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-transparent rounded-sm p-3 hover:bg-white/5 transition-colors border border-white/10">
                    <div>
                      <span className="text-white block">接收投诉举报邮件</span>
                      <span className="text-white/40 text-xs">当有新的投诉举报时发送邮件通知</span>
                    </div>
                    <button
                      onClick={() => setPermissionAdmin({
                        ...permissionAdmin,
                        receive_complaint_email: !permissionAdmin.receive_complaint_email
                      })}
                      className={`px-3 py-1.5 rounded-sm text-sm transition-all font-medium ${
                        permissionAdmin.receive_complaint_email
                          ? 'bg-transparent border border-mc-stone text-white hover:bg-mc-stone-dark/20'
                          : 'bg-transparent border border-mc-stone-dark text-mc-stone-light hover:bg-mc-stone-dark/20'
                      }`}
                    >
                      {permissionAdmin.receive_complaint_email ? ' 开启' : ' 关闭'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-transparent rounded-sm p-3 hover:bg-white/5 transition-colors border border-white/10">
                    <div>
                      <span className="text-white block">接收白名单申请邮件</span>
                      <span className="text-white/40 text-xs">当有新的白名单申请时发送邮件通知</span>
                    </div>
                    <button
                      onClick={() => setPermissionAdmin({
                        ...permissionAdmin,
                        receive_application_email: !permissionAdmin.receive_application_email
                      })}
                      className={`px-3 py-1.5 rounded-sm text-sm transition-all font-medium ${
                        permissionAdmin.receive_application_email
                          ? 'bg-transparent border border-mc-stone text-white hover:bg-mc-stone-dark/20'
                          : 'bg-transparent border border-mc-stone-dark text-mc-stone-light hover:bg-mc-stone-dark/20'
                      }`}
                    >
                      {permissionAdmin.receive_application_email ? ' 开启' : ' 关闭'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-transparent rounded-sm p-3 hover:bg-white/5 transition-colors border border-white/10">
                    <div>
                      <span className="text-white block">接收QQ机器人通知</span>
                      <span className="text-white/40 text-xs">当有新的白名单申请时发送QQ通知</span>
                      <span className="text-white/40 text-xs mt-1 block">预计未来上线</span>
                    </div>
                    <button
                      disabled
                      className="px-3 py-1.5 rounded-sm text-sm transition-all font-medium bg-transparent border border-mc-stone-dark text-white/40 cursor-not-allowed"
                    >
                      未开放
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={async () => {
                  const allAdmins = await fetch('/api/admin/list').then(res => res.json());
                  if (allAdmins.success) {
                    const adminsWithPermission = allAdmins.data.filter((admin: Admin) => 
                      admin.permissions && admin.permissions.whitelist_review
                    );
                    
                    if (adminsWithPermission.length === 0) {
                      alert('警告：没有管理员拥有白名单审核权限！请至少为一个管理员开启此权限。');
                    }
                  }
                  
                  setShowPermissionModal(false);
                  setPermissionAdmin(null);
                }}
                className="flex-1 px-4 py-3 bg-transparent border border-mc-stone-dark hover:bg-mc-stone-dark/20 text-white rounded-sm transition-all"
              >
                取消
              </button>
              <button
                onClick={async () => {
                  await handleUpdatePermissions();
                  
                  const allAdmins = await fetch('/api/admin/list').then(res => res.json());
                  if (allAdmins.success) {
                    const adminsWithPermission = allAdmins.data.filter((admin: Admin) => 
                      admin.permissions && admin.permissions.whitelist_review
                    );
                    
                    if (adminsWithPermission.length === 0) {
                      alert('警告：没有管理员拥有白名单审核权限！请至少为一个管理员开启此权限。');
                    }
                  }
                }}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-mc-stone-dark/40 hover:bg-mc-stone-dark/50 text-white rounded-sm transition-all disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存权限'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 批量权限修改弹窗 */}
      {showBatchPermissionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-mc-stone-dark/80 border-2 border-mc-stone-dark rounded-sm p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span></span> 批量配置权限 ({selectedIds.size} 个管理员)
              </h2>
              <button
                onClick={() => {
                  setShowBatchPermissionModal(false);
                }}
                className="text-mc-stone-light hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <p className="text-mc-stone-light text-sm mb-4">
              提示：点击权限按钮可切换三种状态：不修改 → 允许 → 禁止
            </p>
            
            <div className="space-y-5">
              {permissionCategories.map((category) => (
                <div key={category.name} className="bg-mc-stone-dark/80/30 rounded-sm p-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    {category.name}
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {category.permissions.map((key) => {
                      const state = batchPermissions[key];
                      let buttonClass = 'bg-mc-stone-dark/20 text-white border border-mc-stone-dark hover:bg-mc-stone-dark/40';
                      let buttonText = '━ 不修改';
                      
                      if (state === true) {
                        buttonClass = 'bg-white/20 text-white border border-mc-stone hover:bg-mc-stone';
                        buttonText = ' 允许';
                      } else if (state === false) {
                        buttonClass = 'bg-white/20 text-white border border-mc-stone hover:bg-mc-stone';
                        buttonText = ' 禁止';
                      }
                      
                      return (
                        <div key={key} className="flex items-center justify-between bg-mc-stone-dark/70/50 rounded-sm p-3 hover:bg-mc-stone-dark/70/70 transition-colors">
                          <span className="text-mc-stone-light">{permissionLabels[key]}</span>
                          <button
                            onClick={() => toggleBatchPermission(key)}
                            className={`px-3 py-1.5 rounded-sm text-sm transition-all font-medium ${buttonClass}`}
                          >
                            {buttonText}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="bg-mc-stone-dark/80/30 rounded-sm p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                   邮件通知设置
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-mc-stone-dark/70/50 rounded-sm p-3 hover:bg-mc-stone-dark/70/70 transition-colors">
                    <div>
                      <span className="text-mc-stone-light block">接收投诉举报邮件</span>
                      <span className="text-mc-stone-dark text-xs">当有新的投诉举报时发送邮件通知</span>
                    </div>
                    <button
                      onClick={() => setBatchReceiveComplaintEmail(
                        batchReceiveComplaintEmail === null ? true : (batchReceiveComplaintEmail === true ? false : null)
                      )}
                      className={`px-3 py-1.5 rounded-sm text-sm transition-all font-medium ${
                        batchReceiveComplaintEmail === null
                          ? 'bg-mc-stone-dark/20 text-white border border-mc-stone-dark hover:bg-mc-stone-dark/40'
                          : batchReceiveComplaintEmail
                          ? 'bg-white/20 text-white border border-mc-stone hover:bg-mc-stone'
                          : 'bg-white/20 text-white border border-mc-stone hover:bg-mc-stone'
                      }`}
                    >
                      {batchReceiveComplaintEmail === null ? '━ 不修改' : (batchReceiveComplaintEmail ? ' 开启' : ' 关闭')}
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-mc-stone-dark/70/50 rounded-sm p-3 hover:bg-mc-stone-dark/70/70 transition-colors">
                    <div>
                      <span className="text-mc-stone-light block">接收白名单申请邮件</span>
                      <span className="text-mc-stone-dark text-xs">当有新的白名单申请时发送邮件通知</span>
                    </div>
                    <button
                      onClick={() => setBatchReceiveApplicationEmail(
                        batchReceiveApplicationEmail === null ? true : (batchReceiveApplicationEmail === true ? false : null)
                      )}
                      className={`px-3 py-1.5 rounded-sm text-sm transition-all font-medium ${
                        batchReceiveApplicationEmail === null
                          ? 'bg-mc-stone-dark/20 text-white border border-mc-stone-dark hover:bg-mc-stone-dark/40'
                          : batchReceiveApplicationEmail
                          ? 'bg-white/20 text-white border border-mc-stone hover:bg-mc-stone'
                          : 'bg-white/20 text-white border border-mc-stone hover:bg-mc-stone'
                      }`}
                    >
                      {batchReceiveApplicationEmail === null ? '━ 不修改' : (batchReceiveApplicationEmail ? ' 开启' : ' 关闭')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowBatchPermissionModal(false);
                }}
                className="flex-1 px-4 py-3 bg-mc-stone-dark/70 hover:bg-mc-stone-dark/60 text-white rounded-sm transition-all"
              >
                取消
              </button>
              <button
                onClick={handleBatchUpdatePermissions}
                disabled={processing}
                className="flex-1 px-4 py-3 bg-mc-stone-dark/40 hover:bg-mc-stone-dark/50 text-white rounded-sm transition-all disabled:opacity-50"
              >
                {processing ? '保存中...' : '保存权限'}
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
          setDeleteUsername('');
        }}
        onConfirm={confirmDelete}
        title={isBatchDelete ? '批量删除管理员' : '删除管理员'}
        message={isBatchDelete 
          ? `确定要删除选中的 ${selectedIds.size} 个管理员吗？` 
          : `确定要删除管理员 "${deleteUsername}" 吗？`
        }
        count={isBatchDelete ? selectedIds.size : 1}
        itemName="个管理员"
        processing={processing}
      />
    </div>
  );
}
