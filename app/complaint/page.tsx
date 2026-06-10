'use client';
import React, { useState } from 'react';

export default function ComplaintPage() {
  const [formData, setFormData] = useState({
    reporterName: '',
    reporterQQ: '',
    targetPlayer: '',
    violationYear: '',
    violationMonth: '',
    violationDay: '',
    violationHour: '',
    violationMinute: '',
    violationTime: '',
    violationType: '',
    description: '',
    evidence: ''
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [useDatePicker, setUseDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const violationCategories = [
    { category: '破坏行为', types: ['破坏他人房屋', '破坏公共设施', '故意烧毁建筑', '炸毁他人基地', '破坏红石电路', '破坏农场/牧场'], icon: '💥' },
    { category: '地形破坏', types: ['恶意挖空地形', '制造岩浆陷阱', '制造深坑陷阱', '破坏地形美观'], icon: '🏔️' },
    { category: '偷窃行为', types: ['偷窃箱子物品', '偷窃展示框物品', '偷窃盔甲架装备', '偷窃矿车/船只', '偷窃宠物', '偷窃农作物'], icon: '📦' },
    { category: '侵占行为', types: ['强占他人房屋', '在他人家中建造', '堵塞他人通道', '恶意包围他人建筑'], icon: '🏠' },
    { category: '作弊外挂', types: ['使用Xray透视', '使用飞行外挂', '使用加速外挂', '使用杀戮光环', '使用自动点击器', '使用穿墙外挂', '使用无敌外挂', '使用瞬移外挂'], icon: '⚡' },
    { category: '漏洞利用', types: ['利用刷物品漏洞', '利用复制漏洞', '利用透视漏洞', '利用伤害漏洞', '利用游戏机制漏洞'], icon: '🔧' },
    { category: '脚本使用', types: ['使用挖矿脚本', '使用钓鱼脚本', '使用种植脚本', '使用攻击脚本', '使用移动脚本', '使用建造脚本'], icon: '🤖' },
    { category: '恶意PVP', types: ['恶意击杀其他玩家', '恶意攻击其他玩家', '恶意追杀其他玩家', '恶意堵截其他玩家', '利用游戏机制击杀', '恶意卡位', '恶意消耗'], icon: '⚔️' },
    { category: '骚扰行为', types: ['言语骚扰', '跟踪骚扰', '恶意打扰', '持续攻击', '恶意举报', '造谣诽谤'], icon: '😤' },
    { category: '威胁行为', types: ['威胁人身安全', '威胁破坏建筑', '威胁盗取账号', '威胁泄露信息', '威胁踢出服务器'], icon: '⚠️' },
    { category: '诈骗行为', types: ['交易诈骗', '装备诈骗', '虚假承诺', '冒充他人诈骗', '钓鱼链接'], icon: '🎭' },
    { category: '冒充行为', types: ['冒充管理员', '冒充服主', '冒充其他玩家', '冒充官方人员', '使用相似ID'], icon: '👤' },
    { category: '刷屏行为', types: ['重复发言刷屏', '无意义刷屏', '大段文字刷屏', '快速连续发言', '使用宏刷屏'], icon: '💬' },
    { category: '广告宣传', types: ['宣传其他服务器', '发送广告链接', '推广QQ群/微信群', '推广Discord', '推广商业内容'], icon: '📢' },
    { category: '不当内容', types: ['辱骂他人', '人身攻击', '歧视言论', '政治敏感', '色情内容', '暴力内容', '恶意引战'], icon: '🚫' },
    { category: '隐私泄露', types: ['泄露他人隐私', '泄露他人信息', '公开他人IP', '公开他人地址', '公开他人电话'], icon: '🔓' },
    { category: '账号安全', types: ['盗取他人账号', '尝试破解密码', '社工欺骗', '木马盗号'], icon: '🔐' },
    { category: '规避行为', types: ['使用小号', '更换IP规避', '使用VPN规避', '冒用他人身份'], icon: '🏃' },
    { category: '恶意卡顿', types: ['制造大量实体', '制造红石卡顿', '恶意放置方块', '制造粒子效果', '故意造成延迟'], icon: '🔴' },
    { category: '权限滥用', types: ['滥用管理员权限', '滥用传送权限', '滥用创造模式'], icon: '👑' },
    { category: '其他违规', types: ['虚假举报', '恶意投诉', '破坏游戏规则', '其他违规行为'], icon: '❓' }
  ];

  const getDaysInMonth = (year: string, month: string) => {
    if (!year || !month) return 31;
    const y = parseInt(year);
    const m = parseInt(month);
    if (m === 2) {
      return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0) ? 29 : 28;
    }
    if ([4, 6, 9, 11].includes(m)) {
      return 30;
    }
    return 31;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'violationYear' || name === 'violationMonth') {
        newData.violationDay = '';
        newData.violationHour = '';
        newData.violationMinute = '';
      } else if (name === 'violationDay') {
        newData.violationHour = '';
        newData.violationMinute = '';
      }
      
      // 当所有时间字段都填写时，更新 violationTime
      if (newData.violationYear && newData.violationMonth && newData.violationDay && newData.violationHour && newData.violationMinute) {
        newData.violationTime = `${newData.violationYear}-${newData.violationMonth}-${newData.violationDay}T${newData.violationHour}:${newData.violationMinute}`;
      } else if (newData.violationYear && newData.violationMonth && newData.violationDay) {
        newData.violationTime = `${newData.violationYear}-${newData.violationMonth}-${newData.violationDay}T12:00`;
      } else {
        newData.violationTime = '';
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    console.log('提交表单数据:', JSON.stringify(formData, null, 2));
    console.log('violationTime:', formData.violationTime);
    console.log('violationHour:', formData.violationHour);
    console.log('violationMinute:', formData.violationMinute);
    
    try {
      const response = await fetch('/api/complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSubmitStatus('success');
        setFormData({
          reporterName: '',
          reporterQQ: '',
          targetPlayer: '',
          violationYear: '',
          violationMonth: '',
          violationDay: '',
          violationHour: '',
          violationMinute: '',
          violationTime: '',
          violationType: '',
          description: '',
          evidence: ''
        });
        setSelectedCategory('');
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('提交失败:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  const copyQQ = (qqNumber: string) => {
    navigator.clipboard.writeText(qqNumber);
    alert('QQ号已复制：' + qqNumber);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mc-stone-dark via-mc-stone-dark to-mc-stone-dark text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-mc-stone-dark/90 backdrop-blur-md border-b-2 border-mc-stone">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <a href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-mc-green-dark rounded-sm flex items-center justify-center text-xl border-2 border-mc-green shadow-lg group-hover:scale-110 transition-transform">
                ⛏️
              </div>
              <div>
                <div className="text-xl font-bold text-mc-green-light">CT Cloud tops</div>
                <div className="text-sm text-mc-stone">云顶之境</div>
              </div>
            </a>
            <a 
              href="/"
              className="flex items-center gap-2 text-mc-stone-light hover:text-white transition-colors duration-300 bg-mc-stone-dark hover:bg-mc-stone border border-mc-stone rounded-sm px-4 py-2"
            >
              <span>🏠</span>
              <span>返回首页</span>
            </a>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 pt-32 pb-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-mc-red-dark rounded-sm text-4xl shadow-lg border-2 border-mc-red/50 mb-6">
            📋
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-mc-red via-mc-red to-mc-gold bg-clip-text text-transparent">
            投诉举报中心
          </h1>
          <p className="text-mc-stone text-lg">维护服务器秩序，共建和谐游戏环境</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-mc-green/10 to-mc-green-dark/10 p-6 rounded-sm border-2 border-mc-green/30 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-mc-green rounded-sm flex items-center justify-center text-2xl flex-shrink-0 border-2 border-mc-green-dark">
                ℹ️
              </div>
              <div>
                <h3 className="text-lg font-semibold text-mc-green-light mb-2">举报须知</h3>
                <p className="text-mc-stone-light">
                  如果您在游戏中遇到违规行为，欢迎向我们举报。请提供准确的信息和证据，我们会认真处理每一份举报，维护良好的游戏环境。
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-mc-stone-dark/60 p-8 rounded-sm border-2 border-mc-stone space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-mc-red-dark rounded-sm flex items-center justify-center text-xl border-2 border-mc-red/50">
                ✏️
              </div>
              <h2 className="text-2xl font-bold text-white">填写举报信息</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-mc-stone-dark/50 p-5 rounded-sm border border-mc-stone">
                <label className="flex items-center gap-2 text-mc-stone-light mb-3 font-medium">
                  <span className="text-lg">👤</span>
                  您的游戏ID <span className="text-mc-red">*</span>
                </label>
                <input
                  type="text"
                  name="reporterName"
                  value={formData.reporterName}
                  onChange={handleChange}
                  required
                  pattern="[a-zA-Z0-9_]+"
                  title="游戏ID只能包含英文字母、数字和下划线"
                  className="w-full bg-mc-stone-dark border-2 border-mc-stone rounded-sm px-4 py-3 text-white placeholder-mc-stone focus:outline-none focus:border-mc-green transition-all"
                  placeholder="请输入您的游戏ID"
                />
                <p className="text-mc-stone text-sm mt-2">仅限英文、数字、下划线</p>
              </div>
              <div className="bg-mc-stone-dark/50 p-5 rounded-sm border border-mc-stone">
                <label className="flex items-center gap-2 text-mc-stone-light mb-3 font-medium">
                  <span className="text-lg">💬</span>
                  您的QQ号 <span className="text-mc-red">*</span>
                </label>
                <input
                  type="text"
                  name="reporterQQ"
                  value={formData.reporterQQ}
                  onChange={handleChange}
                  required
                  pattern="[1-9][0-9]{4,10}"
                  title="请输入正确的QQ号（5-11位数字）"
                  className="w-full bg-mc-stone-dark border-2 border-mc-stone rounded-sm px-4 py-3 text-white placeholder-mc-stone focus:outline-none focus:border-mc-green transition-all"
                  placeholder="请输入您的QQ号"
                />
                <p className="text-mc-stone text-sm mt-2">用于联系您反馈处理结果</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-mc-red/10 to-mc-gold/10 p-5 rounded-sm border border-mc-red/30">
              <label className="flex items-center gap-2 text-mc-stone-light mb-3 font-medium">
                <span className="text-lg">🎮</span>
                违规玩家游戏ID <span className="text-mc-red">*</span>
              </label>
              <input
                type="text"
                name="targetPlayer"
                value={formData.targetPlayer}
                onChange={handleChange}
                required
                pattern="[a-zA-Z0-9_]+"
                title="游戏ID只能包含英文字母、数字和下划线"
                className="w-full bg-mc-stone-dark border-2 border-mc-stone rounded-sm px-4 py-3 text-white placeholder-mc-stone focus:outline-none focus:border-mc-red transition-all"
                placeholder="请输入违规玩家的游戏ID"
              />
            </div>

            <div className="bg-mc-stone-dark/50 p-5 rounded-sm border border-mc-stone">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-mc-stone-light font-medium">
                  <span className="text-lg">⏰</span>
                  违规时间 <span className="text-mc-stone text-sm">(可选)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setUseDatePicker(!useDatePicker)}
                  className="text-mc-green-light text-sm hover:text-mc-green-light transition-colors flex items-center gap-1"
                >
                  <span>{useDatePicker ? '🗓️' : '📅'}</span>
                  {useDatePicker ? '使用快速选择' : '使用日期选择器'}
                </button>
              </div>
              
              {useDatePicker ? (
                <div className="space-y-3">
                  <input
                    type="date"
                    value={formData.violationTime ? formData.violationTime.split('T')[0] : ''}
                    onChange={(e) => {
                      const date = e.target.value;
                      const time = formData.violationTime ? formData.violationTime.split('T')[1] || '12:00' : '12:00';
                      setFormData(prev => ({ ...prev, violationTime: `${date}T${time}` }));
                    }}
                    className="w-full bg-mc-stone-dark border-2 border-mc-stone rounded-sm px-4 py-3 text-white focus:outline-none focus:border-mc-green transition-all"
                  />
                  <input
                    type="time"
                    step="60"
                    value={formData.violationTime ? formData.violationTime.split('T')[1] || '' : ''}
                    onChange={(e) => {
                      const date = formData.violationTime ? formData.violationTime.split('T')[0] : (() => {
                        const now = new Date();
                        const year = now.getFullYear();
                        const month = String(now.getMonth() + 1).padStart(2, '0');
                        const day = String(now.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                      })();
                      const time = e.target.value;
                      console.log('选择的时间:', time);
                      // 直接使用用户选择的时间，不进行时区转换
                      setFormData(prev => ({ ...prev, violationTime: `${date}T${time}` }));
                    }}
                    className="w-full bg-mc-stone-dark border-2 border-mc-stone rounded-sm px-4 py-3 text-white focus:outline-none focus:border-mc-green transition-all"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <select
                    name="violationYear"
                    value={formData.violationYear}
                    onChange={handleChange}
                    className="bg-mc-stone-dark border-2 border-mc-stone rounded-sm px-4 py-3 text-white focus:outline-none focus:border-mc-green transition-all"
                  >
                    <option value="">选择年份</option>
                    <option value="2026">2026年</option>
                    <option value="2025">2025年</option>
                    <option value="2024">2024年</option>
                  </select>
                  <select
                    name="violationMonth"
                    value={formData.violationMonth}
                    onChange={handleChange}
                    className="bg-mc-stone-dark border-2 border-mc-stone rounded-sm px-4 py-3 text-white focus:outline-none focus:border-mc-green transition-all"
                  >
                    <option value="">选择月份</option>
                    {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => (
                      <option key={m} value={m}>{parseInt(m)}月</option>
                    ))}
                  </select>
                  <select
                    name="violationDay"
                    value={formData.violationDay}
                    onChange={handleChange}
                    className="bg-mc-stone-dark border-2 border-mc-stone rounded-sm px-4 py-3 text-white focus:outline-none focus:border-mc-green transition-all"
                  >
                    <option value="">选择日期</option>
                    {Array.from({ length: getDaysInMonth(formData.violationYear, formData.violationMonth) }, (_, i) => {
                      const day = (i + 1).toString().padStart(2, '0');
                      return <option key={day} value={day}>{i + 1}日</option>;
                    })}
                  </select>
                  <select
                    name="violationHour"
                    value={formData.violationHour}
                    onChange={handleChange}
                    disabled={!formData.violationDay}
                    className="bg-mc-stone-dark border-2 border-mc-stone rounded-sm px-4 py-3 text-white focus:outline-none focus:border-mc-green transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">选择小时</option>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return <option key={hour} value={hour}>{hour}:00</option>;
                    })}
                  </select>
                  <select
                    name="violationMinute"
                    value={formData.violationMinute}
                    onChange={handleChange}
                    disabled={!formData.violationHour}
                    className="bg-mc-stone-dark border-2 border-mc-stone rounded-sm px-4 py-3 text-white focus:outline-none focus:border-mc-green transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">选择分钟</option>
                    {Array.from({ length: 60 }, (_, i) => {
                      const minute = i.toString().padStart(2, '0');
                      return <option key={minute} value={minute}>{minute}</option>;
                    })}
                  </select>
                </div>
              )}
            </div>

            <div className="bg-mc-stone-dark/50 p-5 rounded-sm border border-mc-stone">
              <label className="flex items-center gap-2 text-mc-stone-light mb-3 font-medium">
                <span className="text-lg">🏷️</span>
                违规类型 <span className="text-mc-red">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-mc-stone text-sm mb-2">第一步：选择大分类</p>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setFormData(prev => ({ ...prev, violationType: '' }));
                    }}
                    required
                    className="w-full bg-mc-stone-dark border-2 border-mc-stone rounded-sm px-4 py-3 text-white focus:outline-none focus:border-mc-green transition-all"
                  >
                    <option value="">请选择大分类</option>
                    {violationCategories.map((cat, index) => (
                      <option key={index} value={cat.category}>{cat.icon} {cat.category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-mc-stone text-sm mb-2">第二步：选择具体违规</p>
                  <select
                    name="violationType"
                    value={formData.violationType}
                    onChange={handleChange}
                    required
                    disabled={!selectedCategory}
                    className="w-full bg-mc-stone-dark border-2 border-mc-stone rounded-sm px-4 py-3 text-white focus:outline-none focus:border-mc-green transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">请选择具体违规</option>
                    {selectedCategory && violationCategories.find(c => c.category === selectedCategory)?.types.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-mc-stone-dark/50 p-5 rounded-sm border border-mc-stone">
              <label className="flex items-center gap-2 text-mc-stone-light mb-3 font-medium">
                <span className="text-lg">📝</span>
                违规描述 <span className="text-mc-red">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full bg-mc-stone-dark border-2 border-mc-stone rounded-sm px-4 py-3 text-white placeholder-mc-stone focus:outline-none focus:border-mc-green transition-all resize-none"
                placeholder="请详细描述违规行为，包括时间、地点、经过等..."
              />
            </div>

            <div className="bg-mc-stone-dark/50 p-5 rounded-sm border border-mc-stone">
              <label className="flex items-center gap-2 text-mc-stone-light mb-3 font-medium">
                <span className="text-lg">🔗</span>
                证据链接 <span className="text-mc-stone text-sm">(可选)</span>
              </label>
              <input
                type="url"
                name="evidence"
                value={formData.evidence}
                onChange={handleChange}
                className="w-full bg-mc-stone-dark border-2 border-mc-stone rounded-sm px-4 py-3 text-white placeholder-mc-stone focus:outline-none focus:border-mc-green transition-all"
                placeholder="截图或视频链接（如百度网盘、腾讯微云等）"
              />
              <div className="flex items-center gap-2 mt-3 text-mc-stone text-sm">
                <span>💡</span>
                <span>建议上传截图或视频到云盘，然后粘贴分享链接</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-sm font-semibold text-lg transition-all flex items-center justify-center gap-3 btn-mc ${
                  isSubmitting 
                    ? 'bg-mc-stone cursor-not-allowed' 
                    : 'bg-mc-red hover:bg-mc-red-dark shadow-lg'
                } text-white`}
              >
                <span className="text-xl">{isSubmitting ? '⏳' : '📤'}</span>
                <span>{isSubmitting ? '提交中...' : '提交举报'}</span>
              </button>
            </div>

            {submitStatus === 'success' && (
              <div className="bg-mc-green/20 border-2 border-mc-green/50 text-mc-green-light p-5 rounded-sm text-center flex items-center justify-center gap-3">
                <span className="text-2xl">✅</span>
                <span className="text-lg">举报提交成功！我们会尽快处理。</span>
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="bg-mc-red/20 border-2 border-mc-red/50 text-mc-red p-5 rounded-sm text-center flex items-center justify-center gap-3">
                <span className="text-2xl">❌</span>
                <span className="text-lg">提交失败，请稍后重试或联系管理员。</span>
              </div>
            )}
          </form>

          <div className="bg-gradient-to-r from-mc-gold/10 to-mc-brown/10 p-6 rounded-sm border-2 border-mc-gold/30 mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-mc-brown rounded-sm flex items-center justify-center text-xl border-2 border-mc-gold">
                👑
              </div>
              <h2 className="text-xl font-bold text-mc-gold">联系管理员</h2>
            </div>
            <p className="text-mc-stone-light mb-4">紧急情况下，您也可以直接联系管理员：</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-mc-stone-dark/60 p-4 rounded-sm border border-mc-stone">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-mc-brown rounded-sm flex items-center justify-center text-lg border-2 border-mc-gold/50">
                    👑
                  </div>
                  <div>
                    <span className="text-white font-medium">服主 - yan_hong_jun</span>
                    <p className="text-mc-stone text-sm">QQ: 958708671</p>
                  </div>
                </div>
                <button
                  onClick={() => copyQQ('958708671')}
                  className="bg-mc-green hover:bg-mc-green-dark text-white py-2 px-4 rounded-sm text-sm transition-all btn-mc flex items-center gap-2"
                >
                  <span>📋</span>
                  复制QQ
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a 
              href="/" 
              className="inline-flex items-center gap-2 bg-mc-green hover:bg-mc-green-dark text-white py-3 px-8 rounded-sm transition-all shadow-lg btn-mc"
            >
              <span>🏠</span>
              <span>返回首页</span>
            </a>
          </div>
        </div>
      </div>

      <footer className="bg-mc-stone-dark/50 border-t-2 border-mc-stone py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-mc-green-dark rounded-sm flex items-center justify-center text-lg border-2 border-mc-green">
              ⛏️
            </div>
            <span className="text-mc-stone">CT Cloud tops 云顶之境</span>
          </div>
          <p className="text-mc-stone text-sm">本服务器为玩家社群自发组建与维护，与 Mojang AB 无任何关联。</p>
          <p className="text-mc-stone text-sm mt-2">遇到问题？请联系管理员 QQ: 958708671</p>
        </div>
      </footer>
    </div>
  );
}
