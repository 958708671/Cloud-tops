import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { requireOwner } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = requireOwner(request);
  if (auth instanceof NextResponse) return auth;
  try {
    await sql`SELECT 1 as test`;
    return NextResponse.json({
      success: true,
      connected: true,
      message: '数据库连接正常'
    });
  } catch {
    return NextResponse.json({
      success: false,
      connected: false,
      message: '数据库连接失败'
    });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireOwner(request);
  if (auth instanceof NextResponse) return auth;
  try {
    await sql`SELECT 1 as test`;
    return NextResponse.json({
      success: true,
      connected: true,
      message: '数据库连接正常'
    });
  } catch {
    return NextResponse.json({
      success: false,
      connected: false,
      message: '数据库连接失败'
    });
  }
}
