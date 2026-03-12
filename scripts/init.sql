CREATE TABLE IF NOT EXISTS source_configs (
  id UUID PRIMARY KEY,
  venue_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config_json JSONB NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS access_policies (
  id UUID PRIMARY KEY,
  venue_id TEXT NOT NULL,
  name TEXT NOT NULL,
  policy_json JSONB NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS access_events (
  id UUID PRIMARY KEY,
  venue_id TEXT NOT NULL,
  identifier_hash TEXT NOT NULL,
  action TEXT NOT NULL,
  decision TEXT NOT NULL,
  token_id TEXT,
  proof_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
