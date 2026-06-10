import { NextRequest, NextResponse } from 'next/server';
import sql, { withRetry } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const result = await withRetry(async () => {
      return await sql`
        SELECT * FROM website_config WHERE id = 1
      `;
    });
    
    if (result.length === 0) {
      return NextResponse.json({
        success: true,
        data: null
      });
    }
    
    const config = result[0];
    
    if (config.elements && typeof config.elements === 'string') {
      try {
        config.elements = JSON.parse(config.elements);
      } catch (e) {
        config.elements = null;
      }
    }
    
    if (config.rules && typeof config.rules === 'string') {
      try {
        config.rules = JSON.parse(config.rules);
      } catch (e) {
        config.rules = null;
      }
    }
    
    return NextResponse.json({
      success: true,
      data: config
    });
    
  } catch (error) {
    console.error('获取配置失败:', error);
    return NextResponse.json(
      { success: false, message: '获取配置失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const data = await request.json();
    
    const elementsJson = data.elements ? JSON.stringify(data.elements) : null;
    const rulesJson = data.rules ? JSON.stringify(data.rules) : null;
    const contactQQ = data.contact_qq || '';
    const contactQQId = data.contact_qqid || '';
    
    await withRetry(async () => {
      const existing = await sql`
        SELECT id FROM website_config WHERE id = 1
      `;
      
      if (existing.length === 0) {
        await sql`
          INSERT INTO website_config (id, elements, rules, contact_qq, contact_qqid, updated_at)
          VALUES (1, ${elementsJson}, ${rulesJson}, ${contactQQ}, ${contactQQId}, NOW())
        `;
      } else {
        await sql`
          UPDATE website_config 
          SET 
            elements = ${elementsJson},
            rules = ${rulesJson},
            contact_qq = ${contactQQ},
            contact_qqid = ${contactQQId},
            updated_at = NOW()
          WHERE id = 1
        `;
      }
    });
    
    return NextResponse.json({
      success: true,
      message: '保存成功'
    });
    
  } catch (error) {
    console.error('保存配置失败:', error);
    return NextResponse.json(
      { success: false, message: '保存配置失败' },
      { status: 500 }
    );
  }
}
