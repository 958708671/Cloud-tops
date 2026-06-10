import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL || '');

async function resetAdminPassword() {
  const newPassword = 'admin123'; // 您可以修改这个默认密码

  console.log('开始重置管理员密码...');

  try {
    // 生成新的密码哈希
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新所有管理员的密码
    const result = await sql`
      UPDATE admins
      SET password = ${hashedPassword}
      RETURNING id, username, display_name, qq, is_owner
    `;

    console.log('密码重置成功！');
    console.log('管理员列表：');
    result.forEach(admin => {
      console.log(`- 用户名: ${admin.username}, 昵称: ${admin.display_name}, QQ: ${admin.qq}, 是服主: ${admin.is_owner ? '是' : '否'}`);
    });
    console.log(`\n新的登录密码是: ${newPassword}`);
    console.log('请登录后立即修改密码！');

  } catch (error) {
    console.error('密码重置失败:', error);
  }
}

resetAdminPassword();
