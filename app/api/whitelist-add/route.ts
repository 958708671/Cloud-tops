import { NextRequest, NextResponse } from 'next/server';
import { addToWhitelist } from '@/lib/rcon';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { host, port, password, playerName } = await request.json();
    
    if (!host || !password || !playerName) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    const result = await addToWhitelist(host, port || 25575, password, playerName);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('添加白名单失败:', error);
    return NextResponse.json({
      success: false,
      message: error.message || '添加失败'
    });
  }
}
