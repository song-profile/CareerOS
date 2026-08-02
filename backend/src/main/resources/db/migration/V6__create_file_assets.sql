CREATE TABLE file_assets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category VARCHAR(40) NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    storage_key VARCHAR(200) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    parent_asset_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_file_assets_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_file_assets_parent
        FOREIGN KEY (parent_asset_id) REFERENCES file_assets (id) ON DELETE SET NULL,
    CONSTRAINT uq_file_assets_storage_key UNIQUE (storage_key),
    CONSTRAINT ck_file_assets_size CHECK (size > 0)
);

CREATE INDEX idx_file_assets_user_category ON file_assets (user_id, category);

-- 5단계에서 컬럼만 열어 둔 자리를 실제 참조로 잇는다.
-- 서비스가 먼저 409로 막지만, 참조된 파일이 지워지는 일은 DB에서도 막는다.
ALTER TABLE credentials
    ADD CONSTRAINT fk_credentials_file_asset
        FOREIGN KEY (file_asset_id) REFERENCES file_assets (id);
