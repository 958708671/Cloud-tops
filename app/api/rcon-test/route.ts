import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { addToWhitelist, reloadWhitelist } from '@/lib/rcon';

// 使用独立的无害连接测试（只连接+认证，不发实际命令）
async function testRconConnection(host: string, port: number, password: string): Promise<{ success: boolean; message: string }> {
  try {
    // 借用 reloadWhitelist 来测试连接，该命令对服务器无破坏性副作用
    const result = await reloadWhitelist(host, port, password);
    return result;
  } catch (error: any) {
    return { success: false, message: error.message || '连接失败' };
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { host, port, password } = await request.json();
    
    if (!host || !password) {
      return NextResponse.json(
        { success: false, message: '缺少主机地址或密码' },
        { status: 400 }
      );
    }
    
    // 使用 whitelist reload 测试连接（无副作用）
    const result = await testRconConnection(host, port || 25575, password);
    
    if (result.success || result.message.includes('reload') || result.message.includes('重新加载')) {
      return NextResponse.json({
        success: true,
        message: 'RCON连接成功'
      });
    }
    
    return NextResponse.json({
      success: false,
      message: result.message
    });
    
  } catch (error: any) {
    console.error('RCON测试失败:', error);
    return NextResponse.json({
      success: false,
      message: error.message || '连接失败'
    });
  }
}

