import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { requireAuth } from '@/lib/auth';

interface EmailConfig {
  service: 'qq' | 'gmail' | '163' | 'custom';
  host?: string;
  port?: number;
  secure?: boolean;
  user: string;
  pass: string;
}

const getEmailConfig = (): EmailConfig | null => {
  const service = process.env.EMAIL_SERVICE as EmailConfig['service'];
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  
  if (!user || !pass) return null;
  
  return {
    service: service || 'qq',
    user,
    pass
  };
};

const createTransporter = (config: EmailConfig) => {
  const serviceConfigs: Record<string, { host: string; port: number; secure: boolean }> = {
    qq: { host: 'smtp.qq.com', port: 465, secure: true },
    gmail: { host: 'smtp.gmail.com', port: 587, secure: false },
    '163': { host: 'smtp.163.com', port: 465, secure: true }
  };
  
  const serviceConfig = serviceConfigs[config.service] || {
    host: config.host || 'smtp.qq.com',
    port: config.port || 465,
    secure: config.secure !== false
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

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const data = await request.json();
    const { to, subject, html, text } = data;
    
    if (!to || !subject) {
      return NextResponse.json(
        { success: false, message: '缺少收件人或邮件主题' },
        { status: 400 }
      );
    }
    
    const config = getEmailConfig();
    if (!config) {
      console.log('邮件配置未设置，跳过发送邮件');
      return NextResponse.json({
        success: true,
        message: '邮件配置未设置，已跳过发送',
        skipped: true
      });
    }
    
    const transporter = createTransporter(config);
    
    const mailOptions = {
      from: `"Cloud tops 云顶之境" <${config.user}>`,
      to,
      subject,
      text: text || '',
      html: html || text || ''
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('邮件发送成功:', info.messageId);
    
    return NextResponse.json({
      success: true,
      message: '邮件发送成功',
      messageId: info.messageId
    });
    
  } catch (error) {
    console.error('邮件发送失败:', error);
    return NextResponse.json(
      { success: false, message: '邮件发送失败', error: String(error) },
      { status: 500 }
    );
  }
}
