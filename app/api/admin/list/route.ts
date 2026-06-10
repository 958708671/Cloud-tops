import { NextRequest, NextResponse } from 'next/server';
import sql, { withRetry } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    // 查询管理员列表（使用重试机制）
    const admins = await withRetry(async () => {
      return await sql`
        SELECT id, username, display_name, qq, is_owner, permissions, show_in_contact, show_in_logs, receive_complaint_email, receive_application_email, created_at
        FROM admins
        ORDER BY is_owner DESC, id ASC
      `;
    });
    
    // 解析 permissions JSONB 字段
    const formattedAdmins = admins.map(admin => ({
      ...admin,
      permissions: admin.permissions || {
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
      },
      show_in_contact: admin.show_in_contact !== false,
      show_in_logs: admin.show_in_logs !== false,
      receive_complaint_email: admin.receive_complaint_email === true,
      receive_application_email: admin.receive_application_email === true
    }));
    
    return NextResponse.json({
      success: true,
      data: formattedAdmins,
    });
    
  } catch (error) {
    console.error('获取管理员列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取管理员列表失败' },
      { status: 500 }
    );
  }
}
