import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { requireAuth } from '@/lib/auth';

const sql = neon(process.env.DATABASE_URL || '');

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const adminId = searchParams.get('adminId');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    let logs;
    
    if (type === 'login') {
      logs = await sql`
        SELECT 
          id, admin_id, action, details, ip_address, created_at
        FROM admin_logs
        WHERE action = 'login'
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else if (type === 'operation') {
      logs = await sql`
        SELECT * FROM operation_logs
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else if (adminId) {
      logs = await sql`
        SELECT * FROM operation_logs
        WHERE admin_id = ${parseInt(adminId)}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else {
      const loginLogs = await sql`
        SELECT 
          id, admin_id, action, details, ip_address, created_at
        FROM admin_logs
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
      
      const operationLogs = await sql`
        SELECT * FROM operation_logs
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
      
      logs = [...loginLogs, ...operationLogs].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, limit);
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
