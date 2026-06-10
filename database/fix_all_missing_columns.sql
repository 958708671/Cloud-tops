-- 完整的数据库迁移脚本 - 添加所有缺失的列
-- 执行此脚本修复所有数据库表结构问题

DO $$ 
BEGIN
  -- ============================================
  -- 修复 blacklist 表
  -- ============================================
  
  -- 添加 ip_address 列
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blacklist' AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE blacklist ADD COLUMN ip_address VARCHAR(50);
    RAISE NOTICE '已添加 ip_address 列到 blacklist 表';
  END IF;

  -- 添加 banned_by_id 列
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blacklist' AND column_name = 'banned_by_id'
  ) THEN
    ALTER TABLE blacklist ADD COLUMN banned_by_id INTEGER;
    RAISE NOTICE '已添加 banned_by_id 列到 blacklist 表';
  END IF;

  -- 添加 is_permanent 列
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blacklist' AND column_name = 'is_permanent'
  ) THEN
    ALTER TABLE blacklist ADD COLUMN is_permanent BOOLEAN DEFAULT FALSE;
    RAISE NOTICE '已添加 is_permanent 列到 blacklist 表';
  END IF;

  -- 添加 duration_minutes 列
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blacklist' AND column_name = 'duration_minutes'
  ) THEN
    ALTER TABLE blacklist ADD COLUMN duration_minutes INTEGER;
    RAISE NOTICE '已添加 duration_minutes 列到 blacklist 表';
  END IF;

  -- 添加 expires_at 列
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blacklist' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE blacklist ADD COLUMN expires_at TIMESTAMP;
    RAISE NOTICE '已添加 expires_at 列到 blacklist 表';
  END IF;

  -- 添加 is_active 列
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blacklist' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE blacklist ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    RAISE NOTICE '已添加 is_active 列到 blacklist 表';
  END IF;

  -- 添加 updated_at 列
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blacklist' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE blacklist ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    RAISE NOTICE '已添加 updated_at 列到 blacklist 表';
  END IF;

  -- ============================================
  -- 修复 events 表
  -- ============================================
  
  -- 添加 location 列
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'location'
  ) THEN
    ALTER TABLE events ADD COLUMN location VARCHAR(200);
    RAISE NOTICE '已添加 location 列到 events 表';
  END IF;

  -- 添加 max_participants 列
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'max_participants'
  ) THEN
    ALTER TABLE events ADD COLUMN max_participants INTEGER;
    RAISE NOTICE '已添加 max_participants 列到 events 表';
  END IF;

  -- 添加 organizer 列
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'organizer'
  ) THEN
    ALTER TABLE events ADD COLUMN organizer VARCHAR(100);
    RAISE NOTICE '已添加 organizer 列到 events 表';
  END IF;

  -- 添加 updated_at 列
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE events ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    RAISE NOTICE '已添加 updated_at 列到 events 表';
  END IF;

  -- ============================================
  -- 修复 ip_bans 表
  -- ============================================
  
  -- 添加 minecraft_id 列
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ip_bans' AND column_name = 'minecraft_id'
  ) THEN
    ALTER TABLE ip_bans ADD COLUMN minecraft_id VARCHAR(100);
    RAISE NOTICE '已添加 minecraft_id 列到 ip_bans 表';
  END IF;

  -- 添加 banned_by_id 列
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ip_bans' AND column_name = 'banned_by_id'
  ) THEN
    ALTER TABLE ip_bans ADD COLUMN banned_by_id INTEGER;
    RAISE NOTICE '已添加 banned_by_id 列到 ip_bans 表';
  END IF;

  -- 添加 is_active 列
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ip_bans' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE ip_bans ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    RAISE NOTICE '已添加 is_active 列到 ip_bans 表';
  END IF;

  -- 添加 unbanned_at 列
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ip_bans' AND column_name = 'unbanned_at'
  ) THEN
    ALTER TABLE ip_bans ADD COLUMN unbanned_at TIMESTAMP;
    RAISE NOTICE '已添加 unbanned_at 列到 ip_bans 表';
  END IF;

  -- 添加 unbanned_by 列
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ip_bans' AND column_name = 'unbanned_by'
  ) THEN
    ALTER TABLE ip_bans ADD COLUMN unbanned_by VARCHAR(100);
    RAISE NOTICE '已添加 unbanned_by 列到 ip_bans 表';
  END IF;

END $$;

-- ============================================
-- 创建索引
-- ============================================

-- blacklist 表索引
CREATE INDEX IF NOT EXISTS idx_blacklist_minecraft_id ON blacklist(minecraft_id);
CREATE INDEX IF NOT EXISTS idx_blacklist_ip ON blacklist(ip_address);
CREATE INDEX IF NOT EXISTS idx_blacklist_is_active ON blacklist(is_active);
CREATE INDEX IF NOT EXISTS idx_blacklist_expires_at ON blacklist(expires_at);

-- events 表索引
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- ip_bans 表索引
CREATE INDEX IF NOT EXISTS idx_ip_bans_ip ON ip_bans(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_bans_minecraft_id ON ip_bans(minecraft_id);
CREATE INDEX IF NOT EXISTS idx_ip_bans_active ON ip_bans(is_active);

-- ============================================
-- 更新现有数据
-- ============================================

-- 将 NULL 值设置为默认值
UPDATE blacklist SET is_active = TRUE WHERE is_active IS NULL;
UPDATE blacklist SET is_permanent = FALSE WHERE is_permanent IS NULL;
UPDATE ip_bans SET is_active = TRUE WHERE is_active IS NULL;

RAISE NOTICE '数据库迁移完成！';
