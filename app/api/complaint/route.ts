import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// 动态导入nodemailer
let transporter: any;

async function getTransporter() {
  if (!transporter) {
    const nodemailer = await import('nodemailer');
    transporter = nodemailer.createTransport({
      host: 'smtp.qq.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

// 初始化数据库连接
const sql = neon(process.env.DATABASE_URL || '');

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    console.log('接收到的数据:', JSON.stringify(data, null, 2));
    console.log('violationTime:', data.violationTime);
    console.log('violationHour:', data.violationHour);
    console.log('violationMinute:', data.violationMinute);
    
    // 验证必填字段
    if (!data.reporterName || !data.reporterQQ || !data.targetPlayer || !data.violationType || !data.description) {
      return NextResponse.json(
        { success: false, message: '请填写所有必填字段' },
        { status: 400 }
      );
    }
    
    // 构建违规时间字符串
    let violationTime = '未填写';
    if (data.violationYear && data.violationMonth && data.violationDay) {
      if (data.violationHour && data.violationMinute) {
        violationTime = `${data.violationYear}年${data.violationMonth}月${data.violationDay}日 ${data.violationHour}:${data.violationMinute}`;
        console.log('使用下拉选择器时间:', violationTime);
      } else {
        violationTime = `${data.violationYear}年${data.violationMonth}月${data.violationDay}日`;
      }
    } else if (data.violationTime) {
      // 格式化 ISO 时间为本地时间
      // 确保将 ISO 字符串视为本地时间处理
      const isoString = data.violationTime;
      let date;
      
      if (isoString.includes('T')) {
        // 如果是 ISO 格式，直接解析时间部分，避免时区问题
        const [datePart, timePart] = isoString.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute] = timePart.split(':').map(Number);
        
        console.log('解析ISO时间:', { year, month, day, hour, minute });
        
        // 直接使用解析出的时间，不通过Date对象转换，避免时区问题
        const formattedYear = year;
        const formattedMonth = String(month).padStart(2, '0');
        const formattedDay = String(day).padStart(2, '0');
        const formattedHour = String(hour).padStart(2, '0');
        const formattedMinute = String(minute).padStart(2, '0');
        violationTime = `${formattedYear}年${formattedMonth}月${formattedDay}日 ${formattedHour}:${formattedMinute}`;
        console.log('格式化后的时间:', violationTime);
      } else {
        // 处理非ISO格式的时间
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        violationTime = `${year}年${month}月${day}日 ${hour}:${minute}`;
      }
    }
    
    console.log('最终保存的时间:', violationTime);

    // 保存到数据库
    try {
      await sql`
        INSERT INTO complaints (
          reporter_name, 
          reporter_qq, 
          target_player, 
          violation_time, 
          violation_type, 
          description, 
          evidence,
          status,
          created_at
        ) VALUES (
          ${data.reporterName},
          ${data.reporterQQ},
          ${data.targetPlayer},
          ${violationTime},
          ${data.violationType},
          ${data.description},
          ${data.evidence || ''},
          'pending',
          NOW()
        )
      `;
      console.log('数据库保存成功');
    } catch (dbError) {
      console.error('数据库保存失败:', dbError);
      // 数据库失败不影响继续处理
    }

    // 尝试发送邮件给所有启用了投诉邮件通知的管理员
    try {
      // 查询所有启用了投诉邮件通知的管理员
      const adminsToNotify = await sql`
        SELECT qq FROM admins 
        WHERE receive_complaint_email = TRUE AND qq IS NOT NULL AND qq != ''
      `;
      
      if (adminsToNotify.length === 0) {
        console.log('没有管理员启用了投诉邮件通知');
      } else {
        console.log(`找到 ${adminsToNotify.length} 位需要通知的管理员`);
      }
      
      const mailer = await getTransporter();
      // 构建邮件内容
      const mailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .field { margin-bottom: 15px; padding: 10px; background: white; border-radius: 6px; }
    .field-label { font-weight: bold; color: #374151; margin-bottom: 5px; }
    .field-value { color: #1f2937; }
    .button { 
      display: inline-block; 
      background: #dc2626; 
      color: white; 
      padding: 12px 24px; 
      text-decoration: none; 
      border-radius: 6px; 
      margin-top: 20px;
    }
    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 新的投诉举报</h1>
      <p>CT Cloud tops 云顶之境</p>
    </div>
    <div class="content">
      <div class="field">
        <div class="field-label">举报人昵称</div>
        <div class="field-value">${data.reporterName}</div>
      </div>
      
      <div class="field">
        <div class="field-label">举报人QQ</div>
        <div class="field-value">${data.reporterQQ}</div>
      </div>
      
      <div class="field">
        <div class="field-label">被举报玩家</div>
        <div class="field-value">${data.targetPlayer}</div>
      </div>
      
      <div class="field">
        <div class="field-label">违规时间</div>
        <div class="field-value">${violationTime}</div>
      </div>
      
      <div class="field">
        <div class="field-label">违规类型</div>
        <div class="field-value">${data.violationType}</div>
      </div>
      
      <div class="field">
        <div class="field-label">违规描述</div>
        <div class="field-value">${data.description || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">证据截图</div>
        <div class="field-value">${data.evidence || '未上传'}</div>
      </div>
      
      <center>
        <a href="${process.env.SITE_URL || 'http://localhost:3000'}/admin/complaints" class="button">查看投诉列表</a>
      </center>
    </div>
    <div class="footer">
      <p>此邮件由系统自动发送，请勿回复</p>
      <p>CT Cloud tops 云顶之境 管理系统</p>
    </div>
  </div>
</body>
</html>
      `;
      
      // 发送邮件给所有启用的管理员
      for (const admin of adminsToNotify) {
        const adminEmail = `${admin.qq}@qq.com`;
        try {
          await mailer.sendMail({
            from: `"云顶之境投诉系统" <${process.env.EMAIL_USER}>`,
            to: adminEmail,
            subject: `🚨 新的投诉举报 - ${data.targetPlayer}`,
            html: mailContent,
          });
          console.log(`投诉邮件已发送给: ${adminEmail}`);
        } catch (emailError) {
          console.error(`发送邮件给 ${adminEmail} 失败:`, emailError);
        }
      }
      
      // 同时发送给默认管理员邮箱（如果设置了）
      if (process.env.ADMIN_EMAIL) {
        try {
          await mailer.sendMail({
            from: `"云顶之境投诉系统" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `🚨 新的投诉举报 - ${data.targetPlayer}`,
            html: mailContent,
          });
          console.log(`投诉邮件已发送给默认管理员: ${process.env.ADMIN_EMAIL}`);
        } catch (emailError) {
          console.error(`发送邮件给默认管理员失败:`, emailError);
        }
      }
      
      console.log('投诉邮件发送完成');
    } catch (mailError) {
      console.error('邮件发送失败:', mailError);
      // 邮件失败不影响整个请求的成功
    }

    return NextResponse.json({ 
      success: true, 
      message: '投诉提交成功！我们会尽快处理。' 
    });

  } catch (error) {
    console.error('投诉提交失败:', error);
    return NextResponse.json(
      { success: false, message: '提交失败，请稍后重试或联系管理员' },
      { status: 500 }
    );
  }
}
