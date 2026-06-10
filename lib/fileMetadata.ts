import sql, { withRetry } from '@/lib/db';

// 初始化文件元数据表
export async function initFileMetadataTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS file_metadata (
        id SERIAL PRIMARY KEY,
        file_name VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(512) NOT NULL,
        file_type VARCHAR(100) NOT NULL,
        uploader_ip VARCHAR(45) NOT NULL,
        uploader_name VARCHAR(100) NOT NULL,
        upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        access_count INTEGER DEFAULT 0,
        last_access TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('文件元数据表初始化成功');
  } catch (error) {
    console.error('创建文件元数据表失败:', error);
  }
}