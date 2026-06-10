/**
 * 邮件发送工具函数
 * 通过 /api/email POST 接口发送各类邮件通知
 */

type ApplicationData = {
  minecraft_id: string;
  age: number;
  contact: string;
  gender: string;
  occupation: string;
  play_time: number;
  how_found: string;
  play_time_slot: string;
  skill_type: string;
  banned_history: string;
  banned_servers?: string;
  quiz_category?: string;
  quiz_score?: number;
  quiz_total?: number;
};

function getBaseUrl() {
  return process.env.SITE_URL || 'http://localhost:3000';
}

async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch(`${getBaseUrl()}/api/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html })
  });
  return response.json();
}

export async function sendApplicationApprovedEmail(
  email: string,
  applicationData: ApplicationData,
  qqGroup: string = '666866913',
  downloadUrl: string
) {
  const subject = '🎉 恭喜！您的白名单申请已通过 - Cloud tops 云顶之境';
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 35px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 恭喜通过！</h1>
        <p style="color: rgba(255,255,255,0.95); margin-top: 12px; font-size: 15px;">欢迎加入 Cloud tops 云顶之境</p>
      </div>
      <div style="background: white; padding: 35px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <p style="color: #374151; font-size: 16px; line-height: 1.7; margin-bottom: 20px;">
          亲爱的 <strong style="color: #059669;">${applicationData.minecraft_id}</strong>，
        </p>
        <p style="color: #4b5563; font-size: 14px; line-height: 1.8; margin-bottom: 25px;">
          恭喜您通过了 Cloud tops 云顶之境服务器的白名单审核！欢迎加入我们的大家庭！
        </p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 15px;">📋 接下来请按以下步骤操作：</h3>
          <div style="background: white; padding: 12px 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 10px;">
            <span style="color: #374151; font-size: 13px;">1. 加入QQ群：${qqGroup}</span>
          </div>
          <div style="background: white; padding: 12px 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 10px;">
            <strong style="color: #374151; font-size: 13px;">2. 下载客户端整合包</strong><br>
            <a href="${downloadUrl}" style="color: #2563eb; text-decoration: none; font-size: 12px; word-break: break-all;">${downloadUrl}</a>
          </div>
          <div style="background: white; padding: 12px 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 10px;">
            <span style="color: #374151; font-size: 13px;">3. 在QQ群内获取服务器IP地址</span>
          </div>
          <div style="background: white; padding: 12px 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <span style="color: #374151; font-size: 13px;">4. 使用您的正版账号登录服务器</span>
          </div>
        </div>
        <div style="background: #fef3c7; padding: 18px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="color: #92400e; margin: 0 0 12px 0; font-size: 14px;">📜 服务器规定</h3>
          <ul style="margin: 0; padding-left: 18px; color: #78350f; font-size: 12px; line-height: 1.9;">
            <li><strong>禁止作弊：</strong>使用外挂、作弊客户端、透视等行为将被永久封禁</li>
            <li><strong>禁止恶意破坏：</strong>禁止恶意破坏他人建筑、偷窃、杀人等恶劣行为</li>
            <li><strong>尊重他人：</strong>禁止辱骂、骚扰、歧视其他玩家，保持友善交流</li>
            <li><strong>保护资源：</strong>禁止恶意破坏地形、过度开采公共资源</li>
            <li><strong>遵守秩序：</strong>服从管理员管理，不得挑衅或对抗管理人员</li>
            <li><strong>文明游戏：</strong>禁止发布广告、色情、政治等违规内容</li>
          </ul>
        </div>
        <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 30px; line-height: 1.6;">
          此邮件由系统自动发送，请勿直接回复<br>
          Cloud tops 云顶之境 - 一个纯净的 Minecraft 原版生存社区
        </p>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html);
}

export async function sendApplicationRejectedEmail(
  email: string,
  applicationData: ApplicationData,
  reason: string,
  rejectedBy: { adminName: string; adminQQ: string }
) {
  const subject = '❌ 白名单申请未通过审核 - Cloud tops 云顶之境';
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
      <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 35px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">❌ 申请未通过</h1>
        <p style="color: rgba(255,255,255,0.95); margin-top: 12px; font-size: 15px;">感谢您的申请，但未能通过审核</p>
      </div>
      <div style="background: white; padding: 35px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <p style="color: #374151; font-size: 16px; line-height: 1.7;">亲爱的 <strong style="color: #dc2626;">${applicationData.minecraft_id}</strong>，</p>
        <p style="color: #4b5563; font-size: 14px; line-height: 1.8;">很遗憾地通知您，您的白名单申请<strong>未能通过审核</strong>。</p>
        <div style="background: #fef2f2; padding: 18px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h3 style="color: #dc2626; margin: 0 0 12px 0; font-size: 14px;">🚫 审核信息</h3>
          <p style="color: #666; margin: 8px 0; font-size: 14px;"><strong>审核时间：</strong>${new Date().toLocaleString('zh-CN')}</p>
          <p style="color: #666; margin: 8px 0; font-size: 14px;"><strong>审核人：</strong>${rejectedBy.adminName}</p>
          <p style="color: #666; margin: 8px 0; font-size: 14px;"><strong>审核人QQ：</strong>${rejectedBy.adminQQ}</p>
        </div>
        <div style="background: #fff7ed; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #f97316;">
          <h3 style="color: #c2410c; margin: 0 0 12px 0; font-size: 14px;">📝 拒绝原因</h3>
          <p style="margin: 10px 0 0 0; color: #7c2d12; font-size: 14px; line-height: 1.6; background: #ffedd5; padding: 12px; border-radius: 6px;">
            ${reason || '未提供具体原因'}
          </p>
        </div>
        <div style="background: #eff6ff; padding: 18px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <p style="margin: 0; color: #1e40af; font-size: 14px;"><strong>📞 申诉渠道：</strong></p>
          <ul style="margin: 10px 0 0 0; padding-left: 18px; color: #4b5563; font-size: 13px; line-height: 1.8;">
            <li>如对审核结果有疑问，可直接联系审核人 <strong>QQ: ${rejectedBy.adminQQ}</strong></li>
            <li>如与审核人沟通无果，请联系服主 <strong>QQ: 958708671</strong> 进行申诉</li>
          </ul>
        </div>
        <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 30px; line-height: 1.6;">
          此邮件由系统自动发送，请勿直接回复<br>
          Cloud tops 云顶之境 - 一个纯净的 Minecraft 原版生存社区
        </p>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html);
}

export async function sendNewApplicationAlertEmail(
  adminEmail: string,
  applicationData: ApplicationData
) {
  const subject = '🆕 新的白名单申请 - Cloud tops 云顶之境';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">🆕 新的白名单申请</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">Cloud tops 云顶之境</p>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p style="color: #333; font-size: 16px; line-height: 1.6;">管理员您好，收到新的白名单申请，请及时审核。</p>
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <h3 style="color: #1e40af; margin-top: 0;">📋 申请人信息</h3>
          <p style="color: #666; margin: 5px 0;"><strong>游戏ID：</strong>${applicationData.minecraft_id}</p>
          <p style="color: #666; margin: 5px 0;"><strong>QQ号：</strong>${applicationData.contact}</p>
          <p style="color: #666; margin: 5px 0;"><strong>年龄：</strong>${applicationData.age}岁</p>
          <p style="color: #666; margin: 5px 0;"><strong>性别：</strong>${applicationData.gender}</p>
          <p style="color: #666; margin: 5px 0;"><strong>游戏时长：</strong>${applicationData.play_time}个月</p>
          <p style="color: #666; margin: 5px 0;"><strong>擅长类型：</strong>${applicationData.skill_type || '未填写'}</p>
          <p style="color: #666; margin: 5px 0;"><strong>了解渠道：</strong>${applicationData.how_found}</p>
          <p style="color: #666; margin: 5px 0;"><strong>被ban历史：</strong>${applicationData.banned_history}${applicationData.banned_servers ? ' - ' + applicationData.banned_servers : ''}</p>
          ${applicationData.quiz_category ? `<p style="color: #666; margin: 5px 0;"><strong>答题分类：</strong>${applicationData.quiz_category}</p>` : ''}
          ${applicationData.quiz_score !== undefined ? `<p style="color: #666; margin: 5px 0;"><strong>答题成绩：</strong>${applicationData.quiz_score}/${applicationData.quiz_total}</p>` : ''}
          <p style="color: #666; margin: 5px 0;"><strong>申请时间：</strong>${new Date().toLocaleString('zh-CN')}</p>
        </div>
        <center>
          <a href="${getBaseUrl()}/admin/applications" style="display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-size: 16px; font-weight: bold;">前往审核</a>
        </center>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          此邮件由系统自动发送，请勿直接回复。<br>
          Cloud tops 云顶之境 - 一个纯净的 Minecraft 原版生存社区
        </p>
      </div>
    </div>
  `;
  return sendEmail(adminEmail, subject, html);
}

export async function sendApplicationSubmittedEmail(
  email: string,
  applicationData: ApplicationData
) {
  const subject = '📝 白名单申请已提交 - Cloud tops 云顶之境';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">📝 申请已提交</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">我们已收到您的白名单申请</p>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p style="color: #333; font-size: 16px; line-height: 1.6;">亲爱的 <strong>${applicationData.minecraft_id}</strong>，</p>
        <p style="color: #666; font-size: 14px; line-height: 1.8;">您的白名单申请已成功提交！</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">📋 申请信息</h3>
          <p style="color: #666; margin: 5px 0;"><strong>游戏ID：</strong>${applicationData.minecraft_id}</p>
          <p style="color: #666; margin: 5px 0;"><strong>QQ号：</strong>${applicationData.contact}</p>
          <p style="color: #666; margin: 5px 0;"><strong>年龄：</strong>${applicationData.age}岁</p>
          <p style="color: #666; margin: 5px 0;"><strong>游戏时长：</strong>${applicationData.play_time}个月</p>
          <p style="color: #666; margin: 5px 0;"><strong>申请状态：</strong>待审核</p>
        </div>
        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1976d2;">
          <p style="margin: 0; color: #1976d2; font-size: 14px;"><strong>⏰ 审核时间：</strong></p>
          <p style="margin: 10px 0 0 0; color: #666; font-size: 13px;">管理员将在24小时内审核您的申请，请耐心等待。</p>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          此邮件由系统自动发送，请勿直接回复。<br>
          Cloud tops 云顶之境 - 一个纯净的 Minecraft 原版生存社区
        </p>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html);
}

export async function sendApplicationRevokedEmail(
  email: string,
  applicationData: ApplicationData,
  reason: string,
  revokedBy: { adminName: string; adminQQ: string }
) {
  const subject = '⚠️ 白名单申请已被撤销 - Cloud tops 云顶之境';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">⚠️ 申请已撤销</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">您的白名单申请已被管理员撤销</p>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p style="color: #333; font-size: 16px;">亲爱的 <strong>${applicationData.minecraft_id}</strong>，</p>
        <p style="color: #666; font-size: 14px;">很遗憾，您的申请已被<strong>撤销</strong>。</p>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h3 style="color: #dc2626; margin-top: 0;">🚫 撤销信息</h3>
          <p style="color: #666; margin: 8px 0; font-size: 14px;"><strong>撤销时间：</strong>${new Date().toLocaleString('zh-CN')}</p>
          <p style="color: #666; margin: 8px 0; font-size: 14px;"><strong>撤销人：</strong>${revokedBy.adminName}（QQ: ${revokedBy.adminQQ}）</p>
        </div>
        <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
          <h3 style="color: #c2410c; margin-top: 0;">📝 撤销原因</h3>
          <p style="margin: 10px 0 0 0; color: #7c2d12; font-size: 14px; line-height: 1.6; background: #ffedd5; padding: 12px; border-radius: 6px;">
            ${reason || '未提供具体原因'}
          </p>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          此邮件由系统自动发送，请勿直接回复。<br>
          Cloud tops 云顶之境 - 一个纯净的 Minecraft 原版生存社区
        </p>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html);
}

export async function sendWhitelistRevokedEmail(
  email: string,
  minecraftId: string,
  reason: string,
  canReapply: boolean = true
) {
  const subject = '🚫 白名单已被撤销 - Cloud tops 云顶之境';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">🚫 白名单已撤销</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p style="color: #333; font-size: 16px;">亲爱的 <strong>${minecraftId}</strong>，您的白名单已被撤销。</p>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p style="margin: 0; color: #dc2626; font-size: 14px;"><strong>撤销原因：</strong></p>
          <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">${reason || '违反服务器规定'}</p>
        </div>
        ${canReapply ? '<p style="color: #666; font-size: 14px;">您可以在整改后重新提交白名单申请。</p>' : '<p style="color: #dc2626; font-size: 14px;">由于违规情节严重，您被禁止重新申请白名单。</p>'}
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          此邮件由系统自动发送，请勿直接回复。<br>
          Cloud tops 云顶之境 - 一个纯净的 Minecraft 原版生存社区
        </p>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html);
}

export async function sendComplaintReceivedEmail(
  email: string,
  reporterName: string,
  targetPlayer: string,
  complaintId: string
) {
  const subject = '📨 投诉已受理 - Cloud tops 云顶之境';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">📨 投诉已受理</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p style="color: #333; font-size: 16px;">亲爱的 <strong>${reporterName}</strong>，您的投诉已收到，正在处理中。</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #666; margin: 5px 0;"><strong>投诉编号：</strong>#${complaintId}</p>
          <p style="color: #666; margin: 5px 0;"><strong>被举报玩家：</strong>${targetPlayer}</p>
          <p style="color: #666; margin: 5px 0;"><strong>提交时间：</strong>${new Date().toLocaleString('zh-CN')}</p>
          <p style="color: #666; margin: 5px 0;"><strong>处理状态：</strong>受理中</p>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          此邮件由系统自动发送，请勿直接回复。<br>
          Cloud tops 云顶之境
        </p>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html);
}

export async function sendComplaintResolvedEmail(
  email: string,
  reporterName: string,
  targetPlayer: string,
  complaintId: string,
  result: 'resolved' | 'rejected',
  action: string,
  adminNote: string
) {
  const isResolved = result === 'resolved';
  const subject = isResolved ? '✅ 投诉已处理 - Cloud tops 云顶之境' : '❌ 投诉未通过 - Cloud tops 云顶之境';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: linear-gradient(135deg, ${isResolved ? '#10b981' : '#6b7280'} 0%, ${isResolved ? '#059669' : '#4b5563'} 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">${isResolved ? '✅ 投诉已处理' : '❌ 投诉未通过'}</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p style="color: #333; font-size: 16px;">亲爱的 <strong>${reporterName}</strong>，您关于玩家 <strong>${targetPlayer}</strong> 的投诉已有处理结果。</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #666; margin: 5px 0;"><strong>投诉编号：</strong>#${complaintId}</p>
          <p style="color: #666; margin: 5px 0;"><strong>处理结果：</strong>${isResolved ? '投诉成立' : '投诉不成立'}</p>
          <p style="color: #666; margin: 5px 0;"><strong>处理措施：</strong>${action || (isResolved ? '已对被举报玩家进行相应处理' : '经核实，举报内容不属实')}</p>
          ${adminNote ? `<p style="color: #666; margin: 5px 0;"><strong>管理员备注：</strong>${adminNote}</p>` : ''}
        </div>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          此邮件由系统自动发送，请勿直接回复。<br>
          Cloud tops 云顶之境
        </p>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html);
}

export async function sendAppealSubmittedEmail(
  email: string,
  minecraftId: string,
  appealId: string,
  appealType: 'whitelist_revoke' | 'ban' | 'other'
) {
  const typeText = { whitelist_revoke: '白名单撤销', ban: '封禁处罚', other: '其他问题' }[appealType];
  const subject = '📝 申诉已提交 - Cloud tops 云顶之境';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">📝 申诉已提交</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p style="color: #333; font-size: 16px;">亲爱的 <strong>${minecraftId}</strong>，您的申诉请求已成功提交。</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #666; margin: 5px 0;"><strong>申诉编号：</strong>#${appealId}</p>
          <p style="color: #666; margin: 5px 0;"><strong>申诉类型：</strong>${typeText}</p>
          <p style="color: #666; margin: 5px 0;"><strong>提交时间：</strong>${new Date().toLocaleString('zh-CN')}</p>
          <p style="color: #666; margin: 5px 0;"><strong>处理状态：</strong>待审核</p>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          此邮件由系统自动发送，请勿直接回复。<br>
          Cloud tops 云顶之境
        </p>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html);
}

export async function sendAppealResolvedEmail(
  email: string,
  minecraftId: string,
  appealId: string,
  result: 'approved' | 'rejected',
  decision: string,
  adminNote: string
) {
  const isApproved = result === 'approved';
  const subject = isApproved ? '✅ 申诉已通过 - Cloud tops 云顶之境' : '❌ 申诉未通过 - Cloud tops 云顶之境';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: linear-gradient(135deg, ${isApproved ? '#10b981' : '#dc2626'} 0%, ${isApproved ? '#059669' : '#b91c1c'} 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">${isApproved ? '✅ 申诉已通过' : '❌ 申诉未通过'}</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p style="color: #333; font-size: 16px;">亲爱的 <strong>${minecraftId}</strong>，您的申诉请求已有处理结果。</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #666; margin: 5px 0;"><strong>申诉编号：</strong>#${appealId}</p>
          <p style="color: #666; margin: 5px 0;"><strong>处理结果：</strong>${isApproved ? '申诉通过' : '申诉未通过'}</p>
          <p style="color: #666; margin: 5px 0;"><strong>处理决定：</strong>${decision || (isApproved ? '已恢复您的白名单/解除处罚' : '维持原处罚决定')}</p>
          ${adminNote ? `<p style="color: #666; margin: 5px 0;"><strong>管理员备注：</strong>${adminNote}</p>` : ''}
        </div>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          此邮件由系统自动发送，请勿直接回复。<br>
          Cloud tops 云顶之境
        </p>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html);
}

export async function sendNewAppealNotificationEmail(
  adminEmail: string,
  minecraftId: string,
  appealType: string,
  appealId: string
) {
  const subject = `🆕 新的申诉请求 - ${minecraftId}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">🆕 新的申诉请求</h1>
      </div>
      <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb;">
        <p style="color: #374151;"><strong>申诉编号：</strong>#${appealId}</p>
        <p style="color: #374151;"><strong>申诉人：</strong>${minecraftId}</p>
        <p style="color: #374151;"><strong>申诉类型：</strong>${appealType}</p>
        <p style="color: #374151;"><strong>提交时间：</strong>${new Date().toLocaleString('zh-CN')}</p>
        <center>
          <a href="${getBaseUrl()}/admin/appeals" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">查看申诉列表</a>
        </center>
      </div>
    </div>
  `;
  return sendEmail(adminEmail, subject, html);
}

export async function sendAdminAccountCreatedEmail(
  email: string,
  username: string,
  tempPassword: string,
  createdBy: string
) {
  const subject = '🔐 管理员账号已创建 - Cloud tops 云顶之境';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">🔐 管理员账号已创建</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p style="color: #333; font-size: 16px;">亲爱的 <strong>${username}</strong>，您的管理员账号已创建！</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #666; margin: 5px 0;"><strong>用户名：</strong>${username}</p>
          <p style="color: #666; margin: 5px 0;"><strong>临时密码：</strong><span style="background: #e3f2fd; padding: 2px 8px; border-radius: 4px; font-family: monospace;">${tempPassword}</span></p>
          <p style="color: #666; margin: 5px 0;"><strong>创建人：</strong>${createdBy}</p>
          <p style="color: #666; margin: 5px 0;"><strong>创建时间：</strong>${new Date().toLocaleString('zh-CN')}</p>
        </div>
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-size: 14px;"><strong>⚠️ 安全提醒：</strong>请尽快登录并修改您的密码！</p>
        </div>
        <center>
          <a href="${getBaseUrl()}/admin" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">登录管理后台</a>
        </center>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          此邮件由系统自动发送，请勿直接回复。<br>
          Cloud tops 云顶之境
        </p>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html);
}

export async function sendPasswordResetEmail(
  email: string,
  username: string,
  resetToken: string,
  expiresIn: string = '24小时'
) {
  const resetUrl = `${getBaseUrl()}/reset-password?token=${resetToken}`;
  const subject = '🔑 密码重置请求 - Cloud tops 云顶之境';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">🔑 密码重置</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p style="color: #333; font-size: 16px;">亲爱的 <strong>${username}</strong>，我们收到了您的密码重置请求。</p>
        <center>
          <a href="${resetUrl}" style="display: inline-block; background: #f59e0b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-size: 16px; font-weight: bold;">重置密码</a>
        </center>
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">此链接将在 ${expiresIn} 后失效，请尽快完成密码重置。</p>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          此邮件由系统自动发送，请勿直接回复。<br>
          Cloud tops 云顶之境
        </p>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html);
}

export async function sendAdminPermissionChangedEmail(
  email: string,
  username: string,
  changes: string,
  changedBy: string
) {
  const subject = '🔧 管理员权限已变更 - Cloud tops 云顶之境';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">🔧 权限已变更</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p style="color: #333; font-size: 16px;">亲爱的 <strong>${username}</strong>，您的管理员权限已更新。</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #666; margin: 5px 0;"><strong>变更内容：</strong>${changes}</p>
          <p style="color: #666; margin: 5px 0;"><strong>操作人：</strong>${changedBy}</p>
          <p style="color: #666; margin: 5px 0;"><strong>变更时间：</strong>${new Date().toLocaleString('zh-CN')}</p>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          此邮件由系统自动发送，请勿直接回复。<br>
          Cloud tops 云顶之境
        </p>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html);
}

export async function sendMaintenanceNoticeEmail(
  email: string,
  maintenanceTime: string,
  duration: string,
  reason: string,
  affectedServices: string[]
) {
  const subject = '🔧 服务器维护预告 - Cloud tops 云顶之境';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">🔧 维护预告</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p style="color: #333; font-size: 16px;">亲爱的玩家，服务器即将进行维护升级。</p>
        <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
          <p style="color: #666; margin: 5px 0;"><strong>维护时间：</strong>${maintenanceTime}</p>
          <p style="color: #666; margin: 5px 0;"><strong>预计时长：</strong>${duration}</p>
          <p style="color: #666; margin: 5px 0;"><strong>维护原因：</strong>${reason}</p>
          <p style="color: #666; margin: 5px 0;"><strong>影响范围：</strong>${affectedServices.join('、')}</p>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          此邮件由系统自动发送，请勿直接回复。<br>
          Cloud tops 云顶之境
        </p>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html);
}

export async function sendAnnouncementEmail(
  email: string,
  title: string,
  content: string,
  author: string,
  link?: string
) {
  const subject = `📢 ${title} - Cloud tops 云顶之境`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">📢 重要公告</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #ec4899; padding-bottom: 10px;">${title}</h2>
        <div style="color: #666; font-size: 14px; line-height: 1.8; margin: 20px 0;">${content}</div>
        <div style="background: #fdf2f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #666; font-size: 13px;">
            <strong>发布人：</strong>${author}<br>
            <strong>发布时间：</strong>${new Date().toLocaleString('zh-CN')}
          </p>
        </div>
        ${link ? `<center><a href="${link}" style="display: inline-block; background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">查看详情</a></center>` : ''}
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          此邮件由系统自动发送，请勿直接回复。<br>
          Cloud tops 云顶之境
        </p>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html);
}

export async function sendSystemUpdateEmail(
  email: string,
  version: string,
  updateContent: string[],
  updateTime: string
) {
  const subject = `🚀 系统更新 v${version} - Cloud tops 云顶之境`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">🚀 系统更新 v${version}</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p style="color: #333; font-size: 16px;">亲爱的玩家，我们的系统已完成更新，为您带来更好的体验！</p>
        <div style="background: #f0fdfa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #14b8a6;">
          <h3 style="color: #333; margin-top: 0;">✨ 更新内容</h3>
          <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
            ${updateContent.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
          更新时间：${updateTime}<br>
          此邮件由系统自动发送，请勿直接回复。<br>
          Cloud tops 云顶之境
        </p>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html);
}
