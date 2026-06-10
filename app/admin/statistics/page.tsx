'use client';

import { useState, useEffect } from 'react';

interface Event {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
}

interface Announcement {
  id: number;
  title: string;
  created_at: string;
}

interface OverviewStats {
  whitelist: {
    total_whitelist: string;
    pending_applications: string;
    rejected_applications: string;
    new_whitelist_week: string;
  };
  complaints: {
    total_complaints: string;
    pending_complaints: string;
    processing_complaints: string;
    resolved_complaints: string;
    rejected_complaints: string;
  };
  blacklist: {
    total_blacklist: string;
    permanent_blacklist: string;
    temporary_blacklist: string;
  };
  announcements: {
    total_announcements: string;
  };
  events: {
    total_events: string;
  };
}

interface AdminRanking {
  username: string;
  id: number;
  whitelist_reviews: string;
  complaint_handles: string;
}

export default function StatisticsPage() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [rankings, setRankings] = useState<AdminRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState<{ user: string; adminId: number; role?: string } | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminInfo');
    if (savedAdmin) {
      setAdminInfo(JSON.parse(savedAdmin));
    }
    fetchStatistics();
    fetchEvents();
    fetchAnnouncements();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const [overviewRes, rankingsRes] = await Promise.all([
        fetch('/api/statistics?type=overview'),
        fetch('/api/statistics?type=admin-rankings')
      ]);
      
      const overviewData = await overviewRes.json();
      const rankingsData = await rankingsRes.json();
      
      if (overviewData.success) {
        setOverview(overviewData.data);
      }
      if (rankingsData.success) {
        setRankings(rankingsData.data);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error('获取活动数据失败:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements');
      const data = await response.json();
      if (data.success) {
        setAnnouncements(data.data);
      }
    } catch (error) {
      console.error('获取公告数据失败:', error);
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
           数据统计
        </h1>
        <p className="text-mc-stone-light text-sm mt-1">
          {adminInfo?.role === 'owner' ? '全局数据统计面板' : '查看服务器运营数据'}
        </p>
      </div>

      {overview && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="rounded-sm p-5" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl"></span>
                <span className="text-white text-sm">白名单</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.whitelist.total_whitelist}</div>
              <div className="text-mc-stone-light text-sm mt-1">总人数</div>
            </div>
            
            <div className="rounded-sm p-5" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl"></span>
                <span className="text-white text-sm">待审核</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.whitelist.pending_applications}</div>
              <div className="text-mc-stone-light text-sm mt-1">白名单申请</div>
            </div>
            
            <div className="rounded-sm p-5" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl"></span>
                <span className="text-white text-sm">已拒绝</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.whitelist.rejected_applications}</div>
              <div className="text-mc-stone-light text-sm mt-1">白名单申请</div>
            </div>
            
            <div className="rounded-sm p-5" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl"></span>
                <span className="text-white text-sm">投诉</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.complaints.total_complaints}</div>
              <div className="text-mc-stone-light text-sm mt-1">总投诉数</div>
            </div>
            
            <div className="rounded-sm p-5" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl"></span>
                <span className="text-white text-sm">黑名单</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.blacklist.total_blacklist}</div>
              <div className="text-mc-stone-light text-sm mt-1">封禁人数</div>
            </div>
            
            <div className="rounded-sm p-5" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl"></span>
                <span className="text-white text-sm">处理中</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.complaints.processing_complaints}</div>
              <div className="text-mc-stone-light text-sm mt-1">投诉</div>
            </div>
            
            <div className="rounded-sm p-5" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl"></span>
                <span className="text-white text-sm">已解决</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.complaints.resolved_complaints}</div>
              <div className="text-mc-stone-light text-sm mt-1">投诉</div>
            </div>
            
            <div className="rounded-sm p-5" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl"></span>
                <span className="text-white text-sm">已驳回</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.complaints.rejected_complaints}</div>
              <div className="text-mc-stone-light text-sm mt-1">投诉</div>
            </div>
            
            <div className="rounded-sm p-5" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl"></span>
                <span className="text-white text-sm">临时封禁</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.blacklist.temporary_blacklist}</div>
              <div className="text-mc-stone-light text-sm mt-1">黑名单</div>
            </div>
            
            <div className="rounded-sm p-5" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl"></span>
                <span className="text-white text-sm">永久封禁</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.blacklist.permanent_blacklist}</div>
              <div className="text-mc-stone-light text-sm mt-1">黑名单</div>
            </div>
            
            <div className="rounded-sm p-5" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl"></span>
                <span className="text-white text-sm">公告</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.announcements.total_announcements}</div>
              <div className="text-mc-stone-light text-sm mt-1">总条数</div>
            </div>
            
            <div className="rounded-sm p-5" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl"></span>
                <span className="text-white text-sm">活动</span>
              </div>
              <div className="text-3xl font-bold text-white">{overview.events.total_events}</div>
              <div className="text-mc-stone-light text-sm mt-1">总条数</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-sm p-5" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                 本周数据
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-mc-stone-light">新增白名单</span>
                  <span className="text-white font-bold">{overview.whitelist.new_whitelist_week}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-mc-stone-light">待处理投诉</span>
                  <span className="text-white font-bold">{overview.complaints.pending_complaints}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-mc-stone-light">已解决投诉</span>
                  <span className="text-white font-bold">{overview.complaints.resolved_complaints}</span>
                </div>
              </div>
            </div>
            
            <div className="rounded-sm p-5" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                 数据概览
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-mc-stone-light">白名单通过率</span>
                  <span className="text-white font-bold">
                    {overview.whitelist.total_whitelist && overview.whitelist.pending_applications
                      ? Math.round(
                          (parseInt(overview.whitelist.total_whitelist) / 
                          (parseInt(overview.whitelist.total_whitelist) + parseInt(overview.whitelist.pending_applications))) * 100
                        )
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-mc-stone-light">投诉解决率</span>
                  <span className="text-white font-bold">
                    {overview.complaints.total_complaints && overview.complaints.resolved_complaints
                      ? Math.round(
                          (parseInt(overview.complaints.resolved_complaints) / 
                          parseInt(overview.complaints.total_complaints)) * 100
                        )
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-mc-stone-light">封禁比例</span>
                  <span className="text-white font-bold">
                    {overview.whitelist.total_whitelist && overview.blacklist.total_blacklist
                      ? Math.round(
                          (parseInt(overview.blacklist.total_blacklist) / 
                          parseInt(overview.whitelist.total_whitelist)) * 100
                        )
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {adminInfo?.role === 'owner' && rankings.length > 0 && (
        <div className="rounded-sm p-5" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
             管理员工作量排行
          </h3>
          <div className="space-y-3">
            {rankings.map((admin, index) => (
              <div 
                key={admin.id}
                className="flex items-center justify-between p-3 rounded-sm" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl text-mc-stone-light">
                    #{index + 1}
                  </span>
                  <span className="text-white font-medium">{admin.username}</span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-mc-stone-light">白名单: {admin.whitelist_reviews}</span>
                  <span className="text-mc-stone-light">投诉: {admin.complaint_handles}</span>
                  <span className="text-white font-bold">
                    总计: {parseInt(admin.whitelist_reviews || '0') + parseInt(admin.complaint_handles || '0')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 日历组件 */}
      <div className="bg-transparent rounded-sm p-5 border border-mc-stone-dark">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
           活动和公告日历
        </h3>
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            className="px-3 py-1 text-white rounded-sm transition-all" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(93, 122, 156, 1)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(93, 122, 156, 0.8)'}
          >
            上个月
          </button>
          <h4 className="text-xl font-bold text-white">
            {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
          </h4>
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            className="px-3 py-1 text-white rounded-sm transition-all" style={{border: '1px solid rgba(93, 122, 156, 0.9)', backgroundColor: 'rgba(93, 122, 156, 0.8)'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(93, 122, 156, 1)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(93, 122, 156, 0.8)'}
          >
            下个月
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center">
          {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
            <div key={index} className="text-mc-stone-light font-semibold py-2">
              {day}
            </div>
          ))}
          
          {/* 生成日历日期 */}
          {(() => {
            const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
            const dates = [];
            
            // 填充上个月的日期
            for (let i = 0; i < firstDayOfMonth; i++) {
              dates.push(null);
            }
            
            // 填充当前月的日期
            for (let i = 1; i <= daysInMonth; i++) {
              dates.push(i);
            }
            
            return dates.map((date, index) => {
              if (!date) {
                return <div key={index} className="h-16 p-1"></div>;
              }
              
              const currentDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
              
              // 检查当天是否有活动
              const dayEvents = events.filter(event => {
                const eventStart = new Date(event.start_time);
                const eventEnd = new Date(event.end_time);
                const checkDate = new Date(currentDateStr);
                return checkDate >= eventStart && checkDate <= eventEnd;
              });
              
              // 检查当天是否有公告
              const dayAnnouncements = announcements.filter(announcement => {
                const announcementDate = new Date(announcement.created_at);
                return announcementDate.toDateString() === new Date(currentDateStr).toDateString();
              });
              
              return (
                <div 
                  key={index} 
                  className={`h-16 p-1 border rounded-sm transition-colors ${
                    new Date().toDateString() === new Date(currentDateStr).toDateString() 
                      ? 'bg-white/10 border-mc-stone' 
                      : 'border-mc-stone-dark hover:border-mc-stone'
                  }`}
                >
                  <div className="text-white font-medium">{date}</div>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((event, i) => (
                      <div key={i} className="text-xs text-mc-stone-light truncate">
                         {event.title}
                      </div>
                    ))}
                    {dayAnnouncements.slice(0, 2).map((announcement, i) => (
                      <div key={i} className="text-xs text-mc-stone-light truncate">
                         {announcement.title}
                      </div>
                    ))}
                    {(dayEvents.length + dayAnnouncements.length) > 4 && (
                      <div className="text-xs text-white/40">
                        +{dayEvents.length + dayAnnouncements.length - 4} 更多
                      </div>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}
