CREATE TABLE companies (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    homepage_url VARCHAR(1000),
    memo VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_companies_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT uk_companies_user_name UNIQUE (user_id, name)
);

CREATE INDEX idx_companies_user_id ON companies (user_id);

CREATE TABLE applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    company_id BIGINT NOT NULL,
    position_name VARCHAR(150) NOT NULL,
    recruitment_title VARCHAR(200),
    recruitment_year INTEGER NOT NULL,
    season VARCHAR(30) NOT NULL,
    posting_url VARCHAR(1000),
    application_start_at TIMESTAMPTZ,
    deadline_at TIMESTAMPTZ,
    status VARCHAR(40) NOT NULL,
    work_location VARCHAR(150),
    application_site_url VARCHAR(1000),
    memo VARCHAR(500),
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_applications_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_applications_company FOREIGN KEY (company_id) REFERENCES companies (id)
);

CREATE INDEX idx_applications_user_deadline ON applications (user_id, deadline_at);
CREATE INDEX idx_applications_user_status ON applications (user_id, status);
CREATE INDEX idx_applications_user_company ON applications (user_id, company_id);

CREATE TABLE application_status_histories (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL,
    previous_status VARCHAR(40) NOT NULL,
    new_status VARCHAR(40) NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_application_status_histories_application
        FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE
);

CREATE INDEX idx_application_status_histories_application_id
    ON application_status_histories (application_id, changed_at);
