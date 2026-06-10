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
    const { title, description, content, image_url, start_time, end_time, status } = data;
    
    await sql`
      UPDATE events 
      SET 
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        content = COALESCE(${content}, content),
        image_url = COALESCE(${image_url}, image_url),
        start_time = ${start_time === null ? null : (start_time || undefined)},
        end_time = ${end_time === null ? null : (end_time || undefined)},
        status = COALESCE(${status}, status),
        updated_at = NOW()
      WHERE id = ${parseInt(id)}
    `;
    
    return NextResponse.json({
      success: true,
      message: '活动更新成功'
    });
  } catch (error) {
    console.error('更新活动失败:', error);
    return NextResponse.json(
      { success: false, message: '更新活动失败' },
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
      DELETE FROM events WHERE id = ${parseInt(id)}
    `;
    
    return NextResponse.json({
      success: true,
      message: '活动删除成功'
    });
  } catch (error) {
    console.error('删除活动失败:', error);
    return NextResponse.json(
      { success: false, message: '删除活动失败' },
      { status: 500 }
    );
  }
}
