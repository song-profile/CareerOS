package com.careerdock.essay.domain;

import com.careerdock.application.domain.Application;
import com.careerdock.global.domain.BaseTimeEntity;
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

@Entity
@Table(
        name = "essay_questions",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_essay_questions_application_order", columnNames = {"application_id", "question_order"})
        }
)
public class EssayQuestion extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Column(name = "question_order", nullable = false)
    private int questionOrder;

    @Column(name = "question_text", nullable = false)
    private String questionText;

    @Column(name = "character_limit")
    private Integer characterLimit;

    @Enumerated(EnumType.STRING)
    @Column(name = "common_question_type", nullable = false, length = 50)
    private CommonQuestionType commonQuestionType;

    protected EssayQuestion() {
    }

    private EssayQuestion(
            Application application,
            int questionOrder,
            String questionText,
            Integer characterLimit,
            CommonQuestionType commonQuestionType
    ) {
        this.application = application;
        this.questionOrder = questionOrder;
        this.questionText = questionText;
        this.characterLimit = characterLimit;
        this.commonQuestionType = commonQuestionType;
    }

    public static EssayQuestion create(
            Application application,
            int questionOrder,
            String questionText,
            Integer characterLimit,
            CommonQuestionType commonQuestionType
    ) {
        return new EssayQuestion(application, questionOrder, questionText, characterLimit, commonQuestionType);
    }

    public void update(int questionOrder, String questionText, Integer characterLimit, CommonQuestionType commonQuestionType) {
        this.questionOrder = questionOrder;
        this.questionText = questionText;
        this.characterLimit = characterLimit;
        this.commonQuestionType = commonQuestionType;
    }

    public Long getId() { return id; }
    public Application getApplication() { return application; }
    public int getQuestionOrder() { return questionOrder; }
    public String getQuestionText() { return questionText; }
    public Integer getCharacterLimit() { return characterLimit; }
    public CommonQuestionType getCommonQuestionType() { return commonQuestionType; }
}
