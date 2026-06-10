import { NextResponse } from 'next/server';

export async function GET() {
  try {
    let icons = [
      '草方块.png',
      '红石.png',
      '床.png',
      '虞美人.png',
      '钻石.png',
    ];

    if (process.env.NODE_ENV === 'development') {
      try {
        const fs = require('fs');
        const path = require('path');
        const imagesDir = path.join(process.cwd(), 'public', 'images');
        
        if (fs.existsSync(imagesDir)) {
          const files = fs.readdirSync(imagesDir);
          const newIcons = files.filter((file: string) => {
            const ext = path.extname(file).toLowerCase();
            if (ext !== '.png') return false;
            
            if (file.includes('收款码')) return false;
            
            const filePath = path.join(imagesDir, file);
            const stats = fs.statSync(filePath);
            return stats.size <= 100 * 1024;
          });
          
          if (newIcons.length > 0) {
            icons = newIcons;
          }
        }
      } catch (error) {
        console.log('开发模式下无法检测图标文件，使用默认图标');
      }
    }

    return NextResponse.json({ success: true, icons });
  } catch (error) {
    console.error('获取图标列表失败:', error);
    return NextResponse.json({ success: false, icons: [], message: '获取图标列表失败' });
  }
}