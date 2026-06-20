-- Accounts being automated. Each row is one X/Twitter account posting via IFTTT.
CREATE TABLE IF NOT EXISTS accounts (
  id               SERIAL PRIMARY KEY,
  name             TEXT NOT NULL,
  handle           TEXT,
  ifttt_webhook_key TEXT NOT NULL,
  ifttt_event_name TEXT NOT NULL,
  post_prefix      TEXT NOT NULL DEFAULT '',
  system_prompt    TEXT NOT NULL,
  topics           JSONB NOT NULL DEFAULT '[]'::jsonb,
  interval_minutes INTEGER NOT NULL DEFAULT 60,
  enabled          BOOLEAN NOT NULL DEFAULT true,
  last_posted_at   TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- History log of every generated post (success or failure).
CREATE TABLE IF NOT EXISTS posts (
  id           SERIAL PRIMARY KEY,
  account_id   INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  topic        TEXT,
  status       TEXT NOT NULL,          -- 'success' | 'failed'
  ifttt_status INTEGER,
  error        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_account_created
  ON posts (account_id, created_at DESC);
