import { NextRequest, NextResponse } from 'next/server';
import sql, { withRetry } from '@/lib/db';
import { setSessionCookie } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// 简单的内存存储登录失败计数（生产环境应使用Redis）
const loginFailures = new Map<string, { count: number; lastFail: number }>();
const MAX_FAILURES = 3;
const LOCKOUT_DURATION = 60 * 1000; // 1分钟冷却

// 获取客户端IP地址
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

// 管理员登录接口
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    const clientIP = getClientIP(request);

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: '请输入用户名和密码' },
        { status: 400 }
      );
    }

    // 检查冷却状态
    const failureInfo = loginFailures.get(clientIP);
    if (failureInfo && failureInfo.count >= MAX_FAILURES) {
      const now = Date.now();
      if (now - failureInfo.lastFail < LOCKOUT_DURATION) {
        const remainingSeconds = Math.ceil((LOCKOUT_DURATION - (now - failureInfo.lastFail)) / 1000);
        return NextResponse.json(
          { success: false, message: `登录失败次数过多，请 ${remainingSeconds} 秒后重试` },
          { status: 429 }
        );
      } else {
        // 冷却时间已过，重置计数
        loginFailures.delete(clientIP);
      }
    }

    // 查询管理员
    const admins = await withRetry(async () => {
      return await sql`
        SELECT id, username, display_name, qq, is_owner, password FROM admins
        WHERE (username = ${username} OR qq = ${username})
      `;
    });

    if (admins.length === 0) {
      // 记录失败
      updateFailureCount(clientIP);
      return NextResponse.json(
        { success: false, message: '用户名或密码错误' },
        { status: 401 }
      );
    }

    const admin = admins[0];
    const storedPassword: string = admin.password;

    // 验证密码
    const passwordValid = await bcrypt.compare(password, storedPassword);

    if (!passwordValid) {
      // 记录失败
      updateFailureCount(clientIP);
      return NextResponse.json(
        { success: false, message: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 登录成功，清除失败记录
    loginFailures.delete(clientIP);

    // 记录成功登录日志
    try {
      const displayName = admin.display_name || admin.username;
      await withRetry(async () => {
        return await sql`
          INSERT INTO admin_logs (admin_id, action, details, ip_address, created_at)
          VALUES (${admin.id}, 'login', ${displayName} 登录成功, ${clientIP}, NOW())
        `;
      });
    } catch (logError) {
      console.error('记录登录日志失败:', logError);
    }

    const responseBody = {
      success: true,
      user: admin.username,
      adminId: admin.id,
      qq: admin.qq,
      isOwner: admin.is_owner,
    };

    const response = NextResponse.json(responseBody);
    setSessionCookie(response, {
      adminId: admin.id,
      username: admin.username,
      isOwner: Boolean(admin.is_owner),
      qq: admin.qq || '',
    });
    return response;

  } catch (error: any) {
    console.error('登录失败:', error);
    return NextResponse.json(
      { success: false, message: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}

function updateFailureCount(clientIP: string) {
  const now = Date.now();
  const existing = loginFailures.get(clientIP);
  if (existing) {
    existing.count += 1;
    existing.lastFail = now;
  } else {
    loginFailures.set(clientIP, { count: 1, lastFail: now });
  }
}