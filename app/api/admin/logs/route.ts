import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { requireAuth } from '@/lib/auth';

const sql = neon(process.env.DATABASE_URL || '');

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    let logs;
    
    if (action === 'login') {
      logs = await sql`
        SELECT 
          al.id,
          al.admin_id,
          al.action,
          al.details,
          al.ip_address,
          al.created_at,
          a.display_name as admin_name,
          a.qq as admin_qq
        FROM admin_logs al
        LEFT JOIN admins a ON al.admin_id = a.id
        WHERE al.action = 'login'
        ORDER BY al.created_at DESC
        LIMIT 100
      `;
    } else if (action === 'operation') {
      logs = await sql`
        SELECT 
          al.id,
          al.admin_id,
          al.action,
          al.details,
          al.ip_address,
          al.complaint_id,
          al.created_at,
          a.display_name as admin_name,
          a.qq as admin_qq
        FROM admin_logs al
        LEFT JOIN admins a ON al.admin_id = a.id
        WHERE al.action != 'login'
        ORDER BY al.created_at DESC
        LIMIT 100
      `;
    } else {
      logs = await sql`
        SELECT 
          al.id,
          al.admin_id,
          al.action,
          al.details,
          al.ip_address,
          al.complaint_id,
          al.created_at,
          a.display_name as admin_name,
          a.qq as admin_qq
        FROM admin_logs al
        LEFT JOIN admins a ON al.admin_id = a.id
        ORDER BY al.created_at DESC
        LIMIT 100
      `;
    }
    
    return NextResponse.json({
      success: true,
      data: logs
    });
    
  } catch (error) {
    console.error('获取日志失败:', error);
    return NextResponse.json(
      { success: false, message: '获取日志失败' },
      { status: 500 }
    );
  }
}
