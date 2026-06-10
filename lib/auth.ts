import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE = 'admin_session';
// 从环境变量读取密钥，若未设置则用一个随机串（每次冷启动都不同，可保证不泄露默认密钥）
// 同时支持 SESSION_SECRET 和 AUTH_SECRET 环境变量
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.AUTH_SECRET || (() => {
  // Serverless 环境每个实例一次性，使用随机值
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
})();

export interface AdminSession {
  adminId: number;
  username: string;
  isOwner: boolean;
  qq: string;
}

/** 将 session 数据序列化为简单签名令牌（base64.signature） */
function encodeSession(session: AdminSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

/** 验证并解析令牌，失败返回 null */
function decodeSession(token: string): AdminSession | null {
  try {
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return null;
    const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
    // 时序安全比较
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AdminSession;
  } catch {
    return null;
  }
}

/** 登录成功后在响应中设置 session cookie */
export function setSessionCookie(response: NextResponse, session: AdminSession): NextResponse {
  const token = encodeSession(session);
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8小时
    // 开发环境不使用 secure，因为 localhost 可能不是 HTTPS
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}

/** 从请求中获取当前 session，无效则返回 null */
export function getSession(request: NextRequest): AdminSession | null {
  try {
    // 在 App Router 中，使用 cookies() 函数获取 cookies
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return decodeSession(token);
  } catch (error) {
    console.error('获取session失败:', error);
    return null;
  }
}

/** 清除 session cookie（登出用） */
export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}

/** 鉴权守卫：用于需要登录的管理 API，未登录返回 401 */
export function requireAuth(request: NextRequest): { session: AdminSession } | NextResponse {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json(
      { success: false, message: '未授权，请先登录' },
      { status: 401 }
    );
  }
  return { session };
}

/** 鉴权守卫：要求服主权限 */
export function requireOwner(request: NextRequest): { session: AdminSession } | NextResponse {
  const result = requireAuth(request);
  if (result instanceof NextResponse) return result;
  if (!result.session.isOwner) {
    return NextResponse.json(
      { success: false, message: '权限不足，需要服主权限' },
      { status: 403 }
    );
  }
  return result;
}
