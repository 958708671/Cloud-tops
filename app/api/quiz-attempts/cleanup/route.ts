import { NextResponse } from 'next/server';
import sql, { withRetry } from '@/lib/db';

// 清理过期的答题记录（删除昨天之前的记录）
export async function DELETE(request: Request) {
  try {
    // 获取中国时间的昨天日期
    const now = new Date();
    const chinaTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const yesterday = new Date(chinaTime);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // 删除昨天的记录
    const result = await withRetry(async () => {
      return await sql`
        DELETE FROM quiz_attempts
        WHERE attempt_date < ${yesterdayStr}
      `;
    });

    return NextResponse.json({
      success: true,
      message: `已清理 ${yesterdayStr} 及之前的答题记录`,
      deletedDate: yesterdayStr
    });
  } catch (error) {
    console.error('清理答题记录失败:', error);
    return NextResponse.json({
      success: false,
      error: '清理答题记录失败'
    }, { status: 500 });
  }
}

// 获取清理状态
export async function GET() {
  try {
    const now = new Date();
    const chinaTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const today = chinaTime.toISOString().split('T')[0];
    const yesterday = new Date(chinaTime);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // 统计今天的记录数
    const todayCount = await withRetry(async () => {
      return await sql`
        SELECT COUNT(*) as count FROM quiz_attempts
        WHERE attempt_date = ${today}
      `;
    });

    // 统计过期的记录数
    const expiredCount = await withRetry(async () => {
      return await sql`
        SELECT COUNT(*) as count FROM quiz_attempts
        WHERE attempt_date < ${yesterdayStr}
      `;
    });

    return NextResponse.json({
      success: true,
      today,
      yesterdayStr,
      todayRecords: todayCount[0]?.count || 0,
      expiredRecords: expiredCount[0]?.count || 0
    });
  } catch (error) {
    console.error('获取清理状态失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取清理状态失败'
    }, { status: 500 });
  }
}
