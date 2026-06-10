import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE = 'admin_session';
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.AUTH_SECRET || (() => {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
})();

export interface AdminSession {
  adminId: number;
  username: string;
  isOwner: boolean;
  qq: string;
}

function decodeSession(token: string): AdminSession | null {
  try {
    const [payload, sig] = token.split('.');
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');

    if (sig !== expectedSig) {
      return null;
    }

    return JSON.parse(Buffer.from(payload, 'base64url').toString());
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE);

    if (!sessionCookie?.value) {
      return NextResponse.json({
        isAdmin: false,
        adminId: null,
        username: null
      });
    }

    const session = decodeSession(sessionCookie.value);

    if (!session) {
      return NextResponse.json({
        isAdmin: false,
        adminId: null,
        username: null
      });
    }

    return NextResponse.json({
      isAdmin: true,
      adminId: session.adminId,
      username: session.username
    });
  } catch (error) {
    console.error('检查管理员状态失败:', error);
    return NextResponse.json({
      isAdmin: false,
      adminId: null,
      username: null,
      error: '检查管理员状态失败'
    }, { status: 500 });
  }
}
