import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { requireAuth, requireOwner } from '@/lib/auth';
import { getNextSortOrder } from '@/lib/db';

const sql = neon(process.env.DATABASE_URL || '');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let events;
    if (status) {
      events = await sql`
        SELECT * FROM events 
        WHERE status = ${status}
        ORDER BY sort_order ASC, start_time DESC
      `;
    } else {
      events = await sql`
        SELECT * FROM events 
        ORDER BY sort_order ASC, start_time DESC
      `;
    }
    
    return NextResponse.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('获取活动列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取活动列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const data = await request.json();
    const { title, description, content, image_url, start_time, end_time, status, created_by, created_by_id } = data;
    
    if (!title) {
      return NextResponse.json(
        { success: false, message: '标题为必填项' },
        { status: 400 }
      );
    }

    const newSortOrder = await getNextSortOrder('events');
    
    await sql`
      INSERT INTO events (title, description, content, image_url, start_time, end_time, status, created_by, created_by_id, sort_order)
      VALUES (${title}, ${description || ''}, ${content || ''}, ${image_url || ''}, ${start_time || null}, ${end_time || null}, ${status || 'upcoming'}, ${created_by || null}, ${created_by_id || null}, ${newSortOrder})
    `;
    
    return NextResponse.json({
      success: true,
      message: '活动创建成功'
    });
  } catch (error) {
    console.error('创建活动失败:', error);
    return NextResponse.json(
      { success: false, message: '创建活动失败' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const auth = requireOwner(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const data = await request.json();
    const { id, sort_order } = data;
    
    if (!id || sort_order === undefined) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    await sql`
      UPDATE events SET sort_order = ${sort_order} WHERE id = ${id}
    `;
    
    return NextResponse.json({
      success: true,
      message: '排序更新成功'
    });
  } catch (error) {
    console.error('更新排序失败:', error);
    return NextResponse.json(
      { success: false, message: '更新排序失败' },
      { status: 500 }
    );
  }
}
