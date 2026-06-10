import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { requireAuth } from '@/lib/auth';

const sql = neon(process.env.DATABASE_URL || '');

const getClientIP = (request: NextRequest): string => {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, adminId, adminName, resolutionNote, resolutionImages, action, note, investigationNote } = body;
    const clientIP = getClientIP(request);
    
    if (action === 'restart') {
      await sql`
        UPDATE complaints 
        SET status = 'pending', 
            handler = NULL, 
            handler_id = NULL,
            resolution_note = NULL,
            resolution_images = NULL,
            investigation_note = NULL,
            updated_at = NOW()
        WHERE id = ${id}
      `;
      
      if (adminId) {
        await sql`
          INSERT INTO operation_logs (admin_id, admin_name, action, target_type, target_id, details)
          VALUES (${adminId}, ${adminName || '未知管理员'}, 'restart_complaint', 'complaint', ${parseInt(id)}, ${note || '重启投诉案件'})
        `;
      }
      
      return NextResponse.json({ 
        success: true, 
        message: '案件已重启' 
      });
    }
    
    const validStatuses = ['pending', 'processing', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: '无效的状态值' },
        { status: 400 }
      );
    }
    
    if (status === 'processing') {
      await sql`
        UPDATE complaints 
        SET status = ${status}, 
            handler = ${adminName}, 
            handler_id = ${adminId},
            investigation_note = ${investigationNote || ''},
            updated_at = NOW()
        WHERE id = ${id}
      `;
    } else if (status === 'resolved' || status === 'rejected') {
      await sql`
        UPDATE complaints 
        SET status = ${status}, 
            resolution_note = ${resolutionNote || ''},
            resolution_images = ${resolutionImages || ''},
            updated_at = NOW()
        WHERE id = ${id}
      `;
    } else if (status === 'pending') {
      await sql`
        UPDATE complaints 
        SET status = ${status}, 
            handler = NULL, 
            handler_id = NULL,
            resolution_note = NULL,
            resolution_images = NULL,
            updated_at = NOW()
        WHERE id = ${id}
      `;
    } else {
      await sql`
        UPDATE complaints 
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${id}
      `;
    }
    
    if (adminId) {
      try {
        const actionText = status === 'processing' ? '接取处理' : 
                          status === 'resolved' ? '已解决' : 
                          status === 'rejected' ? '已驳回' : 
                          status === 'pending' ? '重启' : '更新状态';
        await sql`
          INSERT INTO admin_logs (admin_id, action, details, ip_address, complaint_id, created_at)
          VALUES (${adminId}, 'update_status', ${`管理员 ${adminName || ''} ${actionText}投诉 #${id}`}, ${clientIP}, ${id}, NOW())
        `;
      } catch (logError) {
        console.error('记录操作日志失败:', logError);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '状态更新成功' 
    });

  } catch (error) {
    console.error('更新投诉状态失败:', error);
    return NextResponse.json(
      { success: false, message: '更新失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const adminName = searchParams.get('adminName');
    const clientIP = getClientIP(request);
    
    await sql`DELETE FROM complaints WHERE id = ${id}`;
    
    if (adminId) {
      try {
        await sql`
          INSERT INTO admin_logs (admin_id, action, details, ip_address, complaint_id, created_at)
          VALUES (${parseInt(adminId)}, 'delete', ${`管理员 ${adminName || ''} 删除了投诉 #${id}`}, ${clientIP}, ${id}, NOW())
        `;
      } catch (logError) {
        console.error('记录操作日志失败:', logError);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '删除成功' 
    });

  } catch (error) {
    console.error('删除投诉失败:', error);
    return NextResponse.json(
      { success: false, message: '删除失败' },
      { status: 500 }
    );
  }
}
