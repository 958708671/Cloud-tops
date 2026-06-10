import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { requireAuth } from '@/lib/auth';

const sql = neon(process.env.DATABASE_URL || '');

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    
    const result = await sql`
      SELECT minecraft_id FROM blacklist WHERE id = ${parseInt(id)}
    `;
    
    if (result.length > 0) {
      const minecraft_id = result[0].minecraft_id;
      
      await sql`
        DELETE FROM blacklist WHERE id = ${parseInt(id)}
      `;
      
      // 修复：只将该玩家"最新一条"待审核/被拒绝的申请重置为 pending
      // 不应将所有历史申请改为 approved，那会导致数据混乱
      await sql`
        UPDATE whitelist_applications 
        SET status = 'pending',
            review_note = '已从黑名单移除，重新开放申请'
        WHERE minecraft_id = ${minecraft_id}
          AND id = (
            SELECT id FROM whitelist_applications 
            WHERE minecraft_id = ${minecraft_id}
            ORDER BY created_at DESC 
            LIMIT 1
          )
          AND status IN ('rejected', 'pending')
      `;
    }
    
    return NextResponse.json({
      success: true,
      message: '已从黑名单移除'
    });
  } catch (error) {
    console.error('移除黑名单失败:', error);
    return NextResponse.json(
      { success: false, message: '移除黑名单失败' },
      { status: 500 }
    );
  }
}
