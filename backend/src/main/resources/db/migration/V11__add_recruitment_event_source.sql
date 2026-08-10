ALTER TABLE recruitment_events
    ADD COLUMN source_type VARCHAR(30) NOT NULL DEFAULT 'MANUAL',
    ADD COLUMN auto_generated BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN google_synced_at TIMESTAMPTZ;

ALTER TABLE google_calendar_connections
    ADD COLUMN auto_sync_enabled BOOLEAN NOT NULL DEFAULT TRUE;

CREATE UNIQUE INDEX uk_recruitment_events_auto_application_deadline
    ON recruitment_events (application_id)
    WHERE auto_generated = TRUE
      AND event_type = 'APPLICATION_DEADLINE'
      AND application_id IS NOT NULL;
