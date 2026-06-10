'use client';

import React, { useState, useEffect } from 'react';

interface WebsiteConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroDesc: string;
  infoStatus: string;
  infoUptime: string;
  infoPlayers: string;
  card1Icon: string;
  card1Title: string;
  card1Desc: string;
  card2Icon: string;
  card2Title: string;
  card2Desc: string;
  card3Icon: string;
  card3Title: string;
  card3Desc: string;
  card4Icon: string;
  card4Title: string;
  card4Desc: string;
  aboutTitle: string;
  aboutDesc: string;
  rulesTitle: string;
  rules: string[];
  contactQQ: string;
  contactQQId: string;
}

const defaultConfig: WebsiteConfig = {
  heroTitle: 'Cloud tops 云顶之境',
  heroSubtitle: 'Minecraft 原版生存服务器',
  heroDesc: '一个由玩家共建的纯原版 Minecraft 生存社区。服务器为公益性质，不向玩家收取任何费用，旨在打造一个纯净、友好、充满创造乐趣的游戏环境。',
  infoStatus: ' 在线',
  infoUptime: '24/7 稳定运行',
  infoPlayers: '728 位玩家',
  card1Icon: '草方块.png',
  card1Title: '原版生存',
  card1Desc: '基于最新版本 Minecraft 的纯原版生存体验，不添加任何影响平衡的插件。',
  card2Icon: '红石.png',
  card2Title: '生电技术友好',
  card2Desc: '鼓励红石机械、自动化农场、大型工程，一起探索Minecraft的无限可能。',
  card3Icon: '床.png',
  card3Title: '永久公益',
  card3Desc: '服务器永远免费，由服主自愿维护，打造真正的玩家社区，无任何付费特权。',
  card4Icon: '虞美人.png',
  card4Title: '友好社区',
  card4Desc: '白名单审核确保每位玩家都遵守社区规范，共同维护友好的游戏环境。',
  aboutTitle: '关于服务器',
  aboutDesc: '云顶之境是一个专注于原版生存体验的 Minecraft 服务器。我们相信，最纯粹的游戏体验才是最有趣的。在这里，你可以自由探索、建造、交友，体验 Minecraft 最原始的魅力。',
  rulesTitle: '服务器规则',
  rules: [
    '禁止使用任何作弊客户端或外挂',
    '禁止恶意破坏他人建筑',
    '禁止骚扰、辱骂其他玩家',
    '禁止利用游戏漏洞获取不当利益',
    '尊重他人，友好交流'
  ],
  contactQQ: '',
  contactQQId: '',
};

export default function WebsiteEditorPage() {
  const [config, setConfig] = useState<WebsiteConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [availableIcons, setAvailableIcons] = useState<string[]>([
    '草方块.png',
    '红石.png',
    '床.png',
    '虞美人.png',
    '钻石.png',
  ]);

  useEffect(() => {
    fetchConfig();
    fetchIcons();
  }, []);

  const fetchIcons = async () => {
    try {
      const response = await fetch('/api/icons');
      const result = await response.json();
      if (result.success && result.icons) {
        setAvailableIcons(result.icons);
      }
    } catch (error) {
      console.error('获取图标列表失败:', error);
    }
  };

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/website/config');
      const result = await response.json();
      if (result.success && result.data) {
        if (result.data.elements) {
          const elements = result.data.elements;
          const getValue = (id: string, defaultVal: string) => {
            const el = elements.find((e: any) => e.id === id);
            return el?.content || defaultVal;
          };
          setConfig({
            heroTitle: getValue('hero-title', defaultConfig.heroTitle),
            heroSubtitle: getValue('hero-subtitle', defaultConfig.heroSubtitle),
            heroDesc: getValue('hero-desc', defaultConfig.heroDesc),
            infoStatus: getValue('info-status', defaultConfig.infoStatus),
            infoUptime: getValue('info-uptime', defaultConfig.infoUptime),
            infoPlayers: getValue('info-players', defaultConfig.infoPlayers),
            card1Icon: getValue('card1-icon', defaultConfig.card1Icon),
            card1Title: getValue('card1-title', defaultConfig.card1Title),
            card1Desc: getValue('card1-desc', defaultConfig.card1Desc),
            card2Icon: getValue('card2-icon', defaultConfig.card2Icon),
            card2Title: getValue('card2-title', defaultConfig.card2Title),
            card2Desc: getValue('card2-desc', defaultConfig.card2Desc),
            card3Icon: getValue('card3-icon', defaultConfig.card3Icon),
            card3Title: getValue('card3-title', defaultConfig.card3Title),
            card3Desc: getValue('card3-desc', defaultConfig.card3Desc),
            card4Icon: getValue('card4-icon', defaultConfig.card4Icon),
            card4Title: getValue('card4-title', defaultConfig.card4Title),
            card4Desc: getValue('card4-desc', defaultConfig.card4Desc),
            aboutTitle: getValue('about-title', defaultConfig.aboutTitle),
            aboutDesc: getValue('about-desc', defaultConfig.aboutDesc),
            rulesTitle: getValue('rules-title', defaultConfig.rulesTitle),
            rules: result.data.rules || defaultConfig.rules,
            contactQQ: result.data.contact_qq || defaultConfig.contactQQ,
            contactQQId: result.data.contact_qqid || defaultConfig.contactQQId,
          });
        } else {
          setConfig({
            ...defaultConfig,
            contactQQ: result.data.contact_qq || '',
            contactQQId: result.data.contact_qqid || '',
          });
        }
      }
    } catch (error) {
      console.error('获取配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const elements = [
        { id: 'hero-title', type: 'text', content: config.heroTitle, section: 'hero' },
        { id: 'hero-subtitle', type: 'text', content: config.heroSubtitle, section: 'hero' },
        { id: 'hero-desc', type: 'text', content: config.heroDesc, section: 'hero' },
        { id: 'info-status', type: 'text', content: config.infoStatus, section: 'info' },
        { id: 'info-uptime', type: 'text', content: config.infoUptime, section: 'info' },
        { id: 'info-players', type: 'text', content: config.infoPlayers, section: 'info' },
        { id: 'card1-icon', type: 'image', content: config.card1Icon, section: 'features' },
        { id: 'card1-title', type: 'text', content: config.card1Title, section: 'features' },
        { id: 'card1-desc', type: 'text', content: config.card1Desc, section: 'features' },
        { id: 'card2-icon', type: 'image', content: config.card2Icon, section: 'features' },
        { id: 'card2-title', type: 'text', content: config.card2Title, section: 'features' },
        { id: 'card2-desc', type: 'text', content: config.card2Desc, section: 'features' },
        { id: 'card3-icon', type: 'image', content: config.card3Icon, section: 'features' },
        { id: 'card3-title', type: 'text', content: config.card3Title, section: 'features' },
        { id: 'card3-desc', type: 'text', content: config.card3Desc, section: 'features' },
        { id: 'card4-icon', type: 'image', content: config.card4Icon, section: 'features' },
        { id: 'card4-title', type: 'text', content: config.card4Title, section: 'features' },
        { id: 'card4-desc', type: 'text', content: config.card4Desc, section: 'features' },
        { id: 'about-title', type: 'text', content: config.aboutTitle, section: 'about' },
        { id: 'about-desc', type: 'text', content: config.aboutDesc, section: 'about' },
        { id: 'rules-title', type: 'text', content: config.rulesTitle, section: 'rules' },
      ];

      const response = await fetch('/api/website/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          elements,
          rules: config.rules,
          contact_qq: config.contactQQ,
          contact_qqid: config.contactQQId,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setMessage(' 保存成功！');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(' 保存失败：' + result.message);
      }
    } catch (error) {
      setMessage(' 保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key: keyof WebsiteConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateRule = (index: number, value: string) => {
    setConfig(prev => ({
      ...prev,
      rules: prev.rules.map((r, i) => i === index ? value : r)
    }));
  };

  const addRule = () => {
    setConfig(prev => ({
      ...prev,
      rules: [...prev.rules, '新规则']
    }));
  };

  const removeRule = (index: number) => {
    setConfig(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mc-stone-dark/90">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce"></div>
          <div className="text-xl text-white">加载中...</div>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'hero', name: '首页横幅', icon: '' },
    { id: 'info', name: '服务器信息', icon: '' },
    { id: 'features', name: '特色功能', icon: '' },
    { id: 'about', name: '关于服务器', icon: '' },
    { id: 'rules', name: '服务器规则', icon: '' },
    { id: 'contact', name: '联系方式', icon: '' },
  ];

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 flex justify-between items-center shrink-0" style={{backgroundColor: 'rgba(30, 40, 60, 0.8)', borderBottom: '1px solid rgba(93, 122, 156, 0.3)'}}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-mc-green rounded-sm flex items-center justify-center text-xl flex-shrink-0 border-2 border-mc-green-dark">

          </div>
          <div className="flex-shrink-0">
            <h1 className="text-lg font-bold text-white">官网编辑器</h1>
            <p className="text-mc-stone-light text-xs">编辑主页内容后点击保存</p>
          </div>
        </div>

        <div className="flex gap-3 shrink-0">
          <a
            href="/"
            target="_blank"
            className="px-4 py-2 text-white rounded-sm font-medium transition-all flex items-center gap-2"
            style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(93, 122, 156, 0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(93, 122, 156, 0.8)';
            }}
          >
            <span></span>
            <span>预览主页</span>
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-sm font-medium transition-all flex items-center gap-2 text-white"
            style={{border: '1px solid rgba(138, 158, 255, 0.9)', backgroundColor: 'rgba(138, 158, 255, 0.9)', opacity: saving ? '0.5' : '1', cursor: saving ? 'not-allowed' : 'pointer'}}
            onMouseEnter={(e) => {
              if (!saving) e.currentTarget.style.backgroundColor = 'rgba(138, 158, 255, 1)';
            }}
            onMouseLeave={(e) => {
              if (!saving) e.currentTarget.style.backgroundColor = 'rgba(138, 158, 255, 0.9)';
            }}
          >
            <span></span>
            <span>{saving ? '保存中...' : '保存'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`mx-4 mt-2 p-2 rounded-sm shrink-0 text-sm ${
          message.includes('成功')
            ? 'bg-mc-green/20 border border-mc-green-light/50 text-mc-green-light'
            : 'bg-mc-red/20 border border-mc-red/50 text-mc-red'
        }`}>
          {message}
        </div>
      )}

      <div className="flex flex-1">
        <div className="w-48 h-full overflow-y-auto" style={{backgroundColor: 'rgba(30, 40, 60, 0.8)', borderRight: '1px solid rgba(93, 122, 156, 0.3)', marginRight: '16px'}}>
          <div className="p-4 pb-2">
            <h3 className="text-mc-stone-light text-sm mb-4 font-medium">页面区块</h3>
          </div>
          <div className="px-4 pb-4 space-y-2">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-sm transition-all flex items-center gap-3 ${
                  activeSection === section.id
                    ? 'text-white'
                    : 'text-mc-stone-light hover:text-white'
                }`}
                style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: activeSection === section.id ? 'rgba(93, 122, 156, 0.9)' : 'transparent'}}
                onMouseEnter={(e) => {
                  if (activeSection !== section.id) {
                    e.currentTarget.style.backgroundColor = 'rgba(93, 122, 156, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== section.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span>{section.icon}</span>
                <span className="text-sm">{section.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 h-full overflow-y-auto p-4">
          {activeSection === 'hero' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span></span> 首页横幅
              </h2>
              
              <div className="rounded-sm p-6 space-y-4" style={{backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
                <div>
                  <label className="block text-mc-stone-light text-sm mb-2 font-medium">服务器名称</label>
                  <input
                    type="text"
                    value={config.heroTitle}
                    onChange={(e) => updateConfig('heroTitle', e.target.value)}
                    className="w-full rounded-sm px-4 py-3 text-white focus:outline-none" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                  />
                </div>
                
                <div>
                  <label className="block text-mc-stone-light text-sm mb-2 font-medium">副标题</label>
                  <input
                    type="text"
                    value={config.heroSubtitle}
                    onChange={(e) => updateConfig('heroSubtitle', e.target.value)}
                    className="w-full rounded-sm px-4 py-3 text-white focus:outline-none" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                  />
                </div>
                
                <div>
                  <label className="block text-mc-stone-light text-sm mb-2 font-medium">简介描述</label>
                  <textarea
                    value={config.heroDesc}
                    onChange={(e) => updateConfig('heroDesc', e.target.value)}
                    rows={4}
                    className="w-full rounded-sm px-4 py-3 text-white focus:outline-none resize-none" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'info' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span></span> 服务器信息栏
              </h2>
              
              <div className="rounded-sm p-6 space-y-4" style={{backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
                <div>
                  <label className="block text-mc-stone-light text-sm mb-2 font-medium">服务器状态</label>
                  <div className="w-full rounded-sm px-4 py-3 text-white" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      服务器运行中
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-mc-stone-light text-sm mb-2 font-medium">运行时间</label>
                  <div className="w-full rounded-sm px-4 py-3 text-white" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
                    自动检测中...
                  </div>
                </div>
                
                <div>
                  <label className="block text-mc-stone-light text-sm mb-2 font-medium">玩家数量</label>
                  <div className="w-full rounded-sm px-4 py-3 text-white" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
                    自动检测中...
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'features' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span></span> 特色功能卡片
                <button
                  onClick={fetchIcons}
                  className="ml-2 px-3 py-1 text-white text-sm rounded transition-colors"
                  style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.3)'}}
                  title="刷新图标列表"
                >
                  刷新图标
                </button>
              </h2>
              
              {[1, 2, 3, 4].map(num => (
                <div key={num} className="rounded-sm p-6" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
                  <h3 className="text-lg font-medium text-white mb-4">卡片 {num}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-mc-stone-light text-sm mb-2 font-medium">图标</label>
                      <div className="grid grid-cols-5 gap-2">
                        {availableIcons.map(icon => (
                          <button
                            key={icon}
                            onClick={() => updateConfig(`card${num}Icon` as keyof WebsiteConfig, icon)}
                            className="p-2 rounded-sm border-2 transition-all flex flex-col items-center gap-1"
                            style={{border: `2px solid ${config[`card${num}Icon` as keyof WebsiteConfig] === icon ? 'rgba(138, 158, 255, 0.9)' : 'rgba(93, 122, 156, 0.9)'}`, backgroundColor: config[`card${num}Icon` as keyof WebsiteConfig] === icon ? 'rgba(138, 158, 255, 0.9)' : 'rgba(93, 122, 156, 0.8)'}}
                            onMouseEnter={(e) => {
                              if (config[`card${num}Icon` as keyof WebsiteConfig] !== icon) {
                                e.currentTarget.style.backgroundColor = 'rgba(93, 122, 156, 0.9)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (config[`card${num}Icon` as keyof WebsiteConfig] !== icon) {
                                e.currentTarget.style.backgroundColor = 'rgba(93, 122, 156, 0.8)';
                              }
                            }}
                          >
                            <img
                              src={`/images/${icon}`}
                              alt={icon}
                              className="w-8 h-8 object-contain"
                            />
                            <span className="text-xs text-mc-stone-dark truncate w-full text-center">{icon}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-mc-stone-light text-sm mb-2 font-medium">标题</label>
                      <input
                        type="text"
                        value={config[`card${num}Title` as keyof WebsiteConfig] as string}
                        onChange={(e) => updateConfig(`card${num}Title` as keyof WebsiteConfig, e.target.value)}
                        className="w-full rounded-sm px-4 py-3 text-white focus:outline-none" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-mc-stone-light text-sm mb-2 font-medium">描述</label>
                      <textarea
                        value={config[`card${num}Desc` as keyof WebsiteConfig] as string}
                        onChange={(e) => updateConfig(`card${num}Desc` as keyof WebsiteConfig, e.target.value)}
                        rows={2}
                        className="w-full rounded-sm px-4 py-3 text-white focus:outline-none resize-none" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'about' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span></span> 关于服务器
              </h2>
              
              <div className="rounded-sm p-6 space-y-4" style={{backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
                <div>
                  <label className="block text-mc-stone-light text-sm mb-2 font-medium">标题</label>
                  <input
                    type="text"
                    value={config.aboutTitle}
                    onChange={(e) => updateConfig('aboutTitle', e.target.value)}
                    className="w-full rounded-sm px-4 py-3 text-white focus:outline-none" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                  />
                </div>
                
                <div>
                  <label className="block text-mc-stone-light text-sm mb-2 font-medium">描述</label>
                  <textarea
                    value={config.aboutDesc}
                    onChange={(e) => updateConfig('aboutDesc', e.target.value)}
                    rows={5}
                    className="w-full rounded-sm px-4 py-3 text-white focus:outline-none resize-none" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'rules' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span></span> 服务器规则
              </h2>
              
              <div className="rounded-sm p-6 space-y-4" style={{backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
                <div>
                  <label className="block text-mc-stone-light text-sm mb-2 font-medium">标题</label>
                  <input
                    type="text"
                    value={config.rulesTitle}
                    onChange={(e) => updateConfig('rulesTitle', e.target.value)}
                    className="w-full rounded-sm px-4 py-3 text-white focus:outline-none" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-mc-stone-light text-sm font-medium">规则列表</label>
                    <button
                      onClick={addRule}
                      className="px-3 py-1 text-white text-sm rounded-sm transition-all"
                      style={{border: '1px solid rgba(138, 158, 255, 0.9)', backgroundColor: 'rgba(138, 158, 255, 0.9)'}}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(138, 158, 255, 1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(138, 158, 255, 0.9)';
                      }}
                    >
                      + 添加规则
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {config.rules.map((rule, index) => (
                      <div key={index} className="flex gap-3">
                        <span className="text-mc-stone-dark pt-3">{index + 1}.</span>
                        <input
                          type="text"
                          value={rule}
                          onChange={(e) => updateRule(index, e.target.value)}
                          className="flex-1 rounded-sm px-4 py-3 text-white focus:outline-none"
                          style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                        />
                        <button
                          onClick={() => removeRule(index)}
                          className="px-3 py-2 text-white rounded-sm transition-all"
                          style={{border: '1px solid rgba(239, 68, 68, 0.9)', backgroundColor: 'rgba(239, 68, 68, 0.9)'}}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.9)';
                          }}
                        >
                          
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'contact' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span></span> 联系方式
              </h2>
              
              <div className="rounded-sm p-6 space-y-4" style={{backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
                <div>
                  <label className="block text-mc-stone-light text-sm mb-2 font-medium">QQ群号</label>
                  <input
                    type="text"
                    value={config.contactQQ}
                    onChange={(e) => updateConfig('contactQQ', e.target.value)}
                    placeholder="例如: 123456789"
                    className="w-full rounded-sm px-4 py-3 text-white focus:outline-none" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                  />
                </div>
                
                <div>
                  <label className="block text-mc-stone-light text-sm mb-2 font-medium">QQ群链接ID</label>
                  <input
                    type="text"
                    value={config.contactQQId}
                    onChange={(e) => updateConfig('contactQQId', e.target.value)}
                    placeholder="例如: abc123xyz"
                    className="w-full rounded-sm px-4 py-3 text-white focus:outline-none" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
                  />
                  <p className="text-mc-stone-dark text-xs mt-1">用于生成加群链接: https://qm.qq.com/q/[ID]</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
