import { NextRequest, NextResponse } from 'next/server';
import sql, { withRetry } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

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

export async function GET(request: NextRequest) {
  const authResult = requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { session } = authResult;
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const adminId = searchParams.get('adminId');
    
    const applications = await withRetry(async () => {
      if (status === 'pending') {
        return await sql`
          SELECT * FROM whitelist_applications 
          WHERE status = 'pending'
          ORDER BY created_at DESC
        `;
      } else if (adminId) {
        return await sql`
          SELECT * FROM whitelist_applications 
          WHERE reviewed_by_id = ${parseInt(adminId)}
          ORDER BY reviewed_at DESC
          LIMIT 50
        `;
      } else {
        return await sql`
          SELECT * FROM whitelist_applications 
          ORDER BY created_at DESC
          LIMIT 100
        `;
      }
    });
    
    return NextResponse.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('获取申请列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取申请列表失败，请稍后重试' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 检查是否是multipart/form-data格式（文件上传）
    const contentType = request.headers.get('content-type');
    let data: any;
    
    if (contentType && contentType.includes('multipart/form-data')) {
      // 处理文件上传
      const formData = await request.formData();
      data = {
        minecraft_id: formData.get('minecraft_id'),
        age: formData.get('age'),
        gender: formData.get('gender'),
        contact: formData.get('contact'),
        education: formData.get('education'),
        work_status: formData.get('work_status'),
        how_found: formData.get('how_found'),
        play_time: formData.get('play_time'),
        favorite_mode: formData.get('favorite_mode'),
        quiz_score: formData.get('quiz_score'),
        quiz_total: formData.get('quiz_total'),
        quiz_category: formData.get('quiz_category'),
        play_style: formData.get('play_style'),
        reason: '', // 前端未传递
        server_experience: '', // 前端未传递
        country: '', // 前端未传递
        discord_id: '', // 前端未传递
        griefing_history: '', // 前端未传递
        additional_info: '', // 前端未传递
      };
      
      // 处理文件上传
      const photos = [];
      let i = 0;
      while (formData.get(`photos[${i}]`)) {
        photos.push(formData.get(`photos[${i}]`));
        i++;
      }
      
      const video = formData.get('video');
      const archive = formData.get('archive');
      
      console.log('收到申请数据（FormData）:', data);
      console.log('收到文件:', { photos: photos.length, video: !!video, archive: !!archive });
    } else {
      // 处理普通JSON数据
      data = await request.json();
      console.log('收到申请数据（JSON）:', data);
    }
    
    const { minecraft_id, age, contact, reason, quiz_category, quiz_score, quiz_total, 
            play_time, favorite_mode, server_experience, gender, country, 
            education, work_status, how_found, discord_id, play_style, griefing_history, additional_info } = data;
    
    if (!minecraft_id || !contact) {
      return NextResponse.json(
        { success: false, message: '游戏ID和联系方式为必填项' },
        { status: 400 }
      );
    }

    // M4：校验minecraft_id格式（3-16位字母数字下划线）
    if (!/^[a-zA-Z0-9_]{3,16}$/.test(minecraft_id)) {
      return NextResponse.json(
        { success: false, message: '游戏ID格式不正确（3-16位字母、数字或下划线）' },
        { status: 400 }
      );
    }

    // 校验联系方式格式（支持QQ号或手机号）
    const qqRegex = /^[1-9]\d{4,10}$/;
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (contact && !qqRegex.test(contact) && !phoneRegex.test(contact)) {
      return NextResponse.json(
        { success: false, message: '联系方式格式不正确，请输入有效的QQ号或手机号' },
        { status: 400 }
      );
    }

    // 处理年龄值，确保不是NaN
    let processedAge = null;
    if (age !== undefined && age !== null && age !== '') {
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        return NextResponse.json(
          { success: false, message: '年龄填写不合法' },
          { status: 400 }
        );
      }
      processedAge = ageNum;
    }
    
    // 确保所有字符串值都是有效的UTF-8字符串
    const safeValues = {
      minecraft_id: String(minecraft_id || ''),
      contact: String(contact || ''),
      reason: String(reason || ''),
      quiz_category: String(quiz_category || ''),
      favorite_mode: String(favorite_mode || ''),
      server_experience: String(server_experience || ''),
      gender: String(gender || ''),
      country: String(country || ''),
      education: String(education || ''),
      work_status: String(work_status || ''),
      how_found: String(how_found || ''),
      discord_id: String(discord_id || ''),
      play_style: String(play_style || ''),
      griefing_history: String(griefing_history || ''),
      additional_info: String(additional_info || '')
    };
    
    console.log('检查是否存在待审核申请...');
    try {
      const existing = await withRetry(async () => {
        return await sql`
          SELECT id FROM whitelist_applications 
          WHERE minecraft_id = ${safeValues.minecraft_id} AND status = 'pending'
        `;
      });
      
      console.log('待审核申请检查结果:', existing);
      
      if (existing.length > 0) {
        return NextResponse.json(
          { success: false, message: '您已有待审核的申请，请等待管理员处理' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('检查待审核申请失败:', error);
      // 数据库查询失败不应该阻止申请提交
    }
    
    console.log('准备插入申请数据...');
    // 使用重试机制执行插入操作
    try {
      await withRetry(async () => {
        try {
          // 由于play_time在数据库中可能是数字类型，而前端传递的是字符串
          // 我们需要将其转换为适合数据库的值
          let playTimeValue = 0;
          if (play_time) {
            // 根据前端传递的字符串值映射为数字
            switch (play_time) {
              case '新手（1年以内）':
                playTimeValue = 0;
                break;
              case '熟练（1-3年）':
                playTimeValue = 1;
                break;
              case '老手（3-5年）':
                playTimeValue = 2;
                break;
              case '专家（5年以上）':
                playTimeValue = 3;
                break;
              default:
                playTimeValue = 0;
            }
          }
          
          console.log('插入数据前的安全值:', safeValues);
          console.log('处理后的值:', {
            age: processedAge,
            playTimeValue: playTimeValue,
            quiz_score: quiz_score || 0,
            quiz_total: quiz_total || 0
          });
          
          await sql`
            INSERT INTO whitelist_applications (
              minecraft_id, age, contact, reason, 
              quiz_category, quiz_score, quiz_total, 
              play_time, favorite_mode, server_experience, 
              gender, country, 
              education, work_status, how_found, discord_id, 
              play_style, griefing_history, 
              additional_info, 
              status
            ) VALUES (
              ${safeValues.minecraft_id}, ${processedAge || null}, ${safeValues.contact}, ${safeValues.reason}, 
              ${safeValues.quiz_category}, ${parseInt(quiz_score as string) || 0}, ${parseInt(quiz_total as string) || 0}, 
              ${playTimeValue}, ${safeValues.favorite_mode}, ${safeValues.server_experience}, 
              ${safeValues.gender}, ${safeValues.country}, 
              ${safeValues.education}, ${safeValues.work_status}, ${safeValues.how_found}, ${safeValues.discord_id}, 
              ${safeValues.play_style}, ${safeValues.griefing_history}, 
              ${safeValues.additional_info}, 
              'pending'
            )
          `;
          console.log('申请数据插入成功');
        } catch (dbError) {
          console.error('数据库插入错误:', dbError);
          throw dbError;
        }
      });
    } catch (error) {
      console.error('插入申请数据失败:', error);
      return NextResponse.json(
        { success: false, message: '提交申请失败' },
        { status: 500 }
      );
    }
    
    // 发送邮件通知给启用了申请邮件通知的管理员
    try {
      // 查询所有启用了申请邮件通知的管理员
      const adminsToNotify = await withRetry(async () => {
        return await sql`
          SELECT qq FROM admins 
          WHERE receive_application_email = TRUE AND qq IS NOT NULL AND qq != ''
        `;
      });
      
      if (adminsToNotify.length > 0) {
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
    .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .field { margin-bottom: 15px; padding: 10px; background: white; border-radius: 6px; }
    .field-label { font-weight: bold; color: #374151; margin-bottom: 5px; }
    .field-value { color: #1f2937; }
    .button { 
      display: inline-block; 
      background: #10b981; 
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
      <h1>📝 新的白名单申请</h1>
      <p>CT Cloud tops 云顶之境</p>
    </div>
    <div class="content">
      <div class="field">
        <div class="field-label">游戏ID</div>
        <div class="field-value">${safeValues.minecraft_id}</div>
      </div>
      
      <div class="field">
        <div class="field-label">年龄</div>
        <div class="field-value">${age || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">联系方式</div>
        <div class="field-value">${safeValues.contact}</div>
      </div>
      
      <div class="field">
        <div class="field-label">申请理由</div>
        <div class="field-value">${safeValues.reason || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">游戏经验</div>
        <div class="field-value">${play_time || 0} 个月 | ${safeValues.favorite_mode || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">服务器经验</div>
        <div class="field-value">${safeValues.server_experience || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">个人信息</div>
        <div class="field-value">${safeValues.gender || '未填写'} | ${safeValues.country || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">学历</div>
        <div class="field-value">${safeValues.education || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">工作状态</div>
        <div class="field-value">${safeValues.work_status || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">社区相关</div>
        <div class="field-value">${safeValues.how_found || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">Discord ID</div>
        <div class="field-value">${safeValues.discord_id || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">游戏风格</div>
        <div class="field-value">${safeValues.play_style || '未填写'} | ${safeValues.griefing_history || '未填写'}</div>
      </div>
      
      <div class="field">
        <div class="field-label">其他信息</div>
        <div class="field-value">${safeValues.additional_info || '未填写'}</div>
      </div>
      
      <center>
        <a href="${process.env.SITE_URL || 'http://localhost:3000'}/admin/applications" class="button">查看申请列表</a>
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
              from: `"云顶之境白名单系统" <${process.env.EMAIL_USER}>`,
              to: adminEmail,
              subject: `📝 新的白名单申请 - ${safeValues.minecraft_id}`,
              html: mailContent,
            });
            console.log(`申请邮件已发送给: ${adminEmail}`);
          } catch (emailError) {
            console.error(`发送邮件给 ${adminEmail} 失败:`, emailError);
          }
        }
        
        // 同时发送给默认管理员邮箱（如果设置了）
        if (process.env.ADMIN_EMAIL) {
          try {
            await mailer.sendMail({
              from: `"云顶之境白名单系统" <${process.env.EMAIL_USER}>`,
              to: process.env.ADMIN_EMAIL,
              subject: `📝 新的白名单申请 - ${safeValues.minecraft_id}`,
              html: mailContent,
            });
            console.log(`申请邮件已发送给默认管理员: ${process.env.ADMIN_EMAIL}`);
          } catch (emailError) {
            console.error(`发送邮件给默认管理员失败:`, emailError);
          }
        }
        
        console.log('白名单申请邮件发送完成');
      } else {
        console.log('没有管理员启用了申请邮件通知');
      }
    } catch (mailError) {
      console.error('发送申请邮件失败:', mailError);
      // 邮件失败不影响整个请求的成功
    }
    
    return NextResponse.json({
      success: true,
      message: '申请提交成功'
    });
  } catch (error) {
    console.error('提交申请失败:', error);
    return NextResponse.json(
      { success: false, message: '提交申请失败' },
      { status: 500 }
    );
  }
}
