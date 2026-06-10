import { NextRequest, NextResponse } from 'next/server';
import sql, { withRetry } from '@/lib/db';

function getToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// 确保quiz_attempts表存在
async function ensureTableExists() {
  try {
    await withRetry(async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS quiz_attempts (
          id SERIAL PRIMARY KEY,
          ip_address VARCHAR(50) NOT NULL,
          attempt_date DATE NOT NULL,
          attempt_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(ip_address, attempt_date)
        )
      `;
    });
  } catch (error) {
    console.error('创建表失败:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureTableExists();
    
    const forwardedFor = request.headers.get('x-forwarded-for');
  let ip = forwardedFor ? forwardedFor.split(',')[0].trim() : (request.ip || 'unknown');
  
  // 处理本地IP地址，将IPv4和IPv6统一
  if (ip === '::1' || ip === '127.0.0.1') {
    ip = '127.0.0.1';
  }

  console.log('GET /api/quiz/attempts - IP:', ip);

    const adminCookie = request.headers.get('cookie');
    if (adminCookie && adminCookie.includes('admin-token')) {
      try {
        const adminCheck = await fetch(new URL('http://localhost:3000/api/admin/check'), {
          method: 'GET',
          headers: { 'cookie': adminCookie },
          credentials: 'include'
        });
        if (adminCheck.ok) {
          const adminData = await adminCheck.json();
          if (adminData.isAdmin) {
            return NextResponse.json({
              success: true,
              attemptsLeft: 999,
              message: '管理员不受答题次数限制'
            });
          }
        }
      } catch (error) {
        console.error('Admin check failed:', error);
      }
    }

    const today = getToday();
    let result = await withRetry(async () => {
      return await sql`
        SELECT attempt_count FROM quiz_attempts 
        WHERE ip_address = ${ip} AND attempt_date = ${today}
      `;
    });

    let attemptsLeft = 3;
    if (result && result.length > 0) {
      attemptsLeft = Math.max(0, 3 - result[0].attempt_count);
    }

    return NextResponse.json({
      success: true,
      attemptsLeft,
      message: attemptsLeft > 0 ? '可以答题' : '今日答题次数已用完'
    });
  } catch (error) {
    console.error('检查答题次数失败:', error);
    return NextResponse.json(
      { success: false, message: '检查答题次数失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureTableExists();
    
    const forwardedFor = request.headers.get('x-forwarded-for');
  let ip = forwardedFor ? forwardedFor.split(',')[0].trim() : (request.ip || 'unknown');
  
  // 统一本地IP地址，避免IPv4和IPv6的差异
  if (ip === '::1' || ip === '127.0.0.1') {
    ip = '127.0.0.1';
  }

  console.log('POST /api/quiz/attempts - IP:', ip);

    const adminCookie = request.headers.get('cookie');
    if (adminCookie && adminCookie.includes('admin-token')) {
      try {
        const adminCheck = await fetch(new URL('http://localhost:3000/api/admin/check'), {
          method: 'GET',
          headers: { 'cookie': adminCookie },
          credentials: 'include'
        });
        if (adminCheck.ok) {
          const adminData = await adminCheck.json();
          if (adminData.isAdmin) {
            return NextResponse.json({
              success: true,
              message: '管理员不受答题次数限制'
            });
          }
        }
      } catch (error) {
        console.error('Admin check failed:', error);
      }
    }

    const today = getToday();

    let result = await withRetry(async () => {
      return await sql`
        SELECT attempt_count FROM quiz_attempts 
        WHERE ip_address = ${ip} AND attempt_date = ${today}
      `;
    });

    if (result && result.length > 0) {
      if (result[0].attempt_count >= 3) {
        return NextResponse.json(
          { success: false, message: '今日答题次数已用完' },
          { status: 400 }
        );
      }
      await withRetry(async () => {
        await sql`
          UPDATE quiz_attempts 
          SET attempt_count = attempt_count + 1, updated_at = CURRENT_TIMESTAMP
          WHERE ip_address = ${ip} AND attempt_date = ${today}
        `;
      });
    } else {
      await withRetry(async () => {
        await sql`
          INSERT INTO quiz_attempts (ip_address, attempt_date, attempt_count)
          VALUES (${ip}, ${today}, 1)
        `;
      });
    }

    return NextResponse.json({
      success: true,
      message: '答题次数已更新'
    });
  } catch (error) {
    console.error('更新答题次数失败:', error);
    return NextResponse.json(
      { success: false, message: '更新答题次数失败' },
      { status: 500 }
    );
  }
}
