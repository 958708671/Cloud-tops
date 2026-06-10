import { NextRequest, NextResponse } from 'next/server';
import sql, { withRetry } from '@/lib/db';
import { requireOwner } from '@/lib/auth';

export async function GET() {
  try {
    const result = await withRetry(async () => {
      return await sql`
        SELECT setting_key, setting_value FROM server_settings
      `;
    });

    const settings: Record<string, string> = {};
    result.forEach((s: any) => {
      settings[s.setting_key] = s.setting_value || '';
    });

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('获取服务器设置失败:', error);
    return NextResponse.json(
      { success: false, message: '获取服务器设置失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = requireOwner(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const data = await request.json();
    const { settings } = data;

    if (!settings) {
      return NextResponse.json(
        { success: false, message: '缺少设置数据' },
        { status: 400 }
      );
    }

    for (const [key, value] of Object.entries(settings)) {
      await withRetry(async () => {
        return await sql`
          INSERT INTO server_settings (setting_key, setting_value, updated_at)
          VALUES (${key}, ${value as string}, NOW())
          ON CONFLICT (setting_key)
          DO UPDATE SET setting_value = ${value as string}, updated_at = NOW()
        `;
      });
    }

    console.log('服务器设置已保存:', settings);

    return NextResponse.json({
      success: true,
      message: '服务器设置已保存',
    });
  } catch (error) {
    console.error('保存服务器设置失败:', error);
    return NextResponse.json(
      { success: false, message: '保存服务器设置失败' },
      { status: 500 }
    );
  }
}
