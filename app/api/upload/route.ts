import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// 获取客户端IP地址
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  } else if (realIP) {
    return realIP;
  }

  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const uploaderName = formData.get('uploaderName') as string || '未知用户';
    
    if (files.length === 0) {
      return NextResponse.json(
        { success: false, message: '没有上传文件' },
        { status: 400 }
      );
    }
    
    if (files.length > 10) {
      return NextResponse.json(
        { success: false, message: '最多上传10个文件' },
        { status: 400 }
      );
    }
    
    // 确保上传目录存在
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
      console.log('创建上传目录成功:', uploadDir);
    }
    
    const uploadedUrls: string[] = [];
    const clientIP = getClientIP(request);
    
    for (const file of files) {
      // 检查文件类型
      const fileType = file.type;
      const fileName = file.name;
      const ext = fileName.split('.').pop()?.toLowerCase() || '';
      
      // 允许的文件类型
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      const allowedArchiveTypes = ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'];
      const allowedArchiveExts = ['zip', 'rar', '7z'];
      
      // 验证文件类型
      let isAllowed = false;
      
      // 图片验证
      if (allowedImageTypes.includes(fileType)) {
        isAllowed = true;
      }
      // 视频验证
      else if (allowedVideoTypes.includes(fileType)) {
        isAllowed = true;
      }
      // 压缩包验证（通过扩展名）
      else if (allowedArchiveExts.includes(ext)) {
        isAllowed = true;
      }
      
      if (!isAllowed) {
        console.log('不允许的文件类型:', fileType, fileName);
        continue;
      }
      
      // 生成唯一文件名
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const filePath = join(uploadDir, uniqueFileName);
      const relativePath = `/uploads/${uniqueFileName}`;
      
      try {
        // 写入文件
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);
        console.log('文件写入成功:', filePath);
        
        // 直接返回文件路径
        uploadedUrls.push(relativePath);
      } catch (error) {
        console.error('文件写入失败:', error);
        continue;
      }
    }
    
    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { success: false, message: '所有文件上传失败' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      urls: uploadedUrls
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    return NextResponse.json(
      { success: false, message: '文件上传失败' },
      { status: 500 }
    );
  }
}
