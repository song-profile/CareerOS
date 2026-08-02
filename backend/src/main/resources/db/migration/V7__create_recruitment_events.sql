CREATE TABLE recruitment_events (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    application_id BIGINT,
    event_type VARCHAR(40) NOT NULL,
    title VARCHAR(150) NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    all_day BOOLEAN NOT NULL DEFAULT FALSE,
    location VARCHAR(200),
    online_url VARCHAR(1000),
    memo VARCHAR(1000),
    google_event_id VARCHAR(200),
    sync_status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_recruitment_events_user FOREIGN KEY (user_id) REFERENCES users (id),
    -- 지원 건이 사라지면 그 회사 면접 일정도 의미가 없다. 개인 일정은 application_id가 비어 있어 영향받지 않는다.
    CONSTRAINT fk_recruitment_events_application
        FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE,
    CONSTRAINT ck_recruitment_events_period CHECK (end_at >= start_at)
);

-- 월간 범위 조회와 다가오는 일정 조회가 모두 이 순서로 읽는다.
CREATE INDEX idx_recruitment_events_user_start ON recruitment_events (user_id, start_at);
CREATE INDEX idx_recruitment_events_application ON recruitment_events (application_id);

CREATE TABLE reminder_rules (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL,
    minutes_before INTEGER NOT NULL,
    channel VARCHAR(20) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_reminder_rules_event
        FOREIGN KEY (event_id) REFERENCES recruitment_events (id) ON DELETE CASCADE,
    -- 같은 일정에 같은 시점·채널 알림이 두 번 들어가지 않는다. 서비스가 먼저 막지만 DB에서도 막는다.
    CONSTRAINT uk_reminder_rules_event_minutes_channel UNIQUE (event_id, minutes_before, channel),
    CONSTRAINT ck_reminder_rules_minutes_before CHECK (minutes_before >= 0)
);
