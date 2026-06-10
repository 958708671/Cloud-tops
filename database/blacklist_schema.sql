-- 黑名单表
CREATE TABLE IF NOT EXISTS blacklist (
  id SERIAL PRIMARY KEY,
  minecraft_id VARCHAR(100) NOT NULL,
  ip_address VARCHAR(50),
  reason TEXT NOT NULL,
  banned_by VARCHAR(100) NOT NULL,
  banned_by_id INTEGER,
  is_permanent BOOLEAN DEFAULT FALSE,
  duration_minutes INTEGER,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_blacklist_minecraft_id ON blacklist(minecraft_id);
CREATE INDEX IF NOT EXISTS idx_blacklist_ip ON blacklist(ip_address);
CREATE INDEX IF NOT EXISTS idx_blacklist_created ON blacklist(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blacklist_expires_at ON blacklist(expires_at);
CREATE INDEX IF NOT EXISTS idx_blacklist_is_active ON blacklist(is_active);

-- IP封禁记录表（用于记录封禁历史）
CREATE TABLE IF NOT EXISTS ip_bans (
  id SERIAL PRIMARY KEY,
  ip_address VARCHAR(50) NOT NULL,
  minecraft_id VARCHAR(100),
  reason TEXT NOT NULL,
  banned_by VARCHAR(100) NOT NULL,
  banned_by_id INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unbanned_at TIMESTAMP,
  unbanned_by VARCHAR(100)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_ip_bans_ip ON ip_bans(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_bans_minecraft_id ON ip_bans(minecraft_id);
CREATE INDEX IF NOT EXISTS idx_ip_bans_active ON ip_bans(is_active);

-- 如果表已存在，添加新列
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blacklist' AND column_name = 'is_permanent') THEN
    ALTER TABLE blacklist ADD COLUMN is_permanent BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blacklist' AND column_name = 'duration_minutes') THEN
    ALTER TABLE blacklist ADD COLUMN duration_minutes INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blacklist' AND column_name = 'expires_at') THEN
    ALTER TABLE blacklist ADD COLUMN expires_at TIMESTAMP;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'blacklist' AND column_name = 'is_active') THEN
    ALTER TABLE blacklist ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;
END $$;
