import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { requireAuth } from '@/lib/auth';

const sql = neon(process.env.DATABASE_URL || '');

// 允许写入的 key 白名单，防止任意 key 注入系统设置表
const ALLOWED_KEYS = new Set([
  'site_title', 'site_description', 'welcome_message', 'server_name',
  'server_ip', 'server_port', 'server_version', 'qq_group',
  'client_download_url', 'contact_email', 'admin_email',
  'maintenance_mode', 'allow_apply', 'require_terms',
]);

export async function GET() {
  try {
    const settings = await sql`
      SELECT setting_key, setting_value, description FROM system_settings
    `;
    
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.setting_key] = s.setting_value;
    });
    
    return NextResponse.json({
      success: true,
      data: settingsMap
    });
  } catch (error) {
    console.error('获取系统设置失败:', error);
    return NextResponse.json(
      { success: false, message: '获取系统设置失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  try {
    const data = await request.json();

    if (data.contact_email && !emailRegex.test(data.contact_email)) {
      return NextResponse.json(
        { success: false, message: '联系邮箱格式不正确' },
        { status: 400 }
      );
    }

    if (data.admin_email && !emailRegex.test(data.admin_email)) {
      return NextResponse.json(
        { success: false, message: '管理员邮箱格式不正确' },
        { status: 400 }
      );
    }

    for (const [key, value] of Object.entries(data)) {
      // 白名单校验，防止任意 key 写入
      if (!ALLOWED_KEYS.has(key)) {
        console.warn(`[Settings] 拒绝写入非白名单 key: ${key}`);
        continue;
      }
      await sql`
        INSERT INTO system_settings (setting_key, setting_value, updated_at)
        VALUES (${key}, ${String(value)}, NOW())
        ON CONFLICT (setting_key) 
        DO UPDATE SET setting_value = ${String(value)}, updated_at = NOW()
      `;
    }
    
    return NextResponse.json({
      success: true,
      message: '设置保存成功'
    });
  } catch (error) {
    console.error('保存系统设置失败:', error);
    return NextResponse.json(
      { success: false, message: '保存系统设置失败' },
      { status: 500 }
    );
  }
}
