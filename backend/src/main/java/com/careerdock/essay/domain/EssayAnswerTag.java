package com.careerdock.essay.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

@Entity
@Table(
        name = "essay_answer_tags",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_essay_answer_tags_answer_tag", columnNames = {"answer_id", "tag_id"})
        }
)
public class EssayAnswerTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "answer_id", nullable = false)
    private EssayAnswer answer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tag_id", nullable = false)
    private ExperienceTag tag;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected EssayAnswerTag() {
    }

    private EssayAnswerTag(EssayAnswer answer, ExperienceTag tag) {
        this.answer = answer;
        this.tag = tag;
    }

    public static EssayAnswerTag create(EssayAnswer answer, ExperienceTag tag) {
        return new EssayAnswerTag(answer, tag);
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public Long getId() { return id; }
    public EssayAnswer getAnswer() { return answer; }
    public ExperienceTag getTag() { return tag; }
}
