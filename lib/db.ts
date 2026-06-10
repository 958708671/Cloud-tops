import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let _sql: NeonQueryFunction | null = null;

function getSql(): NeonQueryFunction {
  if (!_sql) {
    _sql = neon(process.env.DATABASE_URL || '');
  }
  return _sql;
}

// Proxy 包装，让外部 sql`...` 和 sql.query(...) 用法不变
const sql = new Proxy({} as NeonQueryFunction, {
  apply(_target, _thisArg, args) {
    return Reflect.apply(getSql(), undefined, args);
  },
  get(_target, prop, _receiver) {
    const value = Reflect.get(getSql(), prop, getSql());
    if (typeof value === 'function') {
      return value.bind(getSql());
    }
    return value;
  },
});

// 兼容 pg 风格的 query(text, params) 接口，内部用 neon 实现
export const pgPool = {
  query: async (text: string, params: any[] = []) => {
    if (!params || params.length === 0) {
      const rows = await sql.query(text);
      return { rows };
    }
    const parts = text.split(/\$(\d+)/g);
    const strings: string[] = [];
    const values: any[] = [];
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        strings.push(parts[i]);
      } else {
        const idx = parseInt(parts[i]) - 1;
        values.push(params[idx]);
      }
    }
    const templateStrings = Object.assign(strings, { raw: strings }) as TemplateStringsArray;
    const rows = await sql(templateStrings, ...values);
    return { rows };
  }
};

export async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 500): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = retries; attempt >= 0; attempt--) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      if (attempt === 0) break;
      console.log(`数据库请求失败，${attempt}次重试剩余，${delay}ms后重试...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }

  throw lastError;
}

export async function getNextSortOrder(table: 'announcements' | 'events'): Promise<number> {
  const result = await sql`SELECT COALESCE(MAX(sort_order), 0) as max_order FROM ${table}`;
  return (result[0].max_order || 0) + 1;
}

export default sql;
