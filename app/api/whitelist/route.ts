import { NextRequest, NextResponse } from 'next/server';
import sql, { withRetry } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    
    let whitelist;
    
    if (search) {
      whitelist = await withRetry(async () => {
        return await sql`
          SELECT id, minecraft_id, age, contact, reviewed_by, reviewed_at, created_at
          FROM whitelist_applications 
          WHERE status = 'approved' AND minecraft_id ILIKE ${'%' + search + '%'}
          ORDER BY reviewed_at DESC
        `;
      });
    } else {
      whitelist = await withRetry(async () => {
        return await sql`
          SELECT id, minecraft_id, age, contact, reviewed_by, reviewed_at, created_at
          FROM whitelist_applications 
          WHERE status = 'approved'
          ORDER BY reviewed_at DESC
        `;
      });
    }
    
    // 只返回真实的白名单申请记录，不添加管理员账号
    // 管理员账号将通过其他方式管理
    
    return NextResponse.json({
      success: true,
      data: whitelist
    });
  } catch (error) {
    console.error('获取白名单列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取白名单列表失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少用户ID' },
        { status: 400 }
      );
    }
    
    const userId = parseInt(id);
    
    // 处理管理员账号（ID为负数）
    if (userId < 0) {
      // 管理员账号从白名单中移除，但不修改其状态
      // 因为管理员账号是虚拟添加到白名单列表的，不是真实的申请
      return NextResponse.json({
        success: true,
        message: '白名单删除成功'
      });
    }
    
    // 处理真实数据库
    await withRetry(async () => {
      await sql`
        UPDATE whitelist_applications 
        SET status = 'pending' 
        WHERE id = ${userId} AND status = 'approved'
      `;
    });
    
    return NextResponse.json({
      success: true,
      message: '白名单删除成功'
    });
  } catch (error) {
    console.error('删除白名单失败:', error);
    return NextResponse.json(
      { success: false, message: '删除白名单失败' },
      { status: 500 }
    );
  }
}
