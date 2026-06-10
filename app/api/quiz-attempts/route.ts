import { NextRequest, NextResponse } from 'next/server';
import sql, { withRetry } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// 获取客户端 IP 地址
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const requestIP = request.ip;

  let ip = 'unknown';
  
  if (forwarded) {
    ip = forwarded.split(',')[0].trim();
  } else if (realIP) {
    ip = realIP;
  } else if (requestIP) {
    ip = requestIP;
  }

  // 统一本地IP地址，避免IPv4和IPv6的差异
  if (ip === '::1' || ip === '127.0.0.1') {
    ip = '127.0.0.1';
  }

  return ip;
}

// 获取日期字符串（中国时间）
function getChinaDateString(): string {
  const now = new Date();
  const chinaTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return chinaTime.toISOString().split('T')[0];
}

// 初始化数据库表
async function initTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id SERIAL PRIMARY KEY,
        ip_address VARCHAR(45) NOT NULL,
        attempt_date DATE NOT NULL,
        attempt_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(ip_address, attempt_date)
      )
    `;
  } catch (error) {
    console.error('创建 quiz_attempts 表失败:', error);
  }
}

// 获取今天的答题次数（不需要登录）
export async function GET(request: NextRequest) {
  try {
    // 确保表存在
    await initTable();

    const ip = getClientIP(request);
    const today = getChinaDateString();

    const result = await withRetry(async () => {
      return await sql`
        SELECT attempt_count FROM quiz_attempts
        WHERE ip_address = ${ip} AND attempt_date = ${today}
      `;
    });

    const attemptCount = result.length > 0 ? result[0].attempt_count : 0;

    return NextResponse.json({
      success: true,
      ip,
      date: today,
      attemptCount,
      maxAttempts: 3,
      remaining: Math.max(0, 3 - attemptCount)
    });
  } catch (error) {
    console.error('获取答题次数失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取答题次数失败'
    }, { status: 500 });
  }
}

// 增加答题次数（不需要登录）
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const today = getChinaDateString();

    await initTable();

    await withRetry(async () => {
      await sql`
        INSERT INTO quiz_attempts (ip_address, attempt_date, attempt_count, updated_at)
        VALUES (${ip}, ${today}, 1, CURRENT_TIMESTAMP)
        ON CONFLICT (ip_address, attempt_date)
        DO UPDATE SET
          attempt_count = quiz_attempts.attempt_count + 1,
          updated_at = CURRENT_TIMESTAMP
      `;
    });

    const result = await withRetry(async () => {
      return await sql`
        SELECT attempt_count FROM quiz_attempts
        WHERE ip_address = ${ip} AND attempt_date = ${today}
      `;
    });

    const attemptCount = result.length > 0 ? result[0].attempt_count : 0;

    return NextResponse.json({
      success: true,
      ip,
      date: today,
      attemptCount,
      maxAttempts: 3,
      remaining: Math.max(0, 3 - attemptCount)
    });
  } catch (error) {
    console.error('增加答题次数失败:', error);
    return NextResponse.json({
      success: false,
      error: '增加答题次数失败'
    }, { status: 500 });
  }
}

// 重置答题次数（不需要登录）
export async function DELETE(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const today = getChinaDateString();

    await initTable();

    await withRetry(async () => {
      await sql`
        DELETE FROM quiz_attempts
        WHERE ip_address = ${ip} AND attempt_date = ${today}
      `;
    });

    return NextResponse.json({
      success: true,
      ip,
      date: today,
      message: '答题次数已重置'
    });
  } catch (error) {
    console.error('重置答题次数失败:', error);
    return NextResponse.json({
      success: false,
      error: '重置答题次数失败'
    }, { status: 500 });
  }
}
