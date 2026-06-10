'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function PasswordModal({ adminId, onClose }: { adminId: number; onClose: () => void }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage('请填写所有字段');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('两次输入的新密码不一致');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('密码长度至少6位');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId,
          oldPassword,
          newPassword
        }),
        credentials: 'include'
      });

      const result = await response.json();
      if (result.success) {
        setMessage('密码修改成功！');
        setTimeout(() => onClose(), 1500);
      } else {
        setMessage(result.message || '修改失败');
      }
    } catch (error) {
      setMessage('修改失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-mc-stone-dark/90 border border-mc-stone-dark rounded-sm p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-white">修改密码</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-white text-sm mb-2">原密码</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-mc-stone-dark rounded-sm text-white focus:outline-none focus:border-mc-stone-light transition-colors"
              placeholder="请输入原密码"
            />
          </div>

          <div>
            <label className="block text-white text-sm mb-2">新密码</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-mc-stone-dark rounded-sm text-white focus:outline-none focus:border-mc-stone-light transition-colors"
              placeholder="请输入新密码"
            />
          </div>

          <div>
            <label className="block text-white text-sm mb-2">确认新密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-mc-stone-dark rounded-sm text-white focus:outline-none focus:border-mc-stone-light transition-colors"
              placeholder="请再次输入新密码"
            />
          </div>

          {message && (
            <div className="text-sm text-white">
              {message}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-transparent border border-mc-stone-dark hover:bg-mc-stone-dark/30 text-mc-stone-light rounded-sm transition-colors font-medium"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-mc-stone-dark/60 hover:bg-mc-stone-dark/80 text-white rounded-sm transition-colors font-medium disabled:opacity-50"
          >
            {loading ? '修改中...' : '确认修改'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface AdminInfo {
  user: string;
  adminId: number;
  qq: string;
  isOwner: boolean;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [qqAvatarLoaded, setQqAvatarLoaded] = useState(false);
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
            qq: result.admin.qq,
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
    if (adminInfo?.qq) {
      const timer = setTimeout(() => {
        setQqAvatarLoaded(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [adminInfo?.qq]);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setSidebarCollapsed(false);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setSidebarCollapsed(true);
    }, 300);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch { /* 即使接口失败也继续清理本地状态 */ }
    window.location.href = '/';
  };

  const adminMenuItems = [
    { category: '审核管理', items: [
      { name: '白名单审核', path: '/admin/applications' },
      { name: '投诉处理', path: '/admin/complaints' },
    ]},
    { category: '玩家管理', items: [
      { name: '白名单列表', path: '/admin/whitelist' },
      { name: '黑名单管理', path: '/admin/blacklist' },
    ]},
    { category: '内容管理', items: [
      { name: '官网编辑', path: '/admin/website' },
      { name: '公告管理', path: '/admin/announcements' },
      { name: '活动管理', path: '/admin/events' },
    ]},
    { category: '数据统计', items: [
      { name: '数据面板', path: '/admin/statistics' },
    ]},
    { category: '系统帮助', items: [
      { name: '管理员守则', path: '/admin/guidelines' },
    ]},
  ];

  const ownerMenuItems = [
    { category: '审核管理', items: [
      { name: '白名单审核', path: '/admin/applications' },
      { name: '投诉监管', path: '/admin/complaints-supervise' },
    ]},
    { category: '玩家管理', items: [
      { name: '白名单列表', path: '/admin/whitelist' },
      { name: '黑名单管理', path: '/admin/blacklist' },
    ]},
    { category: '内容管理', items: [
      { name: '官网编辑', path: '/admin/website' },
      { name: '公告管理', path: '/admin/announcements' },
      { name: '活动管理', path: '/admin/events' },
    ]},
    { category: '数据统计', items: [
      { name: '数据面板', path: '/admin/statistics' },
    ]},
    { category: '服主专属', items: [
      { name: '管理员管理', path: '/admin/admins' },
      { name: '答题次数管理', path: '/admin/quiz-attempts' },
      { name: '操作日志', path: '/admin/logs' },
      { name: '系统设置', path: '/admin/settings' },
    ]},
    { category: '系统帮助', items: [
      { name: '管理员守则', path: '/admin/guidelines' },
    ]},
  ];

  if (!adminInfo) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-white font-bold">加载中...</div>
        </div>
      </div>
    );
  }

  const menuCategories = adminInfo.isOwner ? ownerMenuItems : adminMenuItems;

  return (
    <div className="h-screen overflow-hidden relative" style={{
      backgroundImage: 'url("/images/管理员后台背景图.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <aside
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`${
          sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
        } absolute left-0 top-0 bg-mc-stone-dark/70 backdrop-blur-xl border-r border-mc-stone-dark transition-all duration-300 flex flex-col z-20 h-full w-72`}
      >
        <div className="p-4 border-b border-mc-stone-dark flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                管理后台
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-8 h-8 bg-mc-stone-dark/40 border border-mc-stone-dark rounded-sm overflow-hidden flex items-center justify-center">
                  {adminInfo.qq && qqAvatarLoaded ? (
                    <img
                      src={`https://q.qlogo.cn/g?b=qq&nk=${adminInfo.qq}&s=100`}
                      alt="QQ头像"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'w-full h-full bg-mc-stone-dark/40 flex items-center justify-center text-sm font-bold text-white';
                          fallback.textContent = adminInfo.user.charAt(0).toUpperCase();
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-mc-stone-dark/40 flex items-center justify-center text-sm font-bold text-white">
                      {adminInfo.user.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{adminInfo.user}</p>
                  <p className="text-mc-stone-light text-xs">{adminInfo.isOwner ? '服主' : '管理员'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-3">
          {menuCategories.map((category, idx) => (
            <CategoryModule
              key={idx}
              category={category}
              pathname={pathname}
              collapsed={false}
            />
          ))}
        </nav>

        <div className="p-3 border-t border-mc-stone-dark space-y-2 flex-shrink-0">
          <Link
            href="/"
            className="w-full flex items-center justify-center px-4 py-2.5 bg-mc-green/90 border border-mc-green-light/50 hover:bg-mc-green text-white rounded-sm transition-all text-sm font-medium"
          >
            <span>返回主页</span>
          </Link>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-mc-stone-dark/90 border border-mc-stone hover:bg-mc-stone text-white rounded-sm transition-all text-sm font-medium"
          >
            <span>修改密码</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-mc-red/90 border border-mc-red/50 hover:bg-mc-red text-white rounded-sm transition-all font-medium"
          >
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {sidebarCollapsed && (
        <div
          onMouseEnter={handleMouseEnter}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 cursor-pointer"
        >
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="w-6 h-32 bg-mc-stone-dark/70 backdrop-blur-xl border-y border-r border-mc-stone-dark rounded-r-sm flex items-center justify-center hover:bg-mc-stone-dark/40 transition-all"
          >
            <svg className="w-3 h-3 text-mc-stone-dark" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5l8 7-8 7V5z" />
            </svg>
          </button>
        </div>
      )}

      <main className="absolute inset-0 overflow-y-auto overflow-x-hidden z-10">
        <div className={`h-full ${pathname === '/admin/website' ? '' : 'p-6'}`}>{children}</div>
      </main>

      {showPasswordModal && (
        <PasswordModal
          adminId={adminInfo.adminId}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
}

function CategoryModule({ category, pathname, collapsed }: { category: any; pathname: string; collapsed: boolean }) {
  const [expanded, setExpanded] = useState(true);

  const isActive = category.items.some((item: any) => pathname === item.path);

  if (collapsed) {
    return (
      <div className="space-y-1">
        {category.items.map((item: any) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center justify-center px-3 py-2.5 rounded-sm transition-all ${
              pathname === item.path
                ? 'bg-mc-stone-dark/40 text-white'
                : 'text-mc-stone-light hover:bg-mc-stone-dark/20 hover:text-white'
            }`}
          >
            <span className="font-medium text-sm">{item.name}</span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className={`border rounded-sm transition-all duration-300 ${
      isActive
        ? 'border-mc-stone-light bg-transparent'
        : 'border-mc-stone-dark hover:border-mc-stone-light'
    }`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className={`font-semibold text-sm ${
          isActive ? 'text-white' : 'text-mc-stone-light'
        }`}>
          {category.category}
        </span>
        <svg
          className={`w-3 h-3 text-mc-stone-light transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M8 5l8 7-8 7V5z" />
        </svg>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-1">
          {category.items.map((item: any) => (
            <Link
              key={item.path}
              href={item.path}
              className={`block px-3 py-2 rounded-sm text-sm transition-all ${
                pathname === item.path
                  ? 'bg-mc-stone-dark/40 text-white font-medium'
                  : 'text-mc-stone-light hover:bg-mc-stone-dark/20 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}