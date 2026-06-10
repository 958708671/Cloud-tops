import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { existsSync, readFile } from 'fs';
import sql, { withRetry } from '@/lib/db';
import { initFileMetadataTable } from '@/lib/fileMetadata';

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

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const { filename } = params;
    const clientIP = getClientIP(request);
    
    // 确保文件元数据表存在
    await initFileMetadataTable();
    
    // 构建文件路径
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filePath = join(uploadDir, filename);
    
    // 检查文件是否存在
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: '文件不存在' },
        { status: 404 }
      );
    }
    
    // 检查文件是否允许访问（只允许管理员访问）
    // 检查是否是管理员
    const adminRes = await fetch(`${request.nextUrl.origin}/api/admin/check`);
    const adminData = await adminRes.json();
    
    if (!adminData.isAdmin) {
      return NextResponse.json(
        { success: false, message: '无权限访问此文件' },
        { status: 403 }
      );
    }
    
    // 更新访问计数和时间
    await withRetry(async () => {
      await sql`
        UPDATE file_metadata
        SET access_count = access_count + 1, last_access = CURRENT_TIMESTAMP
        WHERE file_name = ${filename}
      `;
    });
    
    // 读取文件内容
    const fileContent = await readFile(filePath);
    
    // 根据文件扩展名设置Content-Type
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    let contentType = 'application/octet-stream';
    
    if (['jpg', 'jpeg'].includes(ext)) {
      contentType = 'image/jpeg';
    } else if (ext === 'png') {
      contentType = 'image/png';
    } else if (ext === 'gif') {
      contentType = 'image/gif';
    } else if (ext === 'webp') {
      contentType = 'image/webp';
    } else if (ext === 'mp4') {
      contentType = 'video/mp4';
    } else if (ext === 'webm') {
      contentType = 'video/webm';
    } else if (ext === 'ogg') {
      contentType = 'video/ogg';
    } else if (['zip', 'rar', '7z'].includes(ext)) {
      contentType = 'application/octet-stream';
    }
    
    // 返回文件内容
    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`
      }
    });
    
  } catch (error) {
    console.error('文件访问失败:', error);
    return NextResponse.json(
      { success: false, message: '文件访问失败' },
      { status: 500 }
    );
  }
}