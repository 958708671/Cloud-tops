import sql from './lib/db';

async function checkDatabase() {
  try {
    // 检查是否能连接到数据库
    const test = await sql`SELECT 1`;
    console.log('✅ 数据库连接成功');

    // 检查quiz_attempts表是否存在
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'quiz_attempts'
      )
    `;

    if (tableExists[0].exists) {
      console.log('✅ quiz_attempts表存在');

      // 检查表结构
      const columns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'quiz_attempts'
      `;
      console.log('表结构:');
      columns.forEach((col: any) => {
        console.log(`  ${col.column_name}: ${col.data_type}`);
      });

      // 检查是否有数据
      const data = await sql`SELECT * FROM quiz_attempts LIMIT 10`;
      console.log(`\n表中数据 (${data.length} 条):`);
      data.forEach((row: any) => {
        console.log(`  IP: ${row.ip_address}, 日期: ${row.attempt_date}, 次数: ${row.attempt_count}`);
      });

    } else {
      console.log('❌ quiz_attempts表不存在');
      // 尝试创建表
      try {
        await sql`
          CREATE TABLE quiz_attempts (
            id SERIAL PRIMARY KEY,
            ip_address VARCHAR(50) NOT NULL,
            attempt_date DATE NOT NULL,
            attempt_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(ip_address, attempt_date)
          )
        `;
        console.log('✅ 已创建quiz_attempts表');
      } catch (error) {
        console.error('创建表失败:', error);
      }
    }

  } catch (error) {
    console.error('数据库检查失败:', error);
  }
}

checkDatabase();