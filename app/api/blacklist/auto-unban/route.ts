import { NextRequest, NextResponse } from 'next/server';
import { pgPool, withRetry } from '@/lib/db';

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

async function sendReminderEmail(
  to: string,
  minecraftId: string,
  bannedBy: string,
  reason: string,
  expiresAt: string,
  remainingMinutes: number
): Promise<{ success: boolean; message: string }> {
  try {
    const nodemailer = require('nodemailer');
    
    const service = process.env.EMAIL_SERVICE || 'qq';
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    
    if (!user || !pass) {
      return { success: false, message: '邮件配置未设置' };
    }
    
    const serviceConfigs: Record<string, { host: string; port: number; secure: boolean }> = {
      qq: { host: 'smtp.qq.com', port: 465, secure: true },
      gmail: { host: 'smtp.gmail.com', port: 587, secure: false },
      '163': { host: 'smtp.163.com', port: 465, secure: true }
    };
    
    const serviceConfig = serviceConfigs[service] || { host: 'smtp.qq.com', port: 465, secure: true };
    
    const transporter = nodemailer.createTransport({
      host: serviceConfig.host,
      port: serviceConfig.port,
      secure: serviceConfig.secure,
      auth: { user, pass }
    });
    
    const formattedDate = new Date(expiresAt).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const mailOptions = {
      from: `"Cloud tops 云顶之境" <${user}>`,
      to,
      subject: `【提醒】黑名单即将解封 - ${minecraftId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #f59e0b;">⚠️ 黑名单即将解封提醒</h2>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>被封禁用户：</strong>${minecraftId}</p>
            <p style="margin: 10px 0;"><strong>封禁原因：</strong>${reason}</p>
            <p style="margin: 10px 0;"><strong>封禁人：</strong>${bannedBy}</p>
            <p style="margin: 10px 0;"><strong>预计解封时间：</strong>${formattedDate}</p>
            <p style="margin: 10px 0; color: #f59e0b;"><strong>剩余时间：</strong>约 ${remainingMinutes} 分钟</p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            系统将在用户解封前发送此提醒通知。如果您需要继续封禁该用户，请及时处理。
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px;">
            此邮件由系统自动发送，请勿回复。
          </p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('提醒邮件发送成功:', info.messageId);
    return { success: true, message: '提醒邮件发送成功' };
  } catch (error) {
    console.error('发送提醒邮件失败:', error);
    return { success: false, message: String(error) };
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.CRON_API_KEY;
  
  // 必须在环境变量中设置 CRON_API_KEY，不允许回退到默认值
  if (!apiKey) {
    console.error('[auto-unban] CRON_API_KEY 未设置，拒绝所有请求');
    return NextResponse.json({ success: false, message: '服务未配置' }, { status: 503 });
  }
  
  if (authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ success: false, message: '未授权' }, { status: 401 });
  }

  try {
    const results: {
      expired: number;
      reminded: number;
      errors: string[];
    } = {
      expired: 0,
      reminded: 0,
      errors: []
    };

    const now = new Date();
    const reminderTime = new Date(now.getTime() + 10 * 60 * 1000);

    const expiredResult = await query(
      `SELECT * FROM blacklist 
       WHERE is_active = TRUE 
       AND expires_at IS NOT NULL 
       AND expires_at <= $1`,
      [now.toISOString()]
    );

    for (const entry of expiredResult.rows) {
      try {
        await query('BEGIN');
        
        await query(
          `UPDATE blacklist SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [entry.id]
        );

        if (entry.ip_address) {
          await query(
            `UPDATE ip_bans SET is_active = FALSE, unbanned_at = CURRENT_TIMESTAMP, unbanned_by = '系统自动解封' WHERE ip_address = $1 AND is_active = TRUE`,
            [entry.ip_address]
          );
          await unbanIPInMinecraft(entry.ip_address);
        }

        await query('COMMIT');
        results.expired++;
        console.log(`已自动解封用户: ${entry.minecraft_id}`);
      } catch (error) {
        await query('ROLLBACK').catch(() => {});
        results.errors.push(`解封 ${entry.minecraft_id} 失败: ${error}`);
        console.error(`自动解封失败: ${entry.minecraft_id}`, error);
      }
    }

    const reminderResult = await query(
      `SELECT * FROM blacklist 
       WHERE is_active = TRUE 
       AND expires_at IS NOT NULL 
       AND expires_at > $1 
       AND expires_at <= $2`,
      [now.toISOString(), reminderTime.toISOString()]
    );

    const adminEmail = process.env.ADMIN_EMAIL;
    
    for (const entry of reminderResult.rows) {
      try {
        const expiresAt = new Date(entry.expires_at);
        const remainingMinutes = Math.round((expiresAt.getTime() - now.getTime()) / 60000);
        
        if (adminEmail) {
          const emailResult = await sendReminderEmail(
            adminEmail,
            entry.minecraft_id,
            entry.banned_by,
            entry.reason,
            entry.expires_at,
            remainingMinutes
          );
          
          if (emailResult.success) {
            results.reminded++;
            console.log(`已发送解封提醒: ${entry.minecraft_id}, 剩余 ${remainingMinutes} 分钟`);
          }
        }
      } catch (error) {
        results.errors.push(`提醒 ${entry.minecraft_id} 失败: ${error}`);
        console.error(`发送提醒失败: ${entry.minecraft_id}`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `处理完成`,
      ...results
    });
  } catch (error) {
    console.error('自动解封任务执行失败:', error);
    return NextResponse.json({
      success: false,
      message: '任务执行失败',
      error: String(error)
    }, { status: 500 });
  }
}
