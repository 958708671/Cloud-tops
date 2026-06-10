import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { requireOwner } from '@/lib/auth';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL || '');

// 初始密码从环境变量读取，不在源码中硬编码
// 在 Vercel Dashboard / .env.local 中配置：
//   RESTORE_PASSWORD_OWNER, RESTORE_PASSWORD_ADMIN1, RESTORE_PASSWORD_ADMIN2, RESTORE_PASSWORD_ADMIN3
const getRestorePasswords = () => ({
  owner:  process.env.RESTORE_PASSWORD_OWNER  || '',
  admin1: process.env.RESTORE_PASSWORD_ADMIN1 || '',
  admin2: process.env.RESTORE_PASSWORD_ADMIN2 || '',
  admin3: process.env.RESTORE_PASSWORD_ADMIN3 || '',
});

export async function POST(request: NextRequest) {
  // 仅服主可执行恢复操作
  const auth = requireOwner(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const passwords = getRestorePasswords();
    if (!passwords.owner || !passwords.admin1 || !passwords.admin2 || !passwords.admin3) {
      return NextResponse.json(
        { success: false, message: '恢复密码未配置，请在环境变量中设置 RESTORE_PASSWORD_* 后重试' },
        { status: 500 }
      );
    }

    // 检查是否已经存在管理员
    const existingAdmins = await sql`SELECT COUNT(*) as count FROM admins`;
    
    if (existingAdmins[0]?.count > 0) {
      return NextResponse.json({
        success: false,
        message: '管理员数据已存在，无需恢复',
        count: existingAdmins[0].count
      });
    }

    // 插入服主账号（密码使用 bcrypt 哈希）
    const hash1 = await bcrypt.hash(passwords.owner, 12);
    await sql`
      INSERT INTO admins (username, password, qq, display_name, is_owner, permissions, show_in_contact, show_in_logs) 
      VALUES (
        '958708671', 
        ${hash1}, 
        '958708671', 
        '服主', 
        TRUE, 
        '{
          "whitelist_review": true,
          "complaint_handle": true,
          "blacklist_manage": true,
          "announcement_manage": true,
          "event_manage": true,
          "statistics_view": true,
          "settings_view": true,
          "website_edit": true,
          "admin_manage": true,
          "logs_view": true,
          "monitor_view": true
        }'::jsonb, 
        TRUE, 
        TRUE
      )
    `;

    // 插入管理员账号
    const hash2 = await bcrypt.hash(passwords.admin1, 12);
    await sql`
      INSERT INTO admins (username, password, qq, display_name, is_owner, permissions, show_in_contact, show_in_logs) 
      VALUES (
        '2801699303', 
        ${hash2}, 
        '2801699303', 
        'fly_yu', 
        FALSE, 
        '{
          "whitelist_review": true,
          "complaint_handle": true,
          "blacklist_manage": true,
          "announcement_manage": true,
          "event_manage": true,
          "statistics_view": true,
          "settings_view": false,
          "website_edit": false,
          "admin_manage": false,
          "logs_view": false,
          "monitor_view": false
        }'::jsonb, 
        TRUE, 
        TRUE
      )
    `;

    const hash3 = await bcrypt.hash(passwords.admin2, 12);
    await sql`
      INSERT INTO admins (username, password, qq, display_name, is_owner, permissions, show_in_contact, show_in_logs) 
      VALUES (
        '345258083', 
        ${hash3}, 
        '345258083', 
        'fuyou', 
        FALSE, 
        '{
          "whitelist_review": true,
          "complaint_handle": true,
          "blacklist_manage": true,
          "announcement_manage": true,
          "event_manage": true,
          "statistics_view": true,
          "settings_view": false,
          "website_edit": false,
          "admin_manage": false,
          "logs_view": false,
          "monitor_view": false
        }'::jsonb, 
        TRUE, 
        TRUE
      )
    `;

    const hash4 = await bcrypt.hash(passwords.admin3, 12);
    await sql`
      INSERT INTO admins (username, password, qq, display_name, is_owner, permissions, show_in_contact, show_in_logs) 
      VALUES (
        '939588079', 
        ${hash4}, 
        '939588079', 
        '豌豆', 
        FALSE, 
        '{
          "whitelist_review": true,
          "complaint_handle": true,
          "blacklist_manage": true,
          "announcement_manage": true,
          "event_manage": true,
          "statistics_view": true,
          "settings_view": false,
          "website_edit": false,
          "admin_manage": false,
          "logs_view": false,
          "monitor_view": false
        }'::jsonb, 
        TRUE, 
        TRUE
      )
    `;

    return NextResponse.json({
      success: true,
      message: '管理员数据恢复成功',
      restored: 4
    });

  } catch (error) {
    console.error('恢复管理员数据失败:', error);
    return NextResponse.json(
      { success: false, message: '恢复管理员数据失败' },
      { status: 500 }
    );
  }
}
