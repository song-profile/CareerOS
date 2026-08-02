CREATE TABLE credentials (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    credential_type VARCHAR(40) NOT NULL,
    name VARCHAR(150) NOT NULL,
    issuer VARCHAR(150),
    acquired_at DATE NOT NULL,
    credential_number_encrypted VARCHAR(500),
    score VARCHAR(50),
    grade VARCHAR(50),
    valid_from DATE,
    expires_at DATE,
    permanent BOOLEAN NOT NULL DEFAULT FALSE,
    description VARCHAR(500),
    usage_memo VARCHAR(1000),
    study_memo VARCHAR(1000),
    reference_url VARCHAR(1000),
    file_asset_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_credentials_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT ck_credentials_permanent_expiry CHECK (NOT permanent OR expires_at IS NULL)
);

CREATE INDEX idx_credentials_user_type ON credentials (user_id, credential_type);
CREATE INDEX idx_credentials_user_expires ON credentials (user_id, expires_at);

CREATE TABLE credential_access_audits (
    id BIGSERIAL PRIMARY KEY,
    credential_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    accessed_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_credential_access_audits_credential
        FOREIGN KEY (credential_id) REFERENCES credentials (id) ON DELETE CASCADE,
    CONSTRAINT fk_credential_access_audits_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_credential_access_audits_credential
    ON credential_access_audits (credential_id, accessed_at);

CREATE TABLE external_links (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    link_type VARCHAR(40) NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    description VARCHAR(300),
    visibility VARCHAR(20) NOT NULL,
    project_name VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_external_links_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_external_links_user_type ON external_links (user_id, link_type);
