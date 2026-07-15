CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table: stores all registered CulturPass accounts including OAuth and email
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

-- Locations table: stores venue and address details for events, including Google Maps coordinates
CREATE TABLE IF NOT EXISTS locations (
                                         id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    address         VARCHAR(500),
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(50)  NOT NULL,
    zip_code        VARCHAR(10),
    latitude        FLOAT,
    longitude       FLOAT,
    google_place_id VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT NOW()
    );

-- Events table: stores all events both user-created and pulled from Ticketmaster API
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
    ticket_deadline TIMESTAMPTZ,
    price_min    DECIMAL(10,2),
    price_max    DECIMAL(10,2),
    is_free      BOOLEAN      DEFAULT false,
    capacity     INTEGER,
    status       VARCHAR(50)  DEFAULT 'active',
    is_featured  BOOLEAN      DEFAULT false,
    notification_message TEXT,
    notification_read    BOOLEAN DEFAULT false,
    event_type      VARCHAR(50)  DEFAULT 'event',
    business_name   VARCHAR(255),
    happy_hour_days VARCHAR(255),
    happy_hour_start VARCHAR(50),
    happy_hour_end  VARCHAR(50),
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
    );

-- RSVPs Table: tracks which users are attending which events, one record per user-event pair
CREATE TABLE IF NOT EXISTS rsvps (
                                     id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    status     VARCHAR(50) DEFAULT 'going',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, event_id)
    );

-- Saved events table: stores events that users have bookmarked to view later
CREATE TABLE IF NOT EXISTS saved_events (
                                            id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, event_id)
    );

-- Categories table: stores event categories managed dynamically by admins
-- Supports temporary/seasonal categories with auto-expiration
CREATE TABLE IF NOT EXISTS categories (
                                          id            SERIAL PRIMARY KEY,
                                          name          VARCHAR(100) UNIQUE NOT NULL,
    deleted       BOOLEAN DEFAULT false NOT NULL,
    is_temporary  BOOLEAN DEFAULT false,
    expires_at    TIMESTAMPTZ,
    display_order INTEGER DEFAULT 0,
    created_at    TIMESTAMPTZ DEFAULT NOW()
    );

-- Banned businesses table: tracks businesses banned from the platform by Super Admin
CREATE TABLE IF NOT EXISTS banned_businesses (
                                                 id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255),
    location_id   UUID REFERENCES locations(id) ON DELETE SET NULL,
    reason        TEXT,
    banned_by     VARCHAR(255),
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    is_active     BOOLEAN DEFAULT true
    );

-- Complaints table: stores contact form submissions and user complaints
CREATE TABLE IF NOT EXISTS complaints (
                                          id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_types    TEXT,
    message            TEXT,
    submitted_by       VARCHAR(255),
    reviewed           BOOLEAN DEFAULT false,
    reviewed_by        VARCHAR(255),
    admin_notes        TEXT,
    is_racism_complaint BOOLEAN DEFAULT false,
    created_at         TIMESTAMPTZ DEFAULT NOW()
    );