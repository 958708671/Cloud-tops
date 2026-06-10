-- 投诉举报表
CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  reporter_name VARCHAR(100) NOT NULL,
  reporter_qq VARCHAR(20) NOT NULL,
  target_player VARCHAR(100) NOT NULL,
  violation_time VARCHAR(50),
  violation_type VARCHAR(200) NOT NULL,
  description TEXT,
  evidence TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_target ON complaints(target_player);
CREATE INDEX IF NOT EXISTS idx_complaints_created ON complaints(created_at DESC);
