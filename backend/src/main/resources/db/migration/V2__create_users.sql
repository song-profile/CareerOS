CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    provider VARCHAR(30) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    profile_image_url VARCHAR(1000),
    role VARCHAR(30) NOT NULL,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uk_users_provider_subject UNIQUE (provider, provider_user_id)
);

CREATE INDEX idx_users_email ON users (email);
