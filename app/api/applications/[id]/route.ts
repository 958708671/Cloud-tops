import { NextRequest, NextResponse } from 'next/server';
import sql, { withRetry } from '@/lib/db';
import nodemailer from 'nodemailer';
import { execFile } from 'child_process';
import path from 'path';
import { requireAuth } from '@/lib/auth';


const rconAddToWhitelist = async (
  host: string,
  port: number,
  password: string,
  playerName: string
): Promise<{ success: boolean; message: string }> => {
  const scriptPath = path.join(process.cwd(), 'scripts', 'rcon-cli.js');
  
  // 使用 execFile 替代 exec，避免 Shell 命令注入；参数作为独立数组传递
  const runScript = (args: string[]): Promise<{ success: boolean; message: string }> =>
    new Promise((resolve) => {
      execFile('node', [scriptPath, ...args], { timeout: 10000 }, (error, stdout) => {
        if (error) {
          resolve({ success: false, message: `执行失败: ${error.message}` });
          return;
        }
        try {
          resolve(JSON.parse(stdout.trim()));
        } catch {
          resolve({ success: false, message: `解析输出失败: ${stdout}` });
        }
      });
    });

  try {
    const addResult = await runScript([host, String(port), password, `whitelist add ${playerName}`]);
    if (!addResult.success) return addResult;

    const reloadResult = await runScript([host, String(port), password, 'whitelist reload']);
    return {
      success: true,
      message: `添加成功: ${addResult.message}, 重载成功: ${reloadResult.message}`
    };
  } catch (error) {
    return { success: false, message: `执行失败: ${error}` };
  }
};

const getEmailConfig = () => {
  const service = process.env.EMAIL_SERVICE || 'qq';
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  
  if (!user || !pass) return null;
  
  return { service, user, pass };
};

const createTransporter = (config: { service: string; user: string; pass: string }) => {
  const serviceConfigs: Record<string, { host: string; port: number; secure: boolean }> = {
    qq: { host: 'smtp.qq.com', port: 465, secure: true },
    gmail: { host: 'smtp.gmail.com', port: 587, secure: false },
    '163': { host: 'smtp.163.com', port: 465, secure: true }
  };
  
  const serviceConfig = serviceConfigs[config.service as keyof typeof serviceConfigs] || {
    host: 'smtp.qq.com',
    port: 465,
    secure: true
  };
  
  return nodemailer.createTransport({
    host: serviceConfig.host,
    port: serviceConfig.port,
    secure: serviceConfig.secure,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });
};

const sendApprovedEmail = async (
  email: string,
  minecraftId: string,
  qqGroup: string,
  downloadUrl: string,
  emailConfig: { service: string; user: string; pass: string }
) => {
  try {
    const transporter = createTransporter(emailConfig);
    
    const subject = '🎉 恭喜！您的白名单申请已通过 - Cloud tops 云顶之境';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">🎉 恭喜！</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">您的白名单申请已通过审核</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            亲爱的 <strong>${minecraftId}</strong>，
          </p>
          
          <p style="color: #666; font-size: 14px; line-height: 1.8;">
            恭喜您通过了 Cloud tops 云顶之境服务器的白名单审核！欢迎加入我们的大家庭！
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">📋 接下来请按以下步骤操作：</h3>
            
            <ol style="color: #666; line-height: 2;">
              <li>
                <strong>加入QQ群：</strong>
                <span style="background: #e3f2fd; padding: 5px 10px; border-radius: 4px; color: #1976d2; font-weight: bold;">${qqGroup}</span>
              </li>
              <li>
                <strong>下载客户端整合包：</strong>
                <br>
                <a href="${downloadUrl}" style="color: #1976d2; text-decoration: none;">${downloadUrl}</a>
              </li>
              <li>
                <strong>在QQ群内获取服务器IP地址</strong>
              </li>
              <li>
                <strong>使用您的正版账号登录服务器</strong>
              </li>
            </ol>
          </div>
          
          <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
            <p style="margin: 0; color: #e65100; font-size: 14px;">
              <strong>⚠️ 温馨提示：</strong>
            </p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #666; font-size: 13px;">
              <li>请使用正版Minecraft客户端登录</li>
              <li>服务器版本为 1.20.4</li>
              <li>如有任何问题，请在QQ群内联系管理员</li>
            </ul>
          </div>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
            此邮件由系统自动发送，请勿直接回复。<br>
            Cloud tops 云顶之境 - 一个纯净的 Minecraft 原版生存社区
          </p>
        </div>
      </div>
    `;
    
    await transporter.sendMail({
      from: `"Cloud tops 云顶之境" <${emailConfig.user}>`,
      to: email,
      subject,
      html
    });
    
    console.log('审核通过邮件发送成功:', email);
    return true;
  } catch (error) {
    console.error('发送审核通过邮件失败:', error);
    return false;
  }
};

const sendRejectedEmail = async (
  email: string,
  minecraftId: string,
  reason: string,
  emailConfig: { service: string; user: string; pass: string }
) => {
  try {
    const transporter = createTransporter(emailConfig);
    
    const subject = '很遗憾，您的白名单申请未通过 - Cloud tops 云顶之境';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">😢 很遗憾</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">您的白名单申请未通过审核</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            亲爱的 <strong>${minecraftId}</strong>，
          </p>
          
          <p style="color: #666; font-size: 14px; line-height: 1.8;">
            很遗憾地通知您，您的 Cloud tops 云顶之境服务器白名单申请未能通过审核。
          </p>
          
          <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
            <p style="margin: 0; color: #e65100; font-size: 14px;">
              <strong>拒绝原因：</strong>
            </p>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
              ${reason || '未提供具体原因'}
            </p>
          </div>
          
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #1976d2; font-size: 14px;">
              <strong>💡 建议：</strong>
            </p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #666; font-size: 13px;">
              <li>请检查您填写的信息是否准确完整</li>
              <li>您可以修改申请内容后重新提交</li>
              <li>如有疑问，请联系管理员QQ: 958708671</li>
            </ul>
          </div>
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
            此邮件由系统自动发送，请勿直接回复。<br>
            Cloud tops 云顶之境 - 一个纯净的 Minecraft 原版生存社区
          </p>
        </div>
      </div>
    `;
    
    await transporter.sendMail({
      from: `"Cloud tops 云顶之境" <${emailConfig.user}>`,
      to: email,
      subject,
      html
    });
    
    console.log('审核拒绝邮件发送成功:', email);
    return true;
  } catch (error) {
    console.error('发送审核拒绝邮件失败:', error);
    return false;
  }
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const data = await request.json();
    const { status, reviewer, reviewerId, note } = data;
    
    if (!status || !reviewer || !reviewerId) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    let appResult: any[] = [];
    
    // 查询申请信息
    appResult = await withRetry(async () => {
      return await sql`
        SELECT minecraft_id, contact FROM whitelist_applications WHERE id = ${parseInt(id)}
      `;
    });
    
    if (appResult.length === 0) {
      return NextResponse.json(
        { success: false, message: '申请不存在' },
        { status: 404 }
      );
    }
    
    const minecraftId = appResult[0].minecraft_id;
    const contact = appResult[0].contact;
    
    const emailConfig = getEmailConfig();
    let whitelistResult = { success: false, message: '未配置RCON' };
    
    if (status === 'approved') {
      // 更新申请状态
      await withRetry(async () => {
        return await sql`
          UPDATE whitelist_applications 
          SET status = 'approved', 
              reviewed_by = ${reviewer}, 
              reviewed_by_id = ${reviewerId},
              review_note = ${note || ''},
              reviewed_at = NOW()
          WHERE id = ${parseInt(id)}
        `;
      });
      
      // 记录操作日志
      await withRetry(async () => {
        return await sql`
          INSERT INTO operation_logs (admin_id, admin_name, action, target_type, target_id, details)
          VALUES (${reviewerId}, ${reviewer}, 'approve_application', 'whitelist', ${parseInt(id)}, ${'通过白名单申请: ' + minecraftId})
        `;
      });
      
      // 获取服务器设置（QQ群、下载地址、RCON配置）
      let settings: Record<string, string> = {
        qq_group: '',
        client_download_url: '',
        rcon_host: '',
        rcon_port: '25575',
        rcon_password: ''
      };
      
      try {
        const settingsResult = await withRetry(async () => {
          return await sql`
            SELECT setting_key, setting_value FROM server_settings
          `;
        });
        
        settingsResult.forEach((s: any) => {
          settings[s.setting_key] = s.setting_value || '';
        });
      } catch (e) {
        console.log('从数据库获取服务器设置失败，使用默认配置:', e);
      }
      
      console.log('服务器设置:', settings);
      
      const qqGroup = settings.qq_group || '请联系管理员获取';
      const downloadUrl = settings.client_download_url || '请联系管理员获取';
      
      // 尝试添加到服务器白名单
      if (settings.rcon_host && settings.rcon_password) {
        const rconPort = parseInt(settings.rcon_port) || 25575;
        try {
          whitelistResult = await rconAddToWhitelist(
            settings.rcon_host,
            rconPort,
            settings.rcon_password,
            minecraftId
          );
          console.log('添加白名单结果:', whitelistResult);
        } catch (error) {
          console.error('添加白名单失败:', error);
          whitelistResult = { success: false, message: '添加白名单失败' };
        }
      } else {
        console.log('RCON配置不完整，跳过自动添加白名单');
      }
      
      // 发送邮件通知 - 异步执行，不阻塞响应
      if (emailConfig && contact) {
        let email = contact;
        if (/^\d+$/.test(contact)) {
          email = `${contact}@qq.com`;
        }
        
        (async () => {
          try {
            await sendApprovedEmail(email, minecraftId, qqGroup, downloadUrl, emailConfig);
          } catch (error) {
            console.error('发送审核通过邮件失败:', error);
          }
        })();
      }
      
    } else if (status === 'rejected') {
      // 更新申请状态
      await withRetry(async () => {
        return await sql`
          UPDATE whitelist_applications 
          SET status = 'rejected', 
              reviewed_by = ${reviewer}, 
              reviewed_by_id = ${reviewerId},
              review_note = ${note || ''},
              reviewed_at = NOW()
          WHERE id = ${parseInt(id)}
        `;
      });
      
      // 记录操作日志
      await withRetry(async () => {
        return await sql`
          INSERT INTO operation_logs (admin_id, admin_name, action, target_type, target_id, details)
          VALUES (${reviewerId}, ${reviewer}, 'reject_application', 'whitelist', ${parseInt(id)}, ${'拒绝白名单申请: ' + minecraftId})
        `;
      });
      
      // 发送邮件通知 - 异步执行，不阻塞响应
      if (emailConfig && contact) {
        let email = contact;
        if (/^\d+$/.test(contact)) {
          email = `${contact}@qq.com`;
        }
        
        (async () => {
          try {
            await sendRejectedEmail(email, minecraftId, note || '', emailConfig);
          } catch (error) {
            console.error('发送审核拒绝邮件失败:', error);
          }
        })();
      }
      
    } else {
      return NextResponse.json(
        { success: false, message: '无效的状态' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '审核完成',
      whitelistResult: status === 'approved' ? whitelistResult : undefined
    });
  } catch (error) {
    console.error('审核失败:', error);
    return NextResponse.json(
      { success: false, message: '审核失败' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    
    const result = await sql`
      SELECT * FROM whitelist_applications WHERE id = ${parseInt(id)}
    `;
    
    if (result.length === 0) {
      return NextResponse.json(
        { success: false, message: '申请不存在' },
        { status: 404 }
      );
    }
    
    // 获取申请的作品文件
    const workFiles = await sql`
      SELECT photos, video, archive FROM application_files 
      WHERE application_id = ${parseInt(id)}
    `;
    
    if (workFiles.length > 0) {
      result[0].work_files = {
        photos: workFiles[0].photos || [],
        video: workFiles[0].video || null,
        archive: workFiles[0].archive || null
      };
    }
    
    return NextResponse.json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    console.error('获取申请详情失败:', error);
    return NextResponse.json(
      { success: false, message: '获取申请详情失败' },
      { status: 500 }
    );
  }
}
