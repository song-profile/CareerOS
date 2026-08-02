CREATE TABLE application_files (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL,
    file_asset_id BIGINT NOT NULL,
    locked_version INTEGER NOT NULL,
    purpose VARCHAR(100),
    linked_at TIMESTAMPTZ NOT NULL,
    -- 지원 건이 사라지면 연결 자체가 의미 없다. 파일 원본은 이 테이블과 무관하게 남는다.
    CONSTRAINT fk_application_files_application FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE,
    -- 연결된 파일 원본은 서비스가 먼저 409로 막지만, DB에서도 기본 RESTRICT로 막는다.
    CONSTRAINT fk_application_files_file_asset FOREIGN KEY (file_asset_id) REFERENCES file_assets (id),
    CONSTRAINT uk_application_files_application_file UNIQUE (application_id, file_asset_id)
);

CREATE INDEX idx_application_files_application ON application_files (application_id);
CREATE INDEX idx_application_files_file_asset ON application_files (file_asset_id);

CREATE TABLE application_credentials (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL,
    credential_id BIGINT NOT NULL,
    purpose VARCHAR(100),
    linked_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_application_credentials_application FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE,
    CONSTRAINT fk_application_credentials_credential FOREIGN KEY (credential_id) REFERENCES credentials (id),
    CONSTRAINT uk_application_credentials_application_credential UNIQUE (application_id, credential_id)
);

CREATE INDEX idx_application_credentials_application ON application_credentials (application_id);
CREATE INDEX idx_application_credentials_credential ON application_credentials (credential_id);

CREATE TABLE application_external_links (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL,
    external_link_id BIGINT NOT NULL,
    purpose VARCHAR(100),
    linked_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_application_external_links_application FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE,
    CONSTRAINT fk_application_external_links_external_link FOREIGN KEY (external_link_id) REFERENCES external_links (id),
    CONSTRAINT uk_application_external_links_application_link UNIQUE (application_id, external_link_id)
);

CREATE INDEX idx_application_external_links_application ON application_external_links (application_id);
CREATE INDEX idx_application_external_links_external_link ON application_external_links (external_link_id);
