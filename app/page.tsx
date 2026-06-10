'use client';
import React, { useState, useEffect, useRef } from 'react';
import FeatureCard from './components/FeatureCard';
import SimpleImageCarousel from './components/SimpleImageCarousel';
import SponsorModal from './components/SponsorModal';
import ContactAdminModal from './components/ContactAdminModal';
import LegalModal from './components/LegalModal';
import AnnouncementModal from './components/AnnouncementModal';
import EventModal from './components/EventModal';

export default function HomePage() {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [isSponsorHovered, setIsSponsorHovered] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  // 安全地设置当前图片索引
  const safeSetCurrentImage = (index: number) => {
    const validIndex = Math.max(0, Math.min(index, 28));
    setCurrentImage(validIndex);
  };
  const [bgImagesLoaded, setBgImagesLoaded] = useState({
    bg1: false,
    bg2: false,
    bg3: false
  });
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLElement[]>([]);
  const whitelistSectionRef = useRef<HTMLElement>(null);
  
  // 公告、活动、黑名单相关状态
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [blacklist, setBlacklist] = useState<any[]>([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalType, setLegalType] = useState<'terms' | 'privacy' | 'copyright' | 'disclaimer'>('terms');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  // 网站配置状态
  const [websiteConfig, setWebsiteConfig] = useState<{
    server_name?: string;
    server_description?: string;
    welcome_message?: string;
    elements?: any[];
  }>({});
  
  // 获取公告、活动、黑名单数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [announcementsRes, eventsRes, blacklistRes] = await Promise.all([
          fetch('/api/announcements'),
          fetch('/api/events'),
          fetch('/api/blacklist')
        ]);
        
        const announcementsData = await announcementsRes.json();
        const eventsData = await eventsRes.json();
        const blacklistData = await blacklistRes.json();
        
        if (announcementsData.success && Array.isArray(announcementsData.data)) {
          setAnnouncements(announcementsData.data.slice(0, 3));
        }
        if (eventsData.success && Array.isArray(eventsData.data)) {
          setEvents(eventsData.data.filter((e: any) => e.status !== 'ended').slice(0, 3));
        }
        if (blacklistData.success && Array.isArray(blacklistData.data)) {
          setBlacklist(blacklistData.data.slice(0, 5));
        }
      } catch (error) {
        console.error('获取数据失败:', error);
      }
    };
    fetchData();
  }, []);
  
  // 获取网站配置
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/website/config');
        const result = await response.json();
        if (result.success && result.data) {
          setWebsiteConfig(result.data);
        }
      } catch (error) {
        console.error('获取网站配置失败:', error);
      }
    };
    fetchConfig();
  }, []);
  
  // 管理员登录相关状态
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<number | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // 服务器状态
  const [serverStatus, setServerStatus] = useState<{
    status: 'online' | 'offline' | 'maintenance';
    onlinePlayers: number;
    maxPlayers: number;
  }>({
    status: 'offline',
    onlinePlayers: 0,
    maxPlayers: 20
  });
  
  // 服务器版本
  const [serverVersion, setServerVersion] = useState<{
    version: string;
    serverType: string;
  }>({
    version: '1.20.4',
    serverType: 'Vanilla'
  });
  
  // 获取服务器状态
  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const response = await fetch('/api/server-status');
        const result = await response.json();
        if (result.success) {
          setServerStatus(result.data);
        }
      } catch (error) {
        console.error('获取服务器状态失败:', error);
        setServerStatus({
          status: 'offline',
          onlinePlayers: 0,
          maxPlayers: 20
        });
      }
    };
    
    // 获取服务器版本
    const fetchServerVersion = async () => {
      try {
        const response = await fetch('/api/server-version');
        const result = await response.json();
        if (result.success) {
          setServerVersion({
            version: result.data.version,
            serverType: result.data.serverType
          });
        }
      } catch (error) {
        console.error('获取服务器版本失败:', error);
        // 保持当前版本信息
      }
    };
    
    // 初始加载
    fetchServerStatus();
    fetchServerVersion();
    
    // 每30秒刷新一次
    const interval = setInterval(() => {
      fetchServerStatus();
      fetchServerVersion();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // 获取状态显示配置
  const getStatusConfig = () => {
    switch (serverStatus.status) {
      case 'online':
        return {
          text: '在线',
          color: 'bg-mc-green-light',
          animate: true
        };
      case 'maintenance':
        return {
          text: '维护中',
          color: 'bg-mc-gold',
          animate: false
        };
      default:
        return {
          text: '离线',
          color: 'bg-mc-red',
          animate: false
        };
    }
  };
  
  // 从 elements 获取内容的辅助函数
  const getElementContent = (id: string, defaultValue: string): string => {
    if (!websiteConfig.elements) return defaultValue;
    const element = websiteConfig.elements.find((el: any) => el.id === id);
    return element?.content || defaultValue;
  };
  
  // 从 elements 获取图标的辅助函数
  const getElementIcon = (id: string, defaultIcon: string): string => {
    if (!websiteConfig.elements) return defaultIcon;
    const element = websiteConfig.elements.find((el: any) => el.id === id);
    return element?.content || defaultIcon;
  };
  
  // 从后端检查登录状态
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/api/admin/check', {
          credentials: 'include'
        });
        const result = await response.json();
        if (result.success && result.admin) {
          setAdminLoggedIn(true);
          setAdminUser(result.admin.username);
          setAdminId(result.admin.adminId);
          setIsOwner(result.admin.isOwner || false);
        } else {
          setAdminLoggedIn(false);
          setAdminUser(null);
          setAdminId(null);
          setIsOwner(false);
        }
      } catch (error) {
        console.error('检查登录状态失败:', error);
        setAdminLoggedIn(false);
        setAdminUser(null);
        setAdminId(null);
        setIsOwner(false);
      }
    };
    
    checkLoginStatus();
  }, []);
  
  // Logo点击处理 - 连续点击5次显示登录弹窗（仅未登录时）
  const handleLogoClick = () => {
    if (adminLoggedIn) return;
    
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);
    
    if (newCount >= 5) {
      setShowAdminLogin(true);
      setLogoClickCount(0);
    }
    
    // 3秒后重置计数
    setTimeout(() => setLogoClickCount(0), 3000);
  };
  
  // 管理员登录
  const handleAdminLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      setLoginError('请输入用户名和密码');
      return;
    }
    
    setLoginLoading(true);
    setLoginError('');
    
    try {
      console.log('发送登录请求:', loginForm);
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
        credentials: 'include'
      });
      
      console.log('响应状态:', response.status);
      const result = await response.json();
      console.log('响应结果:', result);
      
      if (result.success) {
        setAdminLoggedIn(true);
        setAdminUser(result.user);
        setAdminId(result.adminId);
        setIsOwner(result.isOwner || false);
        setShowAdminLogin(false);
        setLoginForm({ username: '', password: '' });
        setLoginError('');
        
        // 登录成功，关闭弹窗，保持在当前页面
      } else {
        setLoginError(result.message || '登录失败');
      }
    } catch (error: any) {
      console.error('登录请求失败:', error);
      setLoginError('登录失败: ' + (error.message || '网络错误'));
    } finally {
      setLoginLoading(false);
    }
  };
  
  // 管理员登出
  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/logout', { 
        method: 'POST',
        credentials: 'include'
      });
    } catch { /* 即使接口失败也继续清理本地状态 */ }
    setAdminLoggedIn(false);
    setAdminUser(null);
    setAdminId(null);
    setIsOwner(false);
  };


  
  // 简单的滚动监听，只更新当前section指示器
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // 找到当前可见的section
      sectionsRef.current.forEach((section, index) => {
        if (section) {
          const rect = section.getBoundingClientRect();
          // 如果section的顶部在视口中部附近
          if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
            setCurrentSection(index);
          }
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // 背景图片预加载
  useEffect(() => {
    const preloadImages = async () => {
      const imagePaths = [
        '/images/主页背景图.webp',
        '/images/主页背景图2.webp',
        '/images/主页背景图3.webp',
        '/images/草方块.png',
        '/images/红石.png',
        '/images/床.png',
        '/images/虞美人.png',
        '/images/钻石.png',
        '/images/微信收款码.png',
        '/images/支付宝收款码.png'
      ];
      
      imagePaths.forEach((src) => {
        const img = new Image();
        img.onload = () => {
          console.log(`成功加载图片: ${src}`);
          if (src.includes('主页背景图')) {
            const bgKey = src.includes('主页背景图2') ? 'bg2' : 
                        src.includes('主页背景图3') ? 'bg3' : 'bg1';
            setBgImagesLoaded(prev => ({ ...prev, [bgKey]: true }));
          }
        };
        img.onerror = () => {
          console.warn(`无法加载图片: ${src}`);
        };
        img.src = src;
      });
    };
    
    preloadImages();
  }, []);
  
  // 处理弹窗打开/关闭
  useEffect(() => {
    if (showContactModal || showComplaintModal || showSponsorModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [showContactModal, showComplaintModal, showSponsorModal]);

  // 简化滚动到指定部分
  const scrollToSection = (index: number) => {
    if (sectionsRef.current[index]) {
      window.scrollTo({
        top: sectionsRef.current[index].offsetTop,
        behavior: 'smooth'
      });
      setCurrentSection(index);
    }
  };
  
  return (
    <div className="min-h-screen relative " ref={mainContainerRef}>
      {/* 背景图片 - 修复了空字符串问题 */}
      <div className="fixed inset-0 z-0">
        {/* 第一页背景图 */}
        <div 
          className="absolute inset-0 bg-center bg-no-repeat transition-opacity duration-1000" 
          style={{ 
            backgroundImage: bgImagesLoaded.bg1 
              ? 'url(/images/主页背景图.webp)' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: currentSection === 0 ? 1 : 0
          }}
        />
        
        {/* 第二页背景图 */}
        <div 
          className="absolute inset-0 bg-center bg-no-repeat transition-opacity duration-1000" 
          style={{ 
            backgroundImage: bgImagesLoaded.bg2 
              ? 'url(/images/主页背景图2.webp)' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: currentSection === 1 ? 1 : 0
          }}
        />
        
        {/* 第三页背景图 */}
        <div 
          className="absolute inset-0 bg-center bg-no-repeat transition-opacity duration-1000" 
          style={{ 
            backgroundImage: bgImagesLoaded.bg3 
              ? 'url(/images/主页背景图3.webp)' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: currentSection === 2 ? 1 : 0
          }}
        />
        
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/60 to-black/40"></div>
      </div>
      
      {/* 滚动指示器 */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 hidden md:flex flex-col space-y-3">
        {[0, 1, 2, 3, 4].map((index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 flex items-center justify-center ${
              index === currentSection 
                ? 'bg-mc-green w-4 h-4 ring-2 ring-mc-green-light ' 
                : 'bg-mc-stone hover:bg-mc-stone-dark'
            }`}
            aria-label={`跳转到第 ${index + 1} 部分`}
          >
            {index === currentSection && (
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            )}
          </button>
        ))}
      </div>
      
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-mc-dirt/90 backdrop-blur-md border-b border-mc-dirt border-pixel">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center space-x-2 cursor-pointer select-none"
                onClick={handleLogoClick}
              >
                <div className="w-12 h-12 border-2 border-dashed border-mc-stone flex items-center justify-center text-mc-stone text-xs select-none">Logo</div>
                <div className="text-sm md:text-xl font-bold text-mc-green-light">CT Cloud</div>
                <div className="text-sm md:text-xl font-bold text-white">云顶之境</div>
              </div>
            </div>
            
            {/* 桌面端菜单 */}
            <div className="hidden md:flex items-center space-x-1">
              <button 
                onClick={() => scrollToSection(0)}
                className={`nav-pixel-item text-mc-stone-light hover:text-white ${currentSection === 0 ? 'text-mc-green-light border-mc-green' : ''}`}
              >
                首页
              </button>
              <button 
                onClick={() => scrollToSection(1)}
                className={`nav-pixel-item text-mc-stone-light hover:text-white ${currentSection === 1 ? 'text-mc-green-light border-mc-green' : ''}`}
              >
                社区动态
              </button>
              <button 
                onClick={() => scrollToSection(2)}
                className={`nav-pixel-item text-mc-stone-light hover:text-white ${currentSection === 2 ? 'text-mc-green-light border-mc-green' : ''}`}
              >
                画廊
              </button>

              <button 
                onClick={() => {
                  if (whitelistSectionRef.current) {
                    whitelistSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-mc-stone hover:bg-mc-stone-dark text-white font-semibold py-2 px-4 rounded-sm transition duration-300 text-sm btn-mc"
              >
                申请白名单
              </button>
              {adminLoggedIn ? (
                <>
                  <a 
                    href="/apply/quick"
                    className="bg-mc-stone hover:bg-mc-stone-dark text-white font-semibold py-2 px-4 rounded-sm transition duration-300 text-sm btn-mc"
                  >
                    快速申请
                  </a>
                  <div className="relative group">
                    <button 
                      onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                      className="flex items-center space-x-2 text-mc-green-light hover:text-green-300 text-sm transition-colors duration-300">
                      <span>{adminUser}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className={`absolute right-0 mt-2 w-48 bg-mc-stone-dark border border-mc-stone-dark rounded-sm shadow-lg py-2 z-50 transition-all duration-300 ${isAdminDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'}`}>
                      <div className="px-4 py-2 border-b border-mc-stone-dark">
                        <div className="text-white text-sm font-medium">{adminUser}</div>
                        <div className="text-mc-stone text-xs">{isOwner ? '服主' : '管理员'}</div>
                      </div>
                      <a 
                        href="/admin/applications"
                        className="block px-4 py-2 text-sm text-mc-stone-light hover:bg-mc-stone-dark transition-colors duration-300"
                      >
                        管理后台
                      </a>
                      <button 
                        onClick={async () => {
                          try { 
                            await fetch('/api/admin/logout', { 
                              method: 'POST',
                              credentials: 'include'
                            }); 
                          } catch {}
                          setAdminLoggedIn(false);
                          setAdminUser(null);
                          setAdminId(null);
                          setIsOwner(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-mc-red hover:bg-mc-stone-dark transition-colors duration-300"
                      >
                        退出登录
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
            
            {/* 移动端菜单按钮 */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          
            {/* 移动端菜单 */}
            {isMobileMenuOpen && (
              <div className="md:hidden mt-2 pb-2 border-t border-mc-stone-dark pt-2">
                <div className="flex flex-col space-y-1">
                  <button onClick={() => { scrollToSection(0); setIsMobileMenuOpen(false); }} className="text-mc-stone-light hover:text-white py-2 px-3 text-left text-sm transition-colors duration-300">首页</button>
                  <button onClick={() => { scrollToSection(1); setIsMobileMenuOpen(false); }} className="text-mc-stone-light hover:text-white py-2 px-3 text-left text-sm transition-colors duration-300">社区动态</button>
                  <button onClick={() => { scrollToSection(2); setIsMobileMenuOpen(false); }} className="text-mc-stone-light hover:text-white py-2 px-3 text-left text-sm transition-colors duration-300">画廊</button>
                  <button onClick={() => { if (whitelistSectionRef.current) { whitelistSectionRef.current.scrollIntoView({ behavior: 'smooth' }); } setIsMobileMenuOpen(false); }} className="text-mc-stone-light hover:text-white py-2 px-3 text-left text-sm transition-colors duration-300">申请白名单</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* 第一部分：首页 */}
        <section 
          ref={el => { 
            if (el && !sectionsRef.current.includes(el)) {
              sectionsRef.current[0] = el;
            }
          }}
          className="min-h-screen flex items-center justify-center px-6 py-24"
        >
          <div className="container mx-auto text-center">
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-4">
              <span className="text-mc-green-light font-pixel text-pixel-glow">{getElementContent('hero-title', 'Cloud tops 云顶之境')}</span>
            </h1>
            <div className="pixel-separator w-64 mx-auto mb-6"></div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-6 text-white font-pixel">{getElementContent('hero-subtitle', 'Minecraft 原版生存服务器')}</h2>
            
            <p className="text-base md:text-lg lg:text-xl text-mc-stone-light max-w-3xl mx-auto mb-8 leading-relaxed px-4">
              {getElementContent('hero-desc', '一个由玩家共建的纯原版 Minecraft 生存社区。服务器为公益性质，不向玩家收取任何费用，旨在打造一个纯净、友好、充满创造乐趣的游戏环境。')}
            </p>
            
            <div className="inline-flex items-center justify-center flex-wrap space-x-4 bg-mc-dirt/80 backdrop-blur-sm px-4 py-3 rounded-full mb-12 border border-mc-stone-dark mx-4">
              <div className="flex items-center mb-2 md:mb-0">
                {serverStatus.status === 'online' || serverStatus.status === 'maintenance' ? (
                <div className={`pixel-status-dot ${serverStatus.status === 'online' ? 'online' : 'maintenance'} ${getStatusConfig().animate ? 'animate-pulse' : ''}`}></div>
                ) : (
                <img src="/images/redstone_block.png" alt="离线" className="w-4 h-4 pixelated" />
                )}
                <span className="text-white text-sm">{getStatusConfig().text}</span>
              </div>
              <span className="text-mc-stone hidden sm:inline">|</span>
              <span className="text-white text-sm">{serverStatus.onlinePlayers} / {serverStatus.maxPlayers} 人在线</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 px-4">
              <FeatureCard 
                icon={getElementIcon('card1-icon', '草方块.png')} 
                title={getElementContent('card1-title', '原版生存')} 
                description={getElementContent('card1-desc', '基于最新版本 Minecraft 的纯原版生存体验，不添加任何影响平衡的插件。')}
              />
              <FeatureCard 
                icon={getElementIcon('card2-icon', '红石.png')} 
                title={getElementContent('card2-title', '生电技术友好')} 
                description={getElementContent('card2-desc', '鼓励红石机械、自动化农场、大型工程，一起探索Minecraft的无限可能。')}
              />
              <FeatureCard 
                icon={getElementIcon('card3-icon', '床.png')} 
                title={getElementContent('card3-title', '永久公益')} 
                description={getElementContent('card3-desc', '服务器永远免费，由服主自愿维护，打造真正的玩家社区，无任何付费特权。')}
              />
              <FeatureCard 
                icon={getElementIcon('card4-icon', '虞美人.png')} 
                title={getElementContent('card4-title', '友好社区')} 
                description={getElementContent('card4-desc', '白名单审核确保每位玩家都遵守社区规范，共同维护友好的游戏环境。')}
              />
            </div>
            
            {/* 像素滚动提示 */}
            <div className="mt-6 pixel-scroll-hint">
              <span>SCROLL</span>
              <div className="arrow"></div>
              <div className="arrow"></div>
              <div className="arrow"></div>
            </div>
          </div>
        </section>

        {/* 第二部分：服务器介绍 */}
        <section 
          ref={el => { 
            if (el && !sectionsRef.current.includes(el)) {
              sectionsRef.current[1] = el;
            }
          }}
          className="min-h-screen flex items-center justify-center px-6 py-24"
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 text-white font-pixel">社区动态</h2>
            
            <div className="max-w-4xl mx-auto mb-8">
              <p className="text-base md:text-lg lg:text-xl text-mc-stone-light text-center mb-8 leading-relaxed">
                Cloud tops 云顶之境是一个专注于原版生存的Minecraft服务器，我们致力于为玩家提供一个纯净、稳定、友好的游戏环境。服务器采用白名单审核制度，确保每一位玩家都能在一个安全、和谐的环境中享受游戏。
              </p>
            </div>

            {/* 最新公告和近期活动 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {/* 公告区域 */}
              <div className="bg-mc-stone-dark/80 p-6 md:p-8 rounded-sm border border-mc-stone-dark min-h-[400px] md:min-h-[500px] border-pixel">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    <img src="/images/firework_rocket.png" alt="" className="w-8 h-8 pixelated" />最新公告
                  </h3>
                </div>
                {announcements.length > 0 ? (
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div 
                        key={announcement.id}
                        className="bg-mc-stone-dark/70 p-2 md:p-3 rounded-sm border border-mc-stone-dark hover:border-mc-gold cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedAnnouncement(announcement);
                          setShowAnnouncementModal(true);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {announcement.is_important && (
                              <span className="bg-mc-red/20 text-mc-red px-2 py-0.5 rounded text-xs">重要</span>
                            )}
                            <h4 className="text-white font-medium text-sm md:text-base">{announcement.title}</h4>
                          </div>
                          <span className="text-mc-stone-dark text-xs">{new Date(announcement.created_at).toLocaleDateString('zh-CN')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-mc-stone-dark text-center py-12">暂无公告</div>
                )}
              </div>
              
              {/* 活动区域 */}
              <div className="bg-mc-stone-dark/80 p-6 md:p-8 rounded-sm border border-mc-stone-dark min-h-[400px] md:min-h-[500px] border-pixel">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    <img src="/images/firework_rocket.png" alt="" className="w-8 h-8 pixelated" />近期活动
                  </h3>
                </div>
                {events.length > 0 ? (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div 
                        key={event.id}
                        className="bg-mc-stone-dark/70 p-2 md:p-3 rounded-sm border border-mc-stone-dark hover:border-green-500 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEventModal(true);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              event.status === 'ongoing' ? 'bg-mc-green-light/20 text-mc-green-light' :
                              event.status === 'upcoming' ? 'bg-mc-gold/20 text-mc-gold' :
                              'bg-mc-stone-dark/20 text-mc-stone'
                            }`}>
                              {event.status === 'ongoing' ? '进行中' : event.status === 'upcoming' ? '即将开始' : '已结束'}
                            </span>
                            <h4 className="text-white font-medium text-sm md:text-base">{event.title}</h4>
                          </div>
                          <span className="text-mc-stone-dark text-xs">
                            {new Date(event.start_time).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-mc-stone-dark text-center py-12">暂无活动</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 第三部分：服务器风采 */}
        <section 
          ref={el => { 
            if (el && !sectionsRef.current.includes(el)) {
              sectionsRef.current[2] = el;
            }
          }}
          className="min-h-screen flex items-center justify-center px-6 py-16"
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 text-white">画廊</h2>
            
            {/* 主要内容区域 */}
            <div className="bg-mc-stone-dark/80 rounded-sm border border-mc-stone-dark overflow-hidden border-pixel">
              {/* 顶部视频和轮播图 */}
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* 左侧视频 */}
                <div className="p-4 md:p-6">
                  <h3 className="text-xl md:text-2xl font-bold mb-3 text-white">宣传视频</h3>
                  <div className="w-full bg-mc-stone-dark/70 rounded-sm overflow-hidden">
                    <div className="aspect-video w-full">
                      <iframe 
                        src="//player.bilibili.com/player.html?isOutside=true&aid=113028121035948&bvid=BV1iPs7ehEs3&cid=500001663036289&p=1&autoplay=0" 
                        scrolling="no" 
                        frameBorder="no" 
                        allowFullScreen={true}
                        className="w-full h-full"
                        title="云顶之境服务器宣传视频"
                      ></iframe>
                    </div>
                  </div>
                </div>
                
                {/* 右侧轮播图 */}
                <div className="p-4 md:p-6 border-t border-mc-stone-dark lg:border-t-0 lg:border-l border-mc-stone-dark">
                  <h3 className="text-xl md:text-2xl font-bold mb-3 text-white">宣传图</h3>
                  <div className="w-full bg-mc-stone-dark/70 rounded-sm overflow-hidden">
                    <SimpleImageCarousel 
                      currentImage={currentImage} 
                      onImageChange={safeSetCurrentImage} 
                    />
                  </div>
                </div>
              </div>
              
              {/* 底部图片 */}
              <div className="p-4 md:p-6 border-t border-mc-stone-dark">
                <div className="flex items-center justify-between mb-4">
                  <button 
                    className={`text-mc-stone hover:text-white text-2xl md:text-3xl transition-colors duration-300 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    ‹
                  </button>
                  <h4 className="text-base md:text-lg font-semibold text-white">图片集</h4>
                  <button 
                    className={`text-mc-stone hover:text-white text-2xl md:text-3xl transition-colors duration-300 ${currentPage === 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => setCurrentPage(prev => Math.min(3, prev + 1))}
                    disabled={currentPage === 3}
                  >
                    ›
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {(() => {
                    const start = (currentPage - 1) * 10;
                    const end = Math.min(start + 10, 29);
                    const images = [];
                    for (let i = start + 1; i <= end; i++) {
                      images.push(i);
                    }
                    return images;
                  })().map((item) => (
                    <div 
                      key={item} 
                      className="bg-mc-stone-dark/70 rounded-sm border border-mc-stone-dark aspect-video overflow-hidden cursor-pointer transition-all duration-300 hover:border-mc-gold hover:scale-105"
                      onMouseEnter={() => safeSetCurrentImage(item - 1)}
                    >
                      <img 
                        src={`/images/${item}.webp`} 
                        alt={`宣传图 ${item}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 第四部分：白名单申请 */}
        <section 
          ref={el => { 
            if (el && !sectionsRef.current.includes(el)) {
              sectionsRef.current[3] = el;
            }
            whitelistSectionRef.current = el;
          }}
          className="min-h-screen flex items-center justify-center px-6 py-16"
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-white text-center font-pixel">申请白名单</h2>
            
            <div className="max-w-6xl mx-auto">
              {/* 黑名单区域 */}
              {blacklist.length > 0 && (
                <div className="bg-red-900/20 p-4 md:p-6 rounded-sm border border-red-700/50 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg md:text-xl font-bold text-mc-red flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6"><i className="icon-pixel icon-ban"></i></span>黑名单公示
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {blacklist.map((player) => (
                      <div key={player.id} className="bg-mc-stone-dark/80 p-2 md:p-3 rounded-sm border border-red-700/30 text-center">
                        <div className="text-white font-medium text-sm truncate">{player.minecraft_id}</div>
                        <div className="text-mc-red/70 text-xs mt-1">{player.reason || '违规玩家'}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-mc-red/60 text-xs mt-3 text-center">以上玩家因违反服务器规则已被永久封禁</p>
                </div>
              )}
              
              {/* 白名单申请 */}
              <div className="bg-mc-stone-dark/80 p-4 md:p-6 rounded-sm border border-mc-stone-dark mb-8 border-pixel">
                <p className="text-base md:text-lg text-mc-stone-light mb-4 md:mb-6 text-center">
                  为了维护纯净的游戏环境，我们采用白名单制度。申请通过后即可加入服务器，与各位玩家一起创造属于你们的 Minecraft 世界。
                </p>
                
                <div className="bg-mc-stone-dark/70 p-4 md:p-6 rounded-sm border border-mc-stone-dark mb-6">
                  <h4 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center justify-center gap-2"><img src="/images/enchanted_golden_apple.png" alt="" className="w-8 h-8 pixelated" />申请流程</h4>
                  <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-mc-green rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm">1</div>
                      <span className="text-mc-stone-light text-sm md:text-base">选择题目类型</span>
                    </div>
                    <div className="text-mc-stone-dark hidden md:block">→</div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-mc-green rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm">2</div>
                      <span className="text-mc-stone-light text-sm md:text-base">答题测试</span>
                    </div>
                    <div className="text-mc-stone-dark hidden md:block">→</div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-mc-green rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm">3</div>
                      <span className="text-mc-stone-light text-sm md:text-base">填写申请表</span>
                    </div>
                    <div className="text-mc-stone-dark hidden md:block">→</div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-mc-green rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm">4</div>
                      <span className="text-mc-stone-light text-sm md:text-base">等待审核</span>
                    </div>
                    <div className="text-mc-stone-dark hidden md:block">→</div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-mc-green rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm">5</div>
                      <span className="text-mc-stone-light text-sm md:text-base">邮件通知</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <button 
                    onClick={() => setShowTermsModal(true)}
                    className="bg-mc-green hover:bg-mc-green-dark text-white font-semibold py-2 md:py-3 px-6 md:px-8 rounded-sm text-sm md:text-lg transition duration-300 inline-block btn-mc"
                  >
                    开始申请
                  </button>
                </div>
                
                {/* 服务协议和隐私协议弹窗 */}
                {showTermsModal && (
                  <div className="fixed inset-0 bg-mc-dirt/90 flex items-center justify-center z-50 p-4">
                    <div className="bg-mc-stone-dark border border-mc-stone-dark rounded-sm p-4 md:p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl md:text-2xl font-bold text-white">服务协议与免责声明</h3>
                        <button 
                          onClick={() => setShowTermsModal(false)}
                          className="text-mc-stone hover:text-white text-xl"
                        >
                          ×
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-lg md:text-xl font-semibold text-mc-green-light mb-3">服务协议与免责声明</h4>
                          <div className="text-mc-stone-light space-y-2 text-sm">
                            <p>1. 本服务器仅为Minecraft爱好者提供游戏交流平台，不涉及任何商业活动。</p>
                            <p>2. 您在服务器内的行为必须遵守相关法律法规和服务器规则，不得从事任何违法违规活动。</p>
                            <p>3. 服务器管理员有权根据规则对违规玩家进行处罚，包括但不限于警告、禁言、封禁等。</p>
                            <p>4. 服务器不对玩家在游戏内的虚拟财产损失负责，包括但不限于物品丢失、建筑损坏等。</p>
                            <p>5. 服务器保留随时修改规则、关闭服务器或调整服务内容的权利，无需提前通知。</p>
                            <p>6. 您的申请信息将仅用于服务器审核和管理目的，我们会尽力保护您的个人信息，但不承担因不可抗力或第三方攻击导致的信息泄露责任。</p>
                            <p>7. 您在使用服务器服务过程中因自身原因导致的任何损失，服务器不承担赔偿责任。</p>
                            <p>8. 本协议的最终解释权归服务器管理团队所有。</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 space-y-4">
                        <div className="flex items-start space-x-2">
                          <input
                            type="checkbox"
                            id="agreeToTerms"
                            checked={agreeToTerms}
                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                            className="mt-1"
                          />
                          <label htmlFor="agreeToTerms" className="text-mc-stone-light text-sm">
                            我已阅读并同意上述服务协议与免责声明 <span className="text-red-500">*</span>
                          </label>
                        </div>
                        
                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowTermsModal(false)}
                            className="flex-1 bg-mc-stone-dark hover:bg-mc-stone text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-sm transition duration-300 btn-mc"
                          >
                            取消
                          </button>
                          <button
                            onClick={() => {
                              if (agreeToTerms) {
                                setShowTermsModal(false);
                                window.location.href = '/apply';
                              }
                            }}
                            disabled={!agreeToTerms}
                            className="flex-1 bg-mc-green hover:bg-mc-green-dark text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-sm transition duration-300 disabled:bg-mc-stone-dark disabled:cursor-not-allowed btn-mc"
                          >
                            同意并继续
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-mc-stone-dark/80 p-4 md:p-6 rounded-sm border border-mc-stone-dark border-pixel">
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-white text-center">社区规则</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div>
                    <h4 className="text-base md:text-lg font-semibold mb-3 text-mc-green-light">游戏规则</h4>
                    <ul className="space-y-2 text-mc-stone-light text-sm list-disc list-inside">
                      <li>禁止使用任何作弊客户端</li>
                      <li>禁止恶意破坏他人建筑</li>
                      <li>禁止盗取他人财物</li>
                      <li>尊重其他玩家</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-base md:text-lg font-semibold mb-3 text-mc-green-light">社区规范</h4>
                    <ul className="space-y-2 text-mc-stone-light text-sm list-disc list-inside">
                      <li>保持友好交流</li>
                      <li>互帮互助共同发展</li>
                      <li>遵守管理员安排</li>
                      <li>共建和谐社区</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 页脚 */}
        <section 
          ref={el => { 
            if (el && !sectionsRef.current.includes(el)) {
              sectionsRef.current[4] = el;
            }
          }}
          className="min-h-60 bg-mc-dirt/95 border-t border-mc-dirt flex items-center border-pixel"
        >
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-3">Cloud tops 云顶之境</h3>
                <p className="text-white mb-3 text-sm">一个由玩家共建的纯原版 Minecraft 生存社区，致力于打造纯净、友好的游戏环境。</p>
                <p className="text-white text-xs">© 2026 Cloud tops 云顶之境服务器</p>
              </div>
              <div>
                <h4 className="text-base md:text-lg font-bold text-white mb-3">快速导航</h4>
                <ul className="space-y-2 text-white text-sm">
                  <li>
                    <span 
                      onClick={() => scrollToSection(0)}
                      className="hover:text-mc-green-light cursor-pointer transition-colors duration-300 block"
                    >
                      首页
                    </span>
                  </li>
                  <li>
                    <span 
                      onClick={() => scrollToSection(1)}
                      className="hover:text-mc-green-light cursor-pointer transition-colors duration-300 block"
                    >
                      服务器介绍
                    </span>
                  </li>
                  <li>
                    <span 
                      onClick={() => scrollToSection(2)}
                      className="hover:text-mc-green-light cursor-pointer transition-colors duration-300 block"
                    >
                      服务器风采
                    </span>
                  </li>
                  <li>
                    <span 
                      onClick={() => scrollToSection(3)}
                      className="hover:text-mc-green-light cursor-pointer transition-colors duration-300 block"
                    >
                      申请白名单
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-base md:text-lg font-bold text-white mb-3">常见问题</h4>
                <ul className="space-y-2 text-white text-sm">
                  <li><span onClick={() => scrollToSection(3)} className="hover:text-mc-green-light cursor-pointer transition-colors duration-300 block">如何申请白名单？</span></li>
                  <li><span onClick={() => scrollToSection(3)} className="hover:text-mc-green-light cursor-pointer transition-colors duration-300 block">服务器有哪些规则？</span></li>
                  <li><span onClick={() => setShowContactModal(true)} className="hover:text-mc-green-light cursor-pointer transition-colors duration-300 block">如何加入QQ群？</span></li>
                  <li><span onClick={() => scrollToSection(0)} className="hover:text-mc-green-light cursor-pointer transition-colors duration-300 block">服务器IP地址是什么？</span></li>
                </ul>
              </div>
              <div>
                <h4 className="text-base md:text-lg font-bold text-white mb-3">法律声明</h4>
                <ul className="space-y-2 text-white text-sm">
                  <li>
                    <button 
                      onClick={() => {
                        setLegalType('terms');
                        setShowLegalModal(true);
                      }}
                      className="hover:text-white cursor-pointer transition-colors duration-300 block text-left"
                    >
                      服务条款
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => {
                        setLegalType('privacy');
                        setShowLegalModal(true);
                      }}
                      className="hover:text-white cursor-pointer transition-colors duration-300 block text-left"
                    >
                      隐私政策
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => {
                        setLegalType('copyright');
                        setShowLegalModal(true);
                      }}
                      className="hover:text-white cursor-pointer transition-colors duration-300 block text-left"
                    >
                      版权声明
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => {
                        setLegalType('disclaimer');
                        setShowLegalModal(true);
                      }}
                      className="hover:text-white cursor-pointer transition-colors duration-300 block text-left"
                    >
                      免责声明
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            <div className="pixel-divider mb-6"></div>
            <div className="pt-2 text-center text-white text-xs">
              <p>本服务器为玩家社群自发组建与维护，与 Mojang AB 无任何关联。</p>
              <p className="mt-2">遇到问题？请联系管理员 QQ: 123456789 或发送邮件至 admin@cloudtops.com</p>
            </div>
          </div>
        </section>
      </main>


      <div className="fixed bottom-4 right-4 flex flex-col space-y-2 z-50">
        <div className="relative"
          onMouseEnter={() => setIsSponsorHovered(true)}
          onMouseLeave={() => setIsSponsorHovered(false)}
        >
          <button 
            onClick={() => setShowSponsorModal(true)}
            className="bg-mc-green hover:bg-mc-green-dark text-white px-3 py-2 rounded-sm shadow-lg transition duration-300 flex items-center justify-center space-x-1 min-w-[120px] text-sm btn-mc"
            title="自愿赞助"
          >
            <img 
              src="/images/钻石.png" 
              alt="钻石" 
              className="w-6 h-6" 
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23ffffff' d='M19 12l-7 10-7-10 7-10z'/%3E%3C/svg%3E";
              }}
            />
            <span>自愿赞助</span>
          </button>
          
          {isSponsorHovered && (
            <div className="absolute bottom-full right-0 mb-2 bg-mc-stone-dark border border-mc-stone-dark rounded-sm shadow-lg px-3 py-1 whitespace-nowrap">
              <p className="text-white text-xs">点击查看赞助二维码</p>
            </div>
          )}
        </div>

        <button 
          onClick={() => setShowContactModal(true)}
          className="bg-mc-green hover:bg-mc-green-dark text-white px-3 py-2 rounded-sm shadow-lg transition duration-300 flex items-center justify-center space-x-1 min-w-[120px] text-sm btn-mc"
          title="联系管理"
        >
          <img src="/images/goat_horn.png" alt="联系" className="w-6 h-6 pixelated" />
          <span>联系管理</span>
        </button>


        <a 
          href="/complaint"
          className="bg-mc-red hover:bg-mc-red-dark text-white px-3 py-2 rounded-sm shadow-lg transition duration-300 flex items-center justify-center space-x-1 min-w-[120px] text-sm btn-mc"
          title="投诉举报"
        >
          <img src="/images/barrier.png" alt="投诉" className="w-6 h-6 pixelated" />
          <span>投诉举报</span>
        </a>
      </div>

      {/* 赞助二维码弹窗 */}
      <SponsorModal isOpen={showSponsorModal} onClose={() => setShowSponsorModal(false)} />

      {/* 联系管理弹窗 */}
      <ContactAdminModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
      
      {/* 法律声明弹窗 */}
      <LegalModal isOpen={showLegalModal} onClose={() => setShowLegalModal(false)} type={legalType} />
      
      {/* 公告弹窗 */}
      <AnnouncementModal isOpen={showAnnouncementModal} onClose={() => setShowAnnouncementModal(false)} announcement={selectedAnnouncement} />
      
      {/* 活动弹窗 */}
      <EventModal isOpen={showEventModal} onClose={() => setShowEventModal(false)} event={selectedEvent} />

      {/* 管理员登录弹窗 */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-mc-dirt/80 backdrop-blur-sm">
          <div className="bg-mc-stone-dark border border-mc-stone-dark rounded-sm p-8 w-full max-w-md mx-4 shadow-2xl border-pixel">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">管理员登录</h3>
            
            {loginError && (
              <div className="bg-mc-red/20 border border-red-500/50 text-mc-red px-4 py-2 rounded-sm mb-4 text-center">
                {loginError}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-mc-stone-light mb-2">用户名</label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  disabled={loginLoading}
                  className="w-full bg-mc-stone-dark border border-gray-600 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-mc-green disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="请输入用户名"
                />
              </div>
              <div>
                <label className="block text-mc-stone-light mb-2">密码</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  disabled={loginLoading}
                  className="w-full bg-mc-stone-dark border border-gray-600 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-mc-green disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="请输入密码"
                  onKeyDown={(e) => !loginLoading && e.key === 'Enter' && handleAdminLogin()}
                />
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowAdminLogin(false);
                  setLoginForm({ username: '', password: '' });
                  setLoginError('');
                }}
                disabled={loginLoading}
                className="flex-1 bg-mc-stone-dark hover:bg-mc-stone text-white py-3 rounded-sm transition-colors disabled:opacity-50 btn-mc"
              >
                取消
              </button>
              <button
                onClick={handleAdminLogin}
                disabled={loginLoading}
                className="flex-1 bg-mc-green hover:bg-mc-green-dark text-white py-3 rounded-sm transition-colors disabled:opacity-70 flex items-center justify-center gap-2 btn-mc"
              >
                {loginLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>登录中...</span>
                  </>
                ) : (
                  '登录'
                )}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}