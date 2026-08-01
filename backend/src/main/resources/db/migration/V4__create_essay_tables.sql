CREATE TABLE essay_questions (
    id BIGSERIAL PRIMARY KEY,
    application_id BIGINT NOT NULL,
    question_order INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    character_limit INTEGER,
    common_question_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_essay_questions_application
        FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE,
    CONSTRAINT uk_essay_questions_application_order UNIQUE (application_id, question_order)
);

CREATE INDEX idx_essay_questions_application_id ON essay_questions (application_id);
CREATE INDEX idx_essay_questions_common_type ON essay_questions (common_question_type);

CREATE TABLE essay_answers (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    character_count INTEGER NOT NULL,
    answer_version INTEGER NOT NULL,
    status VARCHAR(30) NOT NULL,
    submitted_at TIMESTAMPTZ,
    lock_version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_essay_answers_question
        FOREIGN KEY (question_id) REFERENCES essay_questions (id) ON DELETE CASCADE,
    CONSTRAINT fk_essay_answers_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT uk_essay_answers_question_version UNIQUE (question_id, answer_version)
);

CREATE INDEX idx_essay_answers_user_status ON essay_answers (user_id, status);
CREATE INDEX idx_essay_answers_question_id ON essay_answers (question_id);

CREATE TABLE experience_tags (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_experience_tags_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT uk_experience_tags_user_name UNIQUE (user_id, name)
);

CREATE INDEX idx_experience_tags_user_id ON experience_tags (user_id);

CREATE TABLE essay_answer_tags (
    id BIGSERIAL PRIMARY KEY,
    answer_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_essay_answer_tags_answer
        FOREIGN KEY (answer_id) REFERENCES essay_answers (id) ON DELETE CASCADE,
    CONSTRAINT fk_essay_answer_tags_tag
        FOREIGN KEY (tag_id) REFERENCES experience_tags (id) ON DELETE CASCADE,
    CONSTRAINT uk_essay_answer_tags_answer_tag UNIQUE (answer_id, tag_id)
);

CREATE INDEX idx_essay_answer_tags_tag_id ON essay_answer_tags (tag_id);
