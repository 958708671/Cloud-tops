import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL || '');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    if (type === 'overview') {
      const [whitelistStats] = await sql`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'approved') as total_whitelist,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_applications,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected_applications,
          COUNT(*) FILTER (WHERE status = 'approved' AND reviewed_at >= NOW() - INTERVAL '7 days') as new_whitelist_week
        FROM whitelist_applications
      `;
      
      const [complaintStats] = await sql`
        SELECT 
          COUNT(*) as total_complaints,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_complaints,
          COUNT(*) FILTER (WHERE status = 'processing') as processing_complaints,
          COUNT(*) FILTER (WHERE status = 'resolved') as resolved_complaints,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected_complaints
        FROM complaints
      `;
      
      const [blacklistStats] = await sql`
        SELECT 
          COUNT(*) as total_blacklist,
          COUNT(*) FILTER (WHERE is_permanent = true) as permanent_blacklist,
          COUNT(*) FILTER (WHERE is_permanent = false) as temporary_blacklist
        FROM blacklist
      `;
      
      const [announcementStats] = await sql`
        SELECT COUNT(*) as total_announcements FROM announcements
      `;
      
      const [eventStats] = await sql`
        SELECT COUNT(*) as total_events FROM events
      `;
      
      return NextResponse.json({
        success: true,
        data: {
          whitelist: whitelistStats,
          complaints: complaintStats,
          blacklist: blacklistStats,
          announcements: announcementStats,
          events: eventStats
        }
      });
    }
    
    if (type === 'admin-rankings') {
      const rankings = await sql`
        SELECT 
          a.username,
          a.id,
          COUNT(DISTINCT w.id) FILTER (WHERE w.reviewed_by_id = a.id) as whitelist_reviews,
          COUNT(DISTINCT c.id) FILTER (WHERE c.handler_id = a.id) as complaint_handles
        FROM admins a
        LEFT JOIN whitelist_applications w ON w.reviewed_by_id = a.id AND w.status IN ('approved', 'rejected')
        LEFT JOIN complaints c ON c.handler_id = a.id AND c.status IN ('resolved', 'rejected')
        GROUP BY a.id, a.username
        ORDER BY (COUNT(DISTINCT w.id) + COUNT(DISTINCT c.id)) DESC
        LIMIT 10
      `;
      
      return NextResponse.json({
        success: true,
        data: rankings
      });
    }
    
    if (type === 'daily-stats') {
      const dailyStats = await sql`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) FILTER (WHERE status = 'approved') as approved,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
          COUNT(*) FILTER (WHERE status = 'pending') as pending
        FROM whitelist_applications
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;
      
      return NextResponse.json({
        success: true,
        data: dailyStats
      });
    }
    
    return NextResponse.json({
      success: false,
      message: '无效的统计类型'
    }, { status: 400 });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json(
      { success: false, message: '获取统计数据失败' },
      { status: 500 }
    );
  }
}
