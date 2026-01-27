-- Burcum Database Schema for Cloudflare D1

-- Users tablosu
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  email_verified_at INTEGER,
  password_hash TEXT,
  name TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  birth_time TEXT,
  birth_city TEXT,
  birth_latitude REAL,
  birth_longitude REAL,
  zodiac_sign TEXT NOT NULL,
  ascendant_sign TEXT,
  moon_sign TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  subscription_expires_at INTEGER,
  daily_readings_count INTEGER NOT NULL DEFAULT 0,
  last_reading_date TEXT,
  push_token TEXT,
  preferences TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_zodiac ON users(zodiac_sign);

-- Sessions tablosu
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_info TEXT,
  ip_address TEXT,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- Email verification tokens
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

-- Horoscope readings (cache)
CREATE TABLE IF NOT EXISTS horoscope_readings (
  id TEXT PRIMARY KEY,
  zodiac_sign TEXT NOT NULL,
  reading_type TEXT NOT NULL,
  reading_date TEXT NOT NULL,
  content TEXT NOT NULL,
  love_score INTEGER,
  career_score INTEGER,
  health_score INTEGER,
  lucky_numbers TEXT,
  lucky_color TEXT,
  advice TEXT,
  created_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_readings_lookup ON horoscope_readings(zodiac_sign, reading_type, reading_date);

-- Personal readings
CREATE TABLE IF NOT EXISTS personal_readings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reading_type TEXT NOT NULL,
  question TEXT,
  content TEXT NOT NULL,
  metadata TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_personal_user ON personal_readings(user_id, reading_type);

-- Compatibility checks
CREATE TABLE IF NOT EXISTS compatibility_checks (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  sign1 TEXT NOT NULL,
  sign2 TEXT NOT NULL,
  overall_score INTEGER,
  love_score INTEGER,
  friendship_score INTEGER,
  work_score INTEGER,
  analysis TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_compatibility_signs ON compatibility_checks(sign1, sign2);

-- Rate limits
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  window_start INTEGER NOT NULL
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  platform TEXT NOT NULL,
  external_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  started_at INTEGER NOT NULL,
  expires_at INTEGER,
  cancelled_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_external ON subscriptions(external_id);
