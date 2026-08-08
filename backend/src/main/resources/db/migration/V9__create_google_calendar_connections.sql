CREATE TABLE google_calendar_connections (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    google_account_email VARCHAR(255),
    refresh_token_encrypted VARCHAR(500) NOT NULL,
    access_token_encrypted VARCHAR(500),
    access_token_expires_at TIMESTAMPTZ,
    google_calendar_id VARCHAR(200),
    status VARCHAR(20) NOT NULL,
    connected_at TIMESTAMPTZ NOT NULL,
    last_synced_at TIMESTAMPTZ,
    last_sync_error VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_google_calendar_connections_user FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 실패한 이벤트를 재시도 대상으로 찾을 때(NOT_CONNECTED/FAILED) 이 순서로 읽는다.
CREATE INDEX idx_recruitment_events_user_sync_status ON recruitment_events (user_id, sync_status);

ALTER TABLE recruitment_events ADD COLUMN sync_failure_reason VARCHAR(500);
