import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = getSession(request);
    
    if (session) {
      return NextResponse.json({
        success: true,
        admin: {
          adminId: session.adminId,
          username: session.username,
          isOwner: session.isOwner,
          qq: session.qq
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: '未登录'
      });
    }
  } catch (error) {
    console.error('检查登录状态失败:', error);
    return NextResponse.json(
      { success: false, message: '检查登录状态失败' },
      { status: 500 }
    );
  }
}
