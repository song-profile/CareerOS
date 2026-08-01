package com.careerdock.essay.domain;

import com.careerdock.global.domain.BaseTimeEntity;
import com.careerdock.global.exception.ConflictException;
import com.careerdock.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import jakarta.persistence.OneToMany;

@Entity
@Table(
        name = "essay_answers",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_essay_answers_question_version", columnNames = {"question_id", "answer_version"})
        }
)
public class EssayAnswer extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private EssayQuestion question;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String content;

    @Column(name = "character_count", nullable = false)
    private int characterCount;

    @Column(name = "answer_version", nullable = false)
    private int version;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EssayAnswerStatus status;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Version
    @Column(name = "lock_version", nullable = false)
    private long lockVersion;

    @OneToMany(mappedBy = "answer")
    private Set<EssayAnswerTag> tags = new HashSet<>();

    protected EssayAnswer() {
    }

    private EssayAnswer(EssayQuestion question, User user, String content, int version, EssayAnswerStatus status) {
        this.question = question;
        this.user = user;
        this.content = content == null ? "" : content;
        this.characterCount = calculateCharacterCount(this.content);
        this.version = version;
        this.status = status;
        this.submittedAt = status == EssayAnswerStatus.SUBMITTED ? Instant.now() : null;
    }

    public static EssayAnswer draft(EssayQuestion question, User user, String content, int version) {
        return new EssayAnswer(question, user, content, version, EssayAnswerStatus.DRAFT);
    }

    public static EssayAnswer improved(EssayQuestion question, User user, String content, int version) {
        return new EssayAnswer(question, user, content, version, EssayAnswerStatus.IMPROVED);
    }

    public void updateDraftContent(String content) {
        if (status == EssayAnswerStatus.SUBMITTED) {
            throw new ConflictException("제출본은 수정할 수 없습니다.");
        }
        this.content = content == null ? "" : content;
        this.characterCount = calculateCharacterCount(this.content);
    }

    public void submitLock(String content) {
        if (status == EssayAnswerStatus.SUBMITTED) {
            throw new ConflictException("이미 제출된 답변입니다.");
        }
        this.content = content == null ? "" : content;
        this.characterCount = calculateCharacterCount(this.content);
        this.status = EssayAnswerStatus.SUBMITTED;
        this.submittedAt = Instant.now();
    }

    public static int calculateCharacterCount(String content) {
        return content == null ? 0 : content.length();
    }

    public Long getId() { return id; }
    public EssayQuestion getQuestion() { return question; }
    public User getUser() { return user; }
    public String getContent() { return content; }
    public int getCharacterCount() { return characterCount; }
    public int getVersion() { return version; }
    public EssayAnswerStatus getStatus() { return status; }
    public Instant getSubmittedAt() { return submittedAt; }
}
