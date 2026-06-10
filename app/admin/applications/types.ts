// 应用类型定义
export interface Application {
  id: number;
  minecraft_id: string;
  age: number | null;
  contact: string;
  reason: string;
  status: string;
  reviewed_by: string | null;
  review_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  // 游戏经验相关
  play_time: number | null;
  favorite_mode: string | null;
  server_experience: string | null;
  // 个人信息相关
  gender: string | null;
  country: string | null;
  // 社区相关
  how_found: string | null;
  discord_id: string | null;
  // 游戏行为相关
  play_style: string | null;
  griefing_history: string | null;
  // 其他
  additional_info: string | null;
  // 答题相关
  quiz_category: string | null;
  quiz_score: number | null;
  quiz_total: number | null;
  // IP地址
  ip_address?: string;
  // 作品相关
  work_files?: string[]; // 作品图片URL数组
  scenario_answers?: Record<number, string>; // 实景题答案
}

export interface AdminInfo {
  user: string;
  adminId: number;
}
