package com.careerdock.essay.service;

import com.careerdock.application.domain.Application;
import com.careerdock.application.repository.ApplicationRepository;
import com.careerdock.essay.domain.EssayAnswer;
import com.careerdock.essay.domain.EssayQuestion;
import com.careerdock.essay.domain.ExperienceTag;
import com.careerdock.essay.domain.EssayAnswerTag;
import com.careerdock.essay.dto.*;
import com.careerdock.essay.repository.*;
import com.careerdock.global.exception.ConflictException;
import com.careerdock.global.exception.NotFoundException;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EssayService {

    private final EssayQuestionRepository questionRepository;
    private final EssayAnswerRepository answerRepository;
    private final ExperienceTagRepository tagRepository;
    private final EssayAnswerTagRepository answerTagRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public EssayService(
            EssayQuestionRepository questionRepository,
            EssayAnswerRepository answerRepository,
            ExperienceTagRepository tagRepository,
            EssayAnswerTagRepository answerTagRepository,
            ApplicationRepository applicationRepository,
            UserRepository userRepository
    ) {
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.tagRepository = tagRepository;
        this.answerTagRepository = answerTagRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<EssayAnswerResponse> findAnswers(Long userId, EssaySearchCondition condition) {
        return answerRepository.findAll(EssayAnswerSpecifications.byCondition(userId, condition))
                .stream()
                .sorted(Comparator.comparing(EssayAnswer::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toAnswerResponse)
                .toList();
    }

    @Transactional
    public EssayQuestionResponse createQuestion(Long userId, Long applicationId, EssayQuestionRequest request) {
        Application application = getApplication(userId, applicationId);
        EssayQuestion question = EssayQuestion.create(
                application,
                request.questionOrder(),
                request.questionText(),
                request.characterLimit(),
                request.commonQuestionType()
        );
        return EssayQuestionResponse.from(questionRepository.save(question));
    }

    @Transactional(readOnly = true)
    public List<EssayQuestionResponse> findQuestions(Long userId, Long applicationId) {
        getApplication(userId, applicationId);
        return questionRepository.findByApplicationIdOrderByQuestionOrderAsc(applicationId)
                .stream()
                .map(EssayQuestionResponse::from)
                .toList();
    }

    @Transactional
    public EssayQuestionResponse updateQuestion(Long userId, Long questionId, EssayQuestionRequest request) {
        EssayQuestion question = getQuestion(userId, questionId);
        question.update(request.questionOrder(), request.questionText(), request.characterLimit(), request.commonQuestionType());
        return EssayQuestionResponse.from(question);
    }

    @Transactional
    public EssayAnswerResponse createAnswer(Long userId, Long questionId, EssayAnswerRequest request) {
        User user = getUser(userId);
        EssayQuestion question = getQuestion(userId, questionId);
        int version = answerRepository.findMaxVersionByQuestionId(questionId) + 1;
        EssayAnswer answer = answerRepository.save(EssayAnswer.draft(question, user, request.content(), version));
        return toAnswerResponse(answer);
    }

    @Transactional
    public EssayAnswerResponse updateAnswer(Long userId, Long answerId, EssayAnswerRequest request) {
        EssayAnswer answer = getAnswer(userId, answerId);
        answer.updateDraftContent(request.content());
        return toAnswerResponse(answer);
    }

    @Transactional
    public EssayAnswerResponse createImprovedVersion(Long userId, Long answerId, EssayAnswerRequest request) {
        EssayAnswer base = getAnswer(userId, answerId);
        int version = answerRepository.findMaxVersionByQuestionId(base.getQuestion().getId()) + 1;
        EssayAnswer improved = answerRepository.save(EssayAnswer.improved(base.getQuestion(), base.getUser(), request.content(), version));
        return toAnswerResponse(improved);
    }

    @Transactional
    public EssayAnswerResponse submitLock(Long userId, Long answerId, EssayAnswerRequest request) {
        EssayAnswer answer = getAnswer(userId, answerId);
        answer.submitLock(request.content());
        return toAnswerResponse(answer);
    }

    @Transactional(readOnly = true)
    public List<EssayAnswerResponse> findVersions(Long userId, Long answerId) {
        EssayAnswer answer = getAnswer(userId, answerId);
        return answerRepository.findByQuestionIdAndUserIdOrderByVersionDesc(answer.getQuestion().getId(), userId)
                .stream()
                .map(this::toAnswerResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ExperienceTagResponse> findTags(Long userId) {
        return tagRepository.findByUserIdOrderByNameAsc(userId).stream().map(ExperienceTagResponse::from).toList();
    }

    @Transactional
    public ExperienceTagResponse createTag(Long userId, ExperienceTagRequest request) {
        if (tagRepository.existsByUserIdAndName(userId, request.name().trim())) {
            throw new ConflictException("이미 존재하는 경험 태그입니다.");
        }
        ExperienceTag tag = tagRepository.save(ExperienceTag.create(getUser(userId), request.name(), request.description()));
        return ExperienceTagResponse.from(tag);
    }

    @Transactional
    public EssayAnswerResponse addTag(Long userId, Long answerId, EssayAnswerTagRequest request) {
        EssayAnswer answer = getAnswer(userId, answerId);
        ExperienceTag tag = tagRepository.findByIdAndUserId(request.tagId(), userId)
                .orElseThrow(() -> new NotFoundException("경험 태그를 찾을 수 없습니다."));
        if (!answerTagRepository.existsByAnswerIdAndTagId(answerId, tag.getId())) {
            answerTagRepository.save(EssayAnswerTag.create(answer, tag));
        }
        return toAnswerResponse(answer);
    }

    @Transactional
    public void removeTag(Long userId, Long answerId, Long tagId) {
        getAnswer(userId, answerId);
        tagRepository.findByIdAndUserId(tagId, userId)
                .orElseThrow(() -> new NotFoundException("경험 태그를 찾을 수 없습니다."));
        answerTagRepository.deleteByAnswerIdAndTagId(answerId, tagId);
    }

    private Application getApplication(Long userId, Long applicationId) {
        return applicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new NotFoundException("지원 건을 찾을 수 없습니다."));
    }

    private EssayQuestion getQuestion(Long userId, Long questionId) {
        return questionRepository.findByIdAndApplicationUserId(questionId, userId)
                .orElseThrow(() -> new NotFoundException("자소서 문항을 찾을 수 없습니다."));
    }

    private EssayAnswer getAnswer(Long userId, Long answerId) {
        return answerRepository.findByIdAndUserId(answerId, userId)
                .orElseThrow(() -> new NotFoundException("자소서 답변을 찾을 수 없습니다."));
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
    }

    private EssayAnswerResponse toAnswerResponse(EssayAnswer answer) {
        List<ExperienceTagResponse> tags = answerTagRepository.findByAnswerId(answer.getId())
                .stream()
                .map(answerTag -> ExperienceTagResponse.from(answerTag.getTag()))
                .toList();
        return EssayAnswerResponse.from(answer, tags);
    }
}
