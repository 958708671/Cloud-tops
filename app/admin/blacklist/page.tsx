'use client';

import { useState, useEffect } from 'react';

interface BlacklistEntry {
  id: number;
  minecraft_id: string;
  ip_address: string | null;
  reason: string;
  banned_by: string;
  banned_by_id: number | null;
  is_permanent: boolean;
  duration_minutes: number | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export default function BlacklistPage() {
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [revokingId, setRevokingId] = useState<number | null>(null);

  useEffect(() => {
    fetchBlacklist();
  }, [pagination.page]);

  const fetchBlacklist = async (searchTerm?: string) => {
    setLoading(true);
    try {
      const url = searchTerm 
        ? `/api/blacklist?search=${encodeURIComponent(searchTerm)}&page=${pagination.page}&limit=${pagination.limit}`
        : `/api/blacklist?page=${pagination.page}&limit=${pagination.limit}`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setEntries(result.entries);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('获取黑名单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchBlacklist(search);
  };

  const handleRemove = async (id: number, minecraftId: string) => {
    if (!confirm(`确定要将 ${minecraftId} 从黑名单移除吗？\n\n该操作将：\n1. 从黑名单移除\n2. 解封该IP地址`)) return;
    
    setRemovingId(id);
    
    try {
      const response = await fetch(`/api/blacklist?id=${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`已从黑名单移除并解封IP\n\n游戏ID：${minecraftId}`);
        fetchBlacklist();
      } else {
        alert(result.message || '操作失败');
      }
    } catch (error) {
      console.error('移除黑名单失败:', error);
      alert('操作失败，请重试');
    } finally {
      setRemovingId(null);
    }
  };

  const handleRevoke = async (id: number, minecraftId: string) => {
    if (!confirm(`确定要撤回 ${minecraftId} 的封禁吗？\n\n该操作将：\n1. 从黑名单移除\n2. 解封该IP地址\n3. 用户需重新提交白名单申请`)) return;
    
    setRevokingId(id);
    
    try {
      const response = await fetch(`/api/blacklist?id=${id}&action=revoke`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`已撤回封禁\n\n游戏ID：${minecraftId}\n\n用户将回到待审核状态，需要重新提交白名单申请`);
        fetchBlacklist();
      } else {
        alert(result.message || '操作失败');
      }
    } catch (error) {
      console.error('撤回封禁失败:', error);
      alert('操作失败，请重试');
    } finally {
      setRevokingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatExpiresAt = (expiresAt: string | null, isPermanent: boolean) => {
    if (isPermanent) return '永久';
    if (!expiresAt) return '-';
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return '已过期';
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}天${hours % 24}小时`;
    if (hours > 0) return `${hours}小时${minutes % 60}分钟`;
    return `${minutes}分钟`;
  };

  const getStatusBadge = (entry: BlacklistEntry) => {
    if (entry.is_permanent) {
      return <span className="px-2 py-1 text-white rounded text-xs" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}>永久封禁</span>;
    } else if (!entry.is_active || formatExpiresAt(entry.expires_at!, entry.is_permanent) === '已过期') {
      return <span className="px-2 py-1 text-mc-stone-light rounded text-xs" style={{border: '1px solid rgba(93, 122, 156, 0.8)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>已过期</span>;
    } else {
      return <span className="px-2 py-1 text-white rounded text-xs" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}>封禁中</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">黑名单管理</h1>
          <p className="text-mc-stone-light text-sm mt-1">管理被封禁的玩家和IP地址</p>
        </div>
      </div>

      <div className="flex gap-2 items-center justify-end">
        {showSearch && (
          <>
            <div
              className="transition-all duration-300 ease-out w-64"
              style={{overflow: 'hidden'}}
            >
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="搜索游戏ID或IP地址..."
                className="w-full rounded-sm px-3 py-2 text-white text-sm focus:outline-none"
                style={{border: '1px solid #5D7A9C', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
              />
            </div>
            <button
              onClick={() => { setSearch(''); setShowSearch(false); fetchBlacklist(); }}
              className="px-4 py-2 text-sm hover:bg-white/30 text-white rounded-sm transition-all whitespace-nowrap"
              style={{border: '1px solid #5D7A9C', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
            >
              重置
            </button>
          </>
        )}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="px-4 py-2 text-sm hover:bg-white/30 text-white rounded-sm transition-all whitespace-nowrap"
          style={{border: '1px solid #8A9EFF', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
        >
          搜索
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-4xl animate-bounce text-white">加载中...</div>
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-sm p-12 text-center" style={{border: '1px solid #2A3650', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
          <p className="text-mc-stone-light text-lg">暂无黑名单记录</p>
        </div>
      ) : (
        <>
          <div className="rounded-sm overflow-hidden" style={{backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
            <table className="w-full">
              <thead className="bg-transparent">
                <tr>
                  <th className="text-left px-4 py-3 text-mc-stone-light font-medium">游戏ID</th>
                  <th className="text-left px-4 py-3 text-mc-stone-light font-medium">IP地址</th>
                  <th className="text-left px-4 py-3 text-mc-stone-light font-medium">封禁原因</th>
                  <th className="text-left px-4 py-3 text-mc-stone-light font-medium">状态</th>
                  <th className="text-left px-4 py-3 text-mc-stone-light font-medium">封禁人</th>
                  <th className="text-left px-4 py-3 text-mc-stone-light font-medium">封禁时间</th>
                  <th className="text-left px-4 py-3 text-mc-stone-light font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{entry.minecraft_id}</td>
                    <td className="px-4 py-3 text-mc-stone-light font-mono text-sm">{entry.ip_address || '-'}</td>
                    <td className="px-4 py-3 text-mc-stone-light max-w-xs truncate" title={entry.reason}>
                      {entry.reason}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(entry)}
                    </td>
                    <td className="px-4 py-3 text-mc-stone-light">{entry.banned_by}</td>
                    <td className="px-4 py-3 text-mc-stone-light text-sm">{formatDate(entry.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRevoke(entry.id, entry.minecraft_id)}
                          disabled={revokingId === entry.id || removingId === entry.id}
                          className="px-3 py-1.5 hover:bg-white/30 disabled:opacity-50 text-white text-sm rounded-sm transition-all"
                          style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
                        >
                          {revokingId === entry.id ? '处理中...' : '撤回'}
                        </button>
                        <button
                          onClick={() => handleRemove(entry.id, entry.minecraft_id)}
                          disabled={removingId === entry.id || revokingId === entry.id}
                          className="px-3 py-1.5 hover:bg-white/30 disabled:opacity-50 text-white text-sm rounded-sm transition-all"
                          style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
                        >
                          {removingId === entry.id ? '处理中...' : '移除'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 hover:bg-white/30 disabled:opacity-50 text-white rounded-sm transition-all"
                style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
              >
                上一页
              </button>
              <span className="px-4 py-2 text-mc-stone-light">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 hover:bg-white/30 disabled:opacity-50 text-white rounded-sm transition-all"
                style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
