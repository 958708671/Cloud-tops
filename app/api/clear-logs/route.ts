import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { requireOwner } from '@/lib/auth';

const sql = neon(process.env.DATABASE_URL || '');

export async function POST(request: NextRequest) {
  const auth = requireOwner(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const data = await request.json();
    const { ids } = data;
    
    if (ids && Array.isArray(ids) && ids.length > 0) {
      // 使用参数化查询，为每个ID创建一个参数占位符
      const placeholders = ids.map((_, index) => `$${index + 1}`).join(',');
      
      await sql.query(
        `DELETE FROM admin_logs WHERE id IN (${placeholders})`,
        ids
      );
      
      await sql.query(
        `DELETE FROM operation_logs WHERE id IN (${placeholders})`,
        ids
      );
      
      return NextResponse.json({ 
        success: true, 
        message: `已删除 ${ids.length} 条日志` 
      });
    } else {
      await sql`TRUNCATE TABLE admin_logs`;
      await sql`TRUNCATE TABLE operation_logs`;
      
      return NextResponse.json({ 
        success: true, 
        message: '操作日志已清空' 
      });
    }
  } catch (error) {
    console.error('删除日志失败:', error);
    return NextResponse.json(
      { success: false, message: '删除日志失败', error: String(error) },
      { status: 500 }
    );
  }
}
