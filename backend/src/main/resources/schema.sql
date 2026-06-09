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

CREATE TABLE IF NOT EXISTS locations (
                                         id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    address         VARCHAR(500),
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(50)  NOT NULL,
    zip_code        VARCHAR(10),
    latitude        DECIMAL(10,8),
    longitude       DECIMAL(11,8),
    google_place_id VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS events (
                                      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    category     VARCHAR(100) NOT NULL,
    event_date   TIMESTAMPTZ NOT NULL,
    end_date     TIMESTAMPTZ,
    location_id  UUID REFERENCES locations(id) ON DELETE SET NULL,
    organizer_id UUID REFERENCES users(id)     ON DELETE SET NULL,
    image_url    VARCHAR(500),
    external_id  VARCHAR(255),
    source       VARCHAR(50)  DEFAULT 'user',
    ticket_url   VARCHAR(500),
    price_min    DECIMAL(10,2),
    price_max    DECIMAL(10,2),
    is_free      BOOLEAN      DEFAULT false,
    capacity     INTEGER,
    status       VARCHAR(50)  DEFAULT 'active',
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
    );

