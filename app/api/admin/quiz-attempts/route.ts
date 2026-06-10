import { NextRequest, NextResponse } from 'next/server';
import sql, { withRetry } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

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

// 获取所有 IP 的答题记录
export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    await ensureTableExists();
    
    const { searchParams } = new URL(request.url);
    const ip = searchParams.get('ip');
    const date = searchParams.get('date');

    let result;

    if (ip && date) {
      result = await withRetry(async () => {
        return await sql`
          SELECT ip_address, attempt_date, attempt_count, created_at, updated_at
          FROM quiz_attempts
          WHERE ip_address LIKE ${'%' + ip + '%'} AND attempt_date = ${date}
          ORDER BY updated_at DESC LIMIT 100
        `;
      });
    } else if (ip) {
      result = await withRetry(async () => {
        return await sql`
          SELECT ip_address, attempt_date, attempt_count, created_at, updated_at
          FROM quiz_attempts
          WHERE ip_address LIKE ${'%' + ip + '%'}
          ORDER BY updated_at DESC LIMIT 100
        `;
      });
    } else if (date) {
      result = await withRetry(async () => {
        return await sql`
          SELECT ip_address, attempt_date, attempt_count, created_at, updated_at
          FROM quiz_attempts
          WHERE attempt_date = ${date}
          ORDER BY updated_at DESC LIMIT 100
        `;
      });
    } else {
      result = await withRetry(async () => {
        return await sql`
          SELECT ip_address, attempt_date, attempt_count, created_at, updated_at
          FROM quiz_attempts
          ORDER BY updated_at DESC LIMIT 100
        `;
      });
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取答题记录失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取答题记录失败'
    }, { status: 500 });
  }
}

// 重置 IP 的答题次数
export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    await ensureTableExists();
    
    const body = await request.json();
    const { ip, action } = body;

    if (!ip) {
      return NextResponse.json({
        success: false,
        error: '请提供 IP 地址'
      }, { status: 400 });
    }

    if (action === 'reset') {
      // 重置为 0 次
      await withRetry(async () => {
        await sql`
          UPDATE quiz_attempts
          SET attempt_count = 0, updated_at = CURRENT_TIMESTAMP
          WHERE ip_address = ${ip}
        `;
      });

      return NextResponse.json({
        success: true,
        message: `已重置 IP ${ip} 的答题次数`
      });
    } else if (action === 'unlock') {
      // 完全删除记录（解锁）
      await withRetry(async () => {
        await sql`
          DELETE FROM quiz_attempts WHERE ip_address = ${ip}
        `;
      });

      return NextResponse.json({
        success: true,
        message: `已解除 IP ${ip} 的答题限制`
      });
    } else {
      return NextResponse.json({
        success: false,
        error: '无效的操作'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('操作失败:', error);
    return NextResponse.json({
      success: false,
      error: '操作失败'
    }, { status: 500 });
  }
}
