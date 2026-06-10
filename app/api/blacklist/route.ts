import { NextRequest, NextResponse } from 'next/server';
import { pgPool, withRetry } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

let Rcon: any = null;
try {
  Rcon = require('rcon-client').Rcon;
} catch (e) {
  console.log('rcon-client 加载失败，IP封禁功能将不可用');
}

const query = async (text: string, params: any[] = []) => {
  return withRetry(async () => {
    const result = await pgPool.query(text, params);
    return { rows: result.rows };
  });
};

async function banIPInMinecraft(ip: string, minecraftId: string, reason: string): Promise<{ success: boolean; message: string }> {
  if (!Rcon) {
    return { success: false, message: 'RCON功能不可用' };
  }
  const rconPassword = process.env.RCON_PASSWORD;
  if (!rconPassword) {
    return { success: false, message: 'RCON密码未配置' };
  }
  // M2：校验IP格式，防止RCON命令注入
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
    return { success: false, message: 'IP地址格式无效' };
  }
  // reason中不允许换行符等特殊字符
  const safeReason = reason.replace(/[\r\n]/g, ' ').slice(0, 100);
  try {
    const rconHost = process.env.RCON_HOST || '127.0.0.1';
    const rconPort = parseInt(process.env.RCON_PORT || '25575');

    const rcon = await Rcon.connect({
      host: rconHost,
      port: rconPort,
      password: rconPassword
    });

    const banCommand = `ban-ip ${ip} ${safeReason}`;
    const response = await rcon.send(banCommand);

    await rcon.end();

    return {
      success: true,
      message: `IP封禁成功: ${response}`
    };
  } catch (error) {
    console.error('Minecraft IP封禁失败:', error);
    return {
      success: false,
      message: `IP封禁失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}

async function unbanIPInMinecraft(ip: string): Promise<{ success: boolean; message: string }> {
  if (!Rcon) {
    return { success: false, message: 'RCON功能不可用' };
  }
  const rconPassword = process.env.RCON_PASSWORD;
  if (!rconPassword) {
    return { success: false, message: 'RCON密码未配置' };
  }
  try {
    const rconHost = process.env.RCON_HOST || '127.0.0.1';
    const rconPort = parseInt(process.env.RCON_PORT || '25575');

    const rcon = await Rcon.connect({
      host: rconHost,
      port: rconPort,
      password: rconPassword
    });

    const unbanCommand = `pardon-ip ${ip}`;
    const response = await rcon.send(unbanCommand);

    await rcon.end();

    return {
      success: true,
      message: `IP解封成功: ${response}`
    };
  } catch (error) {
    console.error('Minecraft IP解封失败:', error);
    return {
      success: false,
      message: `IP解封失败: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const offset = (page - 1) * limit;
    try {
      let queryStr = 'SELECT * FROM blacklist';
      let countSql = 'SELECT COUNT(*) FROM blacklist';
      const params: any[] = [];
      const countParams: any[] = [];
      const conditions: string[] = [];
      const countConditions: string[] = [];

      if (!includeInactive) {
        conditions.push('is_active = TRUE');
        countConditions.push('is_active = TRUE');
      }

      if (search) {
        const searchParamIndex = params.length + 1;
        conditions.push(`(minecraft_id ILIKE $${searchParamIndex} OR ip_address ILIKE $${searchParamIndex})`);
        params.push(`%${search}%`);
        
        const countSearchIndex = countParams.length + 1;
        countConditions.push(`(minecraft_id ILIKE $${countSearchIndex} OR ip_address ILIKE $${countSearchIndex})`);
        countParams.push(`%${search}%`);
      }

      if (conditions.length > 0) {
        queryStr += ' WHERE ' + conditions.join(' AND ');
        countSql += ' WHERE ' + countConditions.join(' AND ');
      }

      queryStr += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
      params.push(limit, offset);

      const [entriesResult, countResult] = await Promise.all([
        query(queryStr, params),
        query(countSql, countParams)
      ]);

      const total = parseInt(countResult.rows[0]?.count || '0');

      return NextResponse.json({
        success: true,
        entries: entriesResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (dbError: any) {
      console.error('[Blacklist API] 数据库错误:', dbError);
      if (dbError.message?.includes('does not exist') || dbError.message?.includes('不存在')) {
        return NextResponse.json({
          success: true,
          entries: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0
          }
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('获取黑名单失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取黑名单失败'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { 
      minecraft_id, 
      ip_address, 
      reason, 
      banned_by, 
      banned_by_id,
      application_id,
      whitelist_id,
      duration,
      is_permanent
    } = body;

    if (!minecraft_id || !reason || !banned_by) {
      return NextResponse.json({
        success: false,
        message: '缺少必要参数'
      }, { status: 400 });
    }

    const isPermanent = is_permanent === true || is_permanent === 'true';
    const durationMinutes = isPermanent ? null : (duration ? parseInt(duration) : 1440);
    const expiresAt = isPermanent ? null : new Date(Date.now() + (durationMinutes || 1440) * 60 * 1000).toISOString();

    const checkResult = await query(
      'SELECT id FROM blacklist WHERE minecraft_id = $1 AND is_active = TRUE',
      [minecraft_id]
    );
    
    if (checkResult.rows.length > 0) {
      return NextResponse.json({
        success: false,
        message: '该玩家已在黑名单中'
      }, { status: 400 });
    }

    await query('BEGIN');

    try {
      await query(
        `INSERT INTO blacklist (minecraft_id, ip_address, reason, banned_by, banned_by_id, is_permanent, duration_minutes, expires_at, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)`,
        [minecraft_id, ip_address, reason, banned_by, banned_by_id, isPermanent, durationMinutes, expiresAt]
      );

      if (ip_address) {
        await query(
          `INSERT INTO ip_bans (ip_address, minecraft_id, reason, banned_by, banned_by_id) 
           VALUES ($1, $2, $3, $4, $5)`,
          [ip_address, minecraft_id, reason, banned_by, banned_by_id]
        );
      }

      if (application_id) {
        await query('DELETE FROM whitelist_applications WHERE id = $1', [application_id]);
      }

      if (whitelist_id) {
        await query('DELETE FROM whitelist_applications WHERE id = $1', [whitelist_id]);
      }

      let banResult = { success: false, message: '未执行' };
      if (ip_address) {
        banResult = await banIPInMinecraft(ip_address, minecraft_id, reason);
      }

      await query('COMMIT');

      return NextResponse.json({
        success: true,
        message: '已添加到黑名单并封禁IP',
        banResult,
        expires_at: expiresAt,
        is_permanent: isPermanent
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('添加到黑名单失败:', error);
    return NextResponse.json({
      success: false,
      message: '添加到黑名单失败'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const unbanned_by = searchParams.get('unbanned_by') || '管理员';
    const action = searchParams.get('action') || 'remove';

    if (!id) {
      return NextResponse.json({
        success: false,
        message: '缺少黑名单ID'
      }, { status: 400 });
    }

    const entryResult = await query(
      'SELECT * FROM blacklist WHERE id = $1',
      [id]
    );

    if (entryResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: '黑名单记录不存在'
      }, { status: 404 });
    }

    const entry = entryResult.rows[0];

    await query('BEGIN');

    try {
      if (action === 'revoke') {
        await query(
          `UPDATE blacklist SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [id]
        );

        if (entry.ip_address) {
          await query(
            `UPDATE ip_bans SET is_active = FALSE, unbanned_at = CURRENT_TIMESTAMP, unbanned_by = $1 WHERE ip_address = $2 AND is_active = TRUE`,
            [unbanned_by, entry.ip_address]
          );
          await unbanIPInMinecraft(entry.ip_address);
        }

        await query('COMMIT');
        return NextResponse.json({
          success: true,
          message: '已撤回，用户回到待审核状态'
        });
      }

      await query('DELETE FROM blacklist WHERE id = $1', [id]);

      if (entry.ip_address) {
        await query(
          `UPDATE ip_bans SET is_active = FALSE, unbanned_at = CURRENT_TIMESTAMP, unbanned_by = $1 WHERE ip_address = $2 AND is_active = TRUE`,
          [unbanned_by, entry.ip_address]
        );
        await unbanIPInMinecraft(entry.ip_address);
      }

      await query('COMMIT');

      return NextResponse.json({
        success: true,
        message: '已从黑名单移除并解封IP'
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('从黑名单移除失败:', error);
    return NextResponse.json({
      success: false,
      message: '从黑名单移除失败'
    }, { status: 500 });
  }
}
