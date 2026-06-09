CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
                                     id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    display_name  VARCHAR(100) NOT NULL,
    avatar_url    VARCHAR(500),
    city          VARCHAR(100),
    state         VARCHAR(50),
    bio           TEXT,
    oauth_provider VARCHAR(50),
    oauth_id      VARCHAR(255),
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
    );