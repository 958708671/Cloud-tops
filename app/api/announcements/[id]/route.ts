import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { requireOwner } from '@/lib/auth';

const sql = neon(process.env.DATABASE_URL || '');

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const { title, content, type, is_pinned, expires_at } = data;
    
    await sql`
      UPDATE announcements 
      SET 
        title = COALESCE(${title}, title),
        content = COALESCE(${content}, content),
        type = COALESCE(${type}, type),
        is_pinned = COALESCE(${is_pinned}, is_pinned),
        expires_at = ${expires_at === null ? null : (expires_at || undefined)},
        updated_at = NOW()
      WHERE id = ${parseInt(id)}
    `;
    
    return NextResponse.json({
      success: true,
      message: '公告更新成功'
    });
  } catch (error) {
    console.error('更新公告失败:', error);
    return NextResponse.json(
      { success: false, message: '更新公告失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireOwner(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    
    await sql`
      DELETE FROM announcements WHERE id = ${parseInt(id)}
    `;
    
    return NextResponse.json({
      success: true,
      message: '公告删除成功'
    });
  } catch (error) {
    console.error('删除公告失败:', error);
    return NextResponse.json(
      { success: false, message: '删除公告失败' },
      { status: 500 }
    );
  }
}
