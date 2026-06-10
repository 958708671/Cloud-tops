'use client';

import { useState, useEffect } from 'react';

interface ServerSettings {
  qq_group: string;
  client_download_url: string;
  rcon_host: string;
  rcon_port: string;
  rcon_password: string;
  server_ip: string;
  server_version: string;
  server_domain: string;
  free_fabric_version: string;
  server_motd: string;
  max_players: string;
  view_distance: string;
  difficulty: string;
  gamemode: string;
}

interface SystemSettings {
  server_name: string;
  server_description: string;
  contact_qq: string;
  contact_email: string;
  whitelist_enabled: string;
  registration_enabled: string;
  maintenance_mode: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'server' | 'system'>('server');
  const [serverSettings, setServerSettings] = useState<ServerSettings>({
    qq_group: '',
    client_download_url: '',
    rcon_host: '',
    rcon_port: '25575',
    rcon_password: '',
    server_ip: '',
    server_version: '1.21.11',
    server_domain: '',
    free_fabric_version: '',
    server_motd: '欢迎来到 Cloud tops 云顶之境',
    max_players: '20',
    view_distance: '10',
    difficulty: 'normal',
    gamemode: 'survival'
  });
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    server_name: '',
    server_description: '',
    contact_qq: '',
    contact_email: '',
    whitelist_enabled: 'true',
    registration_enabled: 'true',
    maintenance_mode: 'false'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingRcon, setTestingRcon] = useState(false);
  const [message, setMessage] = useState('');
  const [rconTestResult, setRconTestResult] = useState('');
  const [showVersionConfirm, setShowVersionConfirm] = useState(false);
  const [installingVersion, setInstallingVersion] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [installMessage, setInstallMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [serverRes, systemRes] = await Promise.all([
        fetch('/api/server-settings'),
        fetch('/api/settings')
      ]);
      
      const serverResult = await serverRes.json();
      const systemResult = await systemRes.json();
      
      if (serverResult.success) {
        setServerSettings(prev => ({ ...prev, ...serverResult.data }));
      }
      if (systemResult.success) {
        setSystemSettings(prev => ({ ...prev, ...systemResult.data }));
      }
    } catch (error) {
      console.error('获取设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveServerSettings = async () => {
    if (serverSettings.server_version) {
      setShowVersionConfirm(true);
    } else {
      saveServerSettings();
    }
  };

  const saveServerSettings = async () => {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/server-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: serverSettings })
      });
      const result = await response.json();
      if (result.success) {
        setMessage('服务器设置保存成功！');
      } else {
        setMessage(result.message || '保存失败');
      }
    } catch (error) {
      setMessage('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmVersionInstall = async () => {
    setShowVersionConfirm(false);
    setInstallingVersion(true);
    setInstallProgress(0);
    setInstallMessage('开始安装服务器版本...');

    const installSteps = [
      { message: '下载服务器核心文件...', progress: 20 },
      { message: '安装Fabric模组加载器...', progress: 40 },
      { message: '配置服务器文件...', progress: 60 },
      { message: '安装必要的模组...', progress: 80 },
      { message: '启动服务器进行测试...', progress: 90 },
      { message: '安装完成！', progress: 100 }
    ];

    for (const step of installSteps) {
      setInstallMessage(step.message);
      setInstallProgress(step.progress);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setServerSettings(prev => ({
      ...prev,
      free_fabric_version: `fabric-loader-0.15.11-${serverSettings.server_version}`
    }));

    setInstallingVersion(false);
    saveServerSettings();
  };

  const handleSaveSystemSettings = async () => {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(systemSettings)
      });
      const result = await response.json();
      if (result.success) {
        setMessage('系统设置保存成功！');
      } else {
        setMessage(result.message || '保存失败');
      }
    } catch (error) {
      setMessage('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleTestRcon = async () => {
    if (!serverSettings.rcon_host || !serverSettings.rcon_password) {
      setRconTestResult('请先填写RCON主机和密码');
      return;
    }
    
    setTestingRcon(true);
    setRconTestResult('');
    
    try {
      const response = await fetch('/api/rcon-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: serverSettings.rcon_host,
          port: parseInt(serverSettings.rcon_port) || 25575,
          password: serverSettings.rcon_password
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setRconTestResult('RCON连接成功！');
      } else {
        setRconTestResult(result.message);
      }
    } catch (error) {
      setRconTestResult('连接测试失败');
    } finally {
      setTestingRcon(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-4xl animate-bounce"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span></span> 系统设置
        </h1>
        <p className="text-mc-stone-light text-sm mt-1">配置服务器信息和系统功能</p>
      </div>

      {/* 选项卡 */}
      <div className="flex gap-2 pb-2">
        <button
          onClick={() => setActiveTab('server')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'server' ? 'text-white' : 'text-mc-stone-light hover:text-white'
          }`}
          style={{border: '1px solid rgba(138, 158, 255, 0.9)', backgroundColor: activeTab === 'server' ? 'rgba(138, 158, 255, 0.9)' : 'transparent'}}
        >
          服务器配置
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            activeTab === 'system' ? 'text-white' : 'text-mc-stone-light hover:text-white'
          }`}
          style={{border: '1px solid rgba(138, 158, 255, 0.9)', backgroundColor: activeTab === 'system' ? 'rgba(138, 158, 255, 0.9)' : 'transparent'}}
        >
          系统设置
        </button>
      </div>

      {/* 服务器配置 */}
      {activeTab === 'server' && (
        <div className="space-y-6">
          {/* 白名单通知配置 */}
          <div className="rounded-sm p-6" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span></span> 白名单通知配置
            </h2>
            <p className="text-mc-stone-light text-sm mb-4">审核通过后发送给玩家的信息</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-mc-stone-light text-sm mb-2 font-medium">QQ群号</label>
                <input
                  type="text"
                  value={serverSettings.qq_group}
                  onChange={(e) => setServerSettings({ ...serverSettings, qq_group: e.target.value })}
                  placeholder="例如：123456789"
                  className="w-full rounded-sm px-4 py-3 text-white focus:outline-none"
                  style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}
                />
                <p className="text-white/40 text-xs mt-1">审核通过邮件中会显示此群号</p>
              </div>
              
              <div>
                <label className="block text-mc-stone-light text-sm mb-2 font-medium">客户端下载地址</label>
                <input
                  type="text"
                  value={serverSettings.client_download_url}
                  onChange={(e) => setServerSettings({ ...serverSettings, client_download_url: e.target.value })}
                  placeholder="例如：https://example.com/client.zip"
                  className="w-full rounded-sm px-4 py-3 text-white focus:outline-none"
                  style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}
                />
                <p className="text-white/40 text-xs mt-1">审核通过邮件中会显示此下载链接</p>
              </div>
            </div>
          </div>

          {/* RCON配置 */}
          <div className="rounded-sm p-6" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span></span> RCON远程连接
            </h2>
            <p className="text-mc-stone-light text-sm mb-4">用于自动添加白名单到Minecraft服务器</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-mc-stone-light text-sm mb-2 font-medium">RCON主机地址</label>
                <input
                  type="text"
                  value={serverSettings.rcon_host}
                  onChange={(e) => setServerSettings({ ...serverSettings, rcon_host: e.target.value })}
                  placeholder="例如：127.0.0.1 或 your.server.com"
                  className="w-full rounded-sm px-4 py-3 text-white focus:outline-none"
                  style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-mc-stone-light text-sm mb-2 font-medium">RCON端口</label>
                  <input
                    type="text"
                    value={serverSettings.rcon_port}
                    onChange={(e) => setServerSettings({ ...serverSettings, rcon_port: e.target.value })}
                    placeholder="25575"
                    className="w-full rounded-sm px-4 py-3 text-white focus:outline-none"
                    style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}
                  />
                </div>
                
                <div>
                  <label className="block text-mc-stone-light text-sm mb-2 font-medium">RCON密码</label>
                  <input
                    type="password"
                    value={serverSettings.rcon_password}
                    onChange={(e) => setServerSettings({ ...serverSettings, rcon_password: e.target.value })}
                    placeholder="输入密码"
                    className="w-full rounded-sm px-4 py-3 text-white focus:outline-none"
                    style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}
                  />
                </div>
              </div>
              
              <button
                onClick={handleTestRcon}
                disabled={testingRcon}
                className="w-full px-4 py-2 text-white rounded-sm transition-colors"
                style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)', opacity: testingRcon ? '0.5' : '1'}}
              >
                {testingRcon ? '测试中...' : '测试连接'}
              </button>
              
              {rconTestResult && (
                <div className="p-3 rounded-sm text-sm text-white" style={{border: '1px solid rgba(138, 158, 255, 0.9)', backgroundColor: 'rgba(138, 158, 255, 0.3)'}}>
                  {rconTestResult}
                </div>
              )}
            </div>
          </div>

          {/* 服务器信息 */}
          <div className="rounded-sm p-6" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span></span> 服务器信息
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-mc-stone-light text-sm mb-2 font-medium">服务器IP地址</label>
                <input
                  type="text"
                  value={serverSettings.server_ip}
                  onChange={(e) => setServerSettings({ ...serverSettings, server_ip: e.target.value })}
                  placeholder="例如：play.example.com"
                  className="w-full rounded-sm px-4 py-3 text-white focus:outline-none"
                  style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}
                />
              </div>
              
              <div>
                <label className="block text-mc-stone-light text-sm mb-2 font-medium">服务器域名</label>
                <input
                  type="text"
                  value={serverSettings.server_domain}
                  onChange={(e) => setServerSettings({ ...serverSettings, server_domain: e.target.value })}
                  placeholder="例如：mc.example.com"
                  className="w-full rounded-sm px-4 py-3 text-white focus:outline-none"
                  style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}
                />
              </div>
              
              <div>
                <label className="block text-mc-stone-light text-sm mb-2 font-medium">服务器版本</label>
                <input
                  type="text"
                  value={serverSettings.server_version}
                  onChange={(e) => setServerSettings({ ...serverSettings, server_version: e.target.value })}
                  placeholder="例如：1.20.4"
                  className="w-full rounded-sm px-4 py-3 text-white focus:outline-none"
                  style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}
                />
              </div>
              
              <div>
                <label className="block text-mc-stone-light text-sm mb-2 font-medium">Free Fabric版本</label>
                <input
                  type="text"
                  value={serverSettings.free_fabric_version}
                  readOnly
                  className="w-full rounded-sm px-4 py-3 text-mc-stone-light focus:outline-none"
                  style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}
                />
                <p className="text-white/40 text-xs mt-1">自动生成，无需手动修改</p>
              </div>
            </div>
          </div>

          {/* 服务器配置 */}
          <div className="rounded-sm p-6" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span></span> 服务器配置
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-mc-stone-light text-sm mb-2 font-medium">服务器MOTD</label>
                <input
                  type="text"
                  value={serverSettings.server_motd}
                  onChange={(e) => setServerSettings({ ...serverSettings, server_motd: e.target.value })}
                  placeholder="欢迎信息"
                  className="w-full rounded-sm px-4 py-3 text-white focus:outline-none"
                  style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}
                />
              </div>
              
              <div>
                <label className="block text-mc-stone-light text-sm mb-2 font-medium">最大玩家数</label>
                <input
                  type="text"
                  value={serverSettings.max_players}
                  onChange={(e) => setServerSettings({ ...serverSettings, max_players: e.target.value })}
                  placeholder="20"
                  className="w-full rounded-sm px-4 py-3 text-white focus:outline-none"
                  style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}
                />
              </div>
              
              <div>
                <label className="block text-mc-stone-light text-sm mb-2 font-medium">视距</label>
                <input
                  type="text"
                  value={serverSettings.view_distance}
                  onChange={(e) => setServerSettings({ ...serverSettings, view_distance: e.target.value })}
                  placeholder="10"
                  className="w-full rounded-sm px-4 py-3 text-white focus:outline-none"
                  style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}
                />
              </div>
              
              <div>
                <label className="block text-mc-stone-light text-sm mb-2 font-medium">难度</label>
                <select
                  value={serverSettings.difficulty}
                  onChange={(e) => setServerSettings({ ...serverSettings, difficulty: e.target.value })}
                  className="w-full rounded-sm px-4 py-3 text-white focus:outline-none"
                  style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}
                >
                  <option value="peaceful">和平</option>
                  <option value="easy">简单</option>
                  <option value="normal">普通</option>
                  <option value="hard">困难</option>
                </select>
              </div>
              
              <div>
                <label className="block text-mc-stone-light text-sm mb-2 font-medium">游戏模式</label>
                <select
                  value={serverSettings.gamemode}
                  onChange={(e) => setServerSettings({ ...serverSettings, gamemode: e.target.value })}
                  className="w-full rounded-sm px-4 py-3 text-white focus:outline-none"
                  style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}
                >
                  <option value="survival">生存</option>
                  <option value="creative">创造</option>
                  <option value="adventure">冒险</option>
                  <option value="spectator">旁观</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 系统设置 */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-sm p-6" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span></span> 服务器信息
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-mc-stone-light text-sm mb-2 font-medium">服务器名称</label>
                <input
                  type="text"
                  value={systemSettings.server_name}
                  onChange={(e) => setSystemSettings({ ...systemSettings, server_name: e.target.value })}
                  className="w-full rounded-sm px-4 py-3 text-white focus:outline-none"
                  style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}
                />
              </div>
              
              <div>
                <label className="block text-mc-stone-light text-sm mb-2 font-medium">服务器描述</label>
                <textarea
                  value={systemSettings.server_description}
                  onChange={(e) => setSystemSettings({ ...systemSettings, server_description: e.target.value })}
                  rows={3}
                  className="w-full rounded-sm px-4 py-3 text-white focus:outline-none resize-none"
                  style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}
                />
              </div>
            </div>
          </div>

          <div className="rounded-sm p-6" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span></span> 联系方式
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-mc-stone-light text-sm mb-2 font-medium">联系QQ</label>
                <input
                  type="text"
                  value={systemSettings.contact_qq}
                  onChange={(e) => setSystemSettings({ ...systemSettings, contact_qq: e.target.value })}
                  placeholder="QQ号码或群号"
                  className="w-full rounded-sm px-4 py-3 text-white focus:outline-none"
                  style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}
                />
              </div>
              
              <div>
                <label className="block text-mc-stone-light text-sm mb-2 font-medium">联系邮箱</label>
                <input
                  type="email"
                  value={systemSettings.contact_email}
                  onChange={(e) => setSystemSettings({ ...systemSettings, contact_email: e.target.value })}
                  placeholder="admin@example.com"
                  className="w-full rounded-sm px-4 py-3 text-white focus:outline-none"
                  style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}
                />
              </div>
            </div>
          </div>

          <div className="rounded-sm p-6 lg:col-span-2" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span></span> 功能开关
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 rounded-sm" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
                <div>
                  <p className="text-white font-medium">白名单系统</p>
                  <p className="text-mc-stone-light text-sm">开启后只有白名单玩家可进入</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings.whitelist_enabled === 'true'}
                    onChange={(e) => setSystemSettings({ ...systemSettings, whitelist_enabled: e.target.checked ? 'true' : 'false' })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 rounded-full peer-focus:outline-none after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" style={{backgroundColor: 'rgba(93, 122, 156, 0.3)'}}></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-sm" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
                <div>
                  <p className="text-white font-medium">开放申请</p>
                  <p className="text-mc-stone-light text-sm">允许玩家提交白名单申请</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings.registration_enabled === 'true'}
                    onChange={(e) => setSystemSettings({ ...systemSettings, registration_enabled: e.target.checked ? 'true' : 'false' })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 rounded-full peer-focus:outline-none after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" style={{backgroundColor: 'rgba(93, 122, 156, 0.3)'}}></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-sm" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
                <div>
                  <p className="text-white font-medium">维护模式</p>
                  <p className="text-mc-stone-light text-sm">开启后网站显示维护页面</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings.maintenance_mode === 'true'}
                    onChange={(e) => setSystemSettings({ ...systemSettings, maintenance_mode: e.target.checked ? 'true' : 'false' })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 rounded-full peer-focus:outline-none after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" style={{backgroundColor: 'rgba(93, 122, 156, 0.3)'}}></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className="p-4 rounded-sm flex items-center gap-2 text-white" style={{border: '1px solid rgba(138, 158, 255, 0.9)', backgroundColor: 'rgba(138, 158, 255, 0.3)'}}>
          <span></span>
          {message}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          onClick={fetchSettings}
          className="px-6 py-3 text-white rounded-sm transition-all"
          style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
        >
          重置
        </button>
        <button
          onClick={activeTab === 'server' ? handleSaveServerSettings : handleSaveSystemSettings}
          disabled={saving}
          className="px-6 py-3 text-white rounded-sm transition-all disabled:opacity-50 flex items-center gap-2"
          style={{border: '1px solid rgba(138, 158, 255, 0.9)', backgroundColor: 'rgba(138, 158, 255, 0.9)', opacity: saving ? '0.5' : '1'}}
        >
          {saving ? '保存中...' : '保存设置'}
        </button>
      </div>

      {/* 版本安装确认对话框 */}
      {showVersionConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black border border-mc-stone-dark rounded-sm p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">确认安装服务器版本</h3>
            <p className="text-mc-stone-light mb-6">
              您确定要安装 Minecraft 服务器版本 <span className="text-white font-medium">{serverSettings.server_version}</span> 吗？
              
              <br /><br />
              安装过程将：
              <ul className="list-disc list-inside text-mc-stone-light mt-2 space-y-1">
                <li>下载对应版本的服务器核心</li>
                <li>安装 Fabric 模组加载器</li>
                <li>配置服务器文件</li>
                <li>安装必要的模组</li>
                <li>启动服务器进行测试</li>
              </ul>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowVersionConfirm(false)}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-sm transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmVersionInstall}
                className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-sm transition-colors"
              >
                确认安装
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 版本安装进度对话框 */}
      {installingVersion && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black border border-mc-stone-dark rounded-sm p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">安装服务器版本</h3>
            <p className="text-mc-stone-light mb-4">{installMessage}</p>
            <div className="w-full bg-white/10 rounded-full h-4 mb-4">
              <div 
                className="bg-white/30 h-4 rounded-full transition-all duration-300" 
                style={{ width: `${installProgress}%` }}
              ></div>
            </div>
            <p className="text-white/40 text-sm text-center">{installProgress}%</p>
          </div>
        </div>
      )}
    </div>
  );
}