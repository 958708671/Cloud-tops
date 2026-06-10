import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { requireOwner, requireAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL || '');

export async function POST(request: NextRequest) {
  // 添加管理员需要服主权限
  const auth = requireOwner(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const data = await request.json();
    const { username, password, display_name, qq, is_owner, permissions, show_in_contact, show_in_logs, receive_qq_notifications } = data;
    
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: '用户名和密码为必填项' },
        { status: 400 }
      );
    }
    
    // 校验QQ号格式（如果提供了的话）
    const qqRegex = /^[1-9]\d{4,10}$/;
    if (qq && !qqRegex.test(qq)) {
      return NextResponse.json(
        { success: false, message: 'QQ号格式不正确' },
        { status: 400 }
      );
    }
    
    const existing = await sql`
      SELECT id FROM admins WHERE username = ${username}
    `;
    
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: '该用户名已存在' },
        { status: 400 }
      );
    }
    
    // 服主拥有所有权限
    const finalPermissions = is_owner ? {
      whitelist_review: true,
      complaint_handle: true,
      blacklist_manage: true,
      announcement_manage: true,
      event_manage: true,
      statistics_view: true,
      settings_view: true,
      website_edit: true,
      admin_manage: true,
      logs_view: true,
      monitor_view: true
    } : (permissions || {
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
    });
    
    // 密码用 bcrypt 哈希存储
    const hashedPassword = await bcrypt.hash(password, 12);
    
    await sql`
      INSERT INTO admins (username, password, display_name, qq, is_owner, permissions, show_in_contact, show_in_logs, receive_qq_notifications)
      VALUES (
        ${username}, 
        ${hashedPassword}, 
        ${display_name || ''}, 
        ${qq || ''}, 
        ${is_owner || false},
        ${JSON.stringify(finalPermissions)}::jsonb,
        ${show_in_contact !== false},
        ${show_in_logs !== false},
        ${receive_qq_notifications !== false}
      )
    `;
    
    return NextResponse.json({
      success: true,
      message: '管理员添加成功'
    });
  } catch (error) {
    console.error('添加管理员失败:', error);
    return NextResponse.json(
      { success: false, message: '添加管理员失败' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  // 修改管理员需要服主权限
  const auth = requireOwner(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const data = await request.json();
    const { id, username, password, display_name, qq, permissions, show_in_contact, show_in_logs } = data;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少管理员ID' },
        { status: 400 }
      );
    }
    
    // 构建动态更新语句
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (username) {
      // 检查用户名是否已存在
      const existing = await sql`
        SELECT id FROM admins WHERE username = ${username} AND id != ${parseInt(id)}
      `;
      
      if (existing.length > 0) {
        return NextResponse.json(
          { success: false, message: '该用户名已存在' },
          { status: 400 }
        );
      }
      
      updates.push(`username = $${paramIndex}`);
      values.push(username);
      paramIndex++;
    }
    
    if (password) {
      const hashedPwd = await bcrypt.hash(password, 12);
      updates.push(`password = $${paramIndex}`);
      values.push(hashedPwd);
      paramIndex++;
    }
    
    if (display_name !== undefined) {
      updates.push(`display_name = $${paramIndex}`);
      values.push(display_name);
      paramIndex++;
    }
    
    if (qq !== undefined) {
      updates.push(`qq = $${paramIndex}`);
      values.push(qq);
      paramIndex++;
    }
    
    if (permissions !== undefined) {
      updates.push(`permissions = $${paramIndex}::jsonb`);
      values.push(JSON.stringify(permissions));
      paramIndex++;
    }
    
    if (show_in_contact !== undefined) {
      updates.push(`show_in_contact = $${paramIndex}`);
      values.push(show_in_contact);
      paramIndex++;
    }
    
    if (show_in_logs !== undefined) {
      updates.push(`show_in_logs = $${paramIndex}`);
      values.push(show_in_logs);
      paramIndex++;
    }
    
    if (data.receive_complaint_email !== undefined) {
      updates.push(`receive_complaint_email = $${paramIndex}`);
      values.push(data.receive_complaint_email);
      paramIndex++;
    }
    
    if (data.receive_application_email !== undefined) {
      updates.push(`receive_application_email = $${paramIndex}`);
      values.push(data.receive_application_email);
      paramIndex++;
    }
    
    if (data.receive_qq_notifications !== undefined) {
      updates.push(`receive_qq_notifications = $${paramIndex}`);
      values.push(data.receive_qq_notifications);
      paramIndex++;
    }
    
    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, message: '没有要更新的字段' },
        { status: 400 }
      );
    }
    
    values.push(parseInt(id));
    
    await sql.query(
      `UPDATE admins SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
    
    return NextResponse.json({
      success: true,
      message: '管理员信息更新成功'
    });
  } catch (error) {
    console.error('更新管理员失败:', error);
    return NextResponse.json(
      { success: false, message: '更新管理员失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // 删除管理员需要服主权限
  const auth = requireOwner(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少管理员ID' },
        { status: 400 }
      );
    }
    
    const admin = await sql`
      SELECT is_owner FROM admins WHERE id = ${parseInt(id)}
    `;
    
    if (admin.length > 0 && admin[0].is_owner) {
      return NextResponse.json(
        { success: false, message: '不能删除服主账号' },
        { status: 400 }
      );
    }
    
    await sql`
      DELETE FROM admins WHERE id = ${parseInt(id)}
    `;
    
    return NextResponse.json({
      success: true,
      message: '管理员删除成功'
    });
  } catch (error) {
    console.error('删除管理员失败:', error);
    return NextResponse.json(
      { success: false, message: '删除管理员失败' },
      { status: 500 }
    );
  }
}
