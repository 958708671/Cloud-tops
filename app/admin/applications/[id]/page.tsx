'use client';

import { useState, useEffect } from 'react';
import { Application, AdminInfo } from '../types';
import { useParams, useRouter } from 'next/navigation';

interface WorkFiles {
  photos: string[];
  video: string | null;
  archive: string | null;
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNote, setReviewNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);

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
    if (adminInfo) {
      fetchApplication();
    }
  }, [id, adminInfo]);

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/applications/${id}`, {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        setApplication(result.data);
      } else {
        alert('获取申请信息失败');
        router.push('/admin/applications');
      }
    } catch (error) {
      console.error('获取申请信息失败:', error);
      alert('获取申请信息失败');
      router.push('/admin/applications');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!adminInfo || !application) return;
    
    setProcessing(true);
    let message = '';
    
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewer: adminInfo.user,
          reviewerId: adminInfo.adminId,
          note: reviewNote
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('网络请求失败');
      }
      
      const result = await response.json();
      if (result.success) {
        message = status === 'approved' ? '审核通过成功' : '审核拒绝成功';
        // 如果是审核通过，显示白名单添加结果
        if (status === 'approved' && result.whitelistResult) {
          const whitelistMsg = result.whitelistResult.success 
            ? `白名单添加成功: ${result.whitelistResult.message}`
            : `白名单添加失败: ${result.whitelistResult.message}`;
          message += `\n${whitelistMsg}`;
        }
        alert(message);
        router.push('/admin/applications');
      } else {
        message = result.message || '操作失败';
        alert(message);
      }
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败，请重试');
    } finally {
      setReviewNote('');
      setProcessing(false);
    }
  };

  const getPlayTimeText = (playTime: number | string) => {
    if (typeof playTime === 'number') {
      if (playTime === 0) return '新手（1年以内）';
      if (playTime === 1) return '熟练（1-3年）';
      if (playTime === 2) return '老手（3-5年）';
      if (playTime === 3) return '专家（5年以上）';
      return `${playTime} 个月`;
    }
    return playTime;
  };

  const getQuizCategoryText = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'building': '建筑',
      'redstone': '红石',
      'pvp': 'PVP',
      'survival': '生存'
    };
    return categoryMap[category] || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-4xl animate-bounce"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="rounded-sm p-12 text-center" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
        <p className="text-mc-stone-light text-lg">申请信息不存在</p>
        <button 
          onClick={() => router.push('/admin/applications')}
          className="mt-4 px-4 py-2 rounded-sm font-medium hover:bg-white/10 text-white transition-all"
          style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
        >
          返回列表
        </button>
      </div>
    );
  }

  const workFiles = application.work_files as WorkFiles || { photos: [], video: null, archive: null };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">审核申请</h1>
          <p className="text-mc-stone-light text-sm mt-1">详细审核玩家的白名单申请</p>
        </div>
        
        <button
          onClick={() => router.push('/admin/applications')}
          className="px-4 py-2 rounded-sm font-medium hover:bg-white/10 text-white transition-all flex items-center gap-2"
          style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
        >
          返回列表
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* 基本信息 */}
        <div className="rounded-sm p-6" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
          <h2 className="text-xl font-bold text-white mb-4">基本信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-mc-stone-light">游戏ID</span>
                <span className="text-white font-medium">{application.minecraft_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mc-stone-light">年龄</span>
                <span className="text-white">{application.age || '未填写'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mc-stone-light">QQ号</span>
                <span className="text-white">{application.contact}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mc-stone-light">性别</span>
                <span className="text-white">{application.gender || '未填写'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-mc-stone-light">游戏时间</span>
                <span className="text-white">{getPlayTimeText(application.play_time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mc-stone-light">游戏时段</span>
                <span className="text-white">{application.favorite_mode || '未填写'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mc-stone-light">如何知道服务器</span>
                <span className="text-white">{application.how_found || '未填写'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mc-stone-light">申请时间</span>
                <span className="text-white">{new Date(application.created_at).toLocaleString('zh-CN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 答题信息 */}
        {application.quiz_category && (
          <div className="rounded-sm p-6" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
            <h2 className="text-xl font-bold text-white mb-4">答题信息</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-mc-stone-light">答题类型</span>
                <span className="text-white">{getQuizCategoryText(application.quiz_category)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mc-stone-light">答题得分</span>
                <span className="text-white">{application.quiz_score || 0} / {application.quiz_total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mc-stone-light">得分率</span>
                <span className="text-white">{Math.round(((application.quiz_score || 0) / (application.quiz_total || 1)) * 100)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* 作品展示 */}
        {(workFiles.photos.length > 0 || workFiles.video || workFiles.archive) && (
          <div className="rounded-sm p-6" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
            <h2 className="text-xl font-bold text-white mb-4">玩家作品</h2>
            
            {/* 照片 */}
            {workFiles.photos.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">照片</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {workFiles.photos.map((url, idx) => (
                    <div key={idx} className="relative bg-mc-stone-dark/90 rounded-sm border border-mc-stone-dark p-2">
                      <img
                        src={url}
                        alt={`作品 ${idx + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 视频 */}
            {workFiles.video && (
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">视频</h3>
                <div className="bg-mc-stone-dark/90 rounded-sm border border-mc-stone-dark p-4">
                  <a 
                    href={workFiles.video} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-mc-stone-light hover:underline"
                  >
                    查看视频
                  </a>
                </div>
              </div>
            )}
            
            {/* 压缩包 */}
            {workFiles.archive && (
              <div>
                <h3 className="text-lg font-medium text-white mb-2">压缩包</h3>
                <div className="bg-mc-stone-dark/90 rounded-sm border border-mc-stone-dark p-4">
                  <a 
                    href={workFiles.archive} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-mc-stone-light hover:underline"
                  >
                    下载压缩包
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 其他信息 */}
        {application.server_experience || application.griefing_history || application.additional_info || (application.scenario_answers && Object.keys(application.scenario_answers).length > 0) && (
          <div className="rounded-sm p-6" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
            <h2 className="text-xl font-bold text-white mb-4">其他信息</h2>
            
            {/* 实景题答案 */}
            {application.scenario_answers && Object.keys(application.scenario_answers).length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">实景题答案</h3>
                {Object.entries(application.scenario_answers).map(([key, value]: [string, string]) => (
                  <div key={key} className="text-white text-sm mb-2 p-2 bg-mc-stone-dark/90 rounded">
                    <span className="text-green-400">第{parseInt(key) + 1}题: </span>
                    {value}
                  </div>
                ))}
              </div>
            )}
            
            {application.server_experience && (
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">服务器经验</h3>
                <div className="text-white text-sm">{application.server_experience}</div>
              </div>
            )}
            
            {application.griefing_history && (
              <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">破坏行为历史</h3>
                <div className="text-white text-sm">{application.griefing_history}</div>
              </div>
            )}
            
            {application.additional_info && (
              <div>
                <h3 className="text-lg font-medium text-white mb-2">其他信息</h3>
                <div className="text-white text-sm">{application.additional_info}</div>
              </div>
            )}
          </div>
        )}

        {/* 审核备注 */}
        <div className="rounded-sm p-6" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
          <h2 className="text-xl font-bold text-white mb-4">审核操作</h2>
          <div className="mb-4">
            <label className="block text-mc-stone-light text-sm mb-2 font-medium">审核备注</label>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="填写审核备注（可选）"
              rows={3}
              className="w-full rounded-sm px-4 py-3 text-white focus:outline-none resize-none"
              style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin/applications')}
              className="flex-1 px-4 py-3 hover:bg-white/10 text-white rounded-sm transition-all"
              style={{border: '1px solid rgba(93, 122, 156, 0.8)', backgroundColor: 'rgba(93, 122, 156, 0.5)'}}
            >
              取消
            </button>
            <button
              onClick={() => handleReview('rejected')}
              disabled={processing}
              className={`flex-1 px-4 py-3 hover:bg-white/30 text-white rounded-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
              style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}>
              {processing ? '处理中...' : '拒绝'}
            </button>
            <button
              onClick={() => handleReview('approved')}
              disabled={processing}
              className={`flex-1 px-4 py-3 hover:bg-white/30 text-white rounded-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
              style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.9)'}}>
              {processing ? '处理中...' : '通过'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
