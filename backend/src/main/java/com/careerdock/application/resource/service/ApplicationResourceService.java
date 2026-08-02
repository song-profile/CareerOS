package com.careerdock.application.resource.service;

import com.careerdock.application.domain.Application;
import com.careerdock.application.repository.ApplicationRepository;
import com.careerdock.application.resource.domain.ApplicationCredential;
import com.careerdock.application.resource.domain.ApplicationExternalLink;
import com.careerdock.application.resource.domain.ApplicationFile;
import com.careerdock.application.resource.dto.ApplicationCredentialResponse;
import com.careerdock.application.resource.dto.ApplicationExternalLinkResponse;
import com.careerdock.application.resource.dto.ApplicationFileResponse;
import com.careerdock.application.resource.dto.ApplicationResourcesResponse;
import com.careerdock.application.resource.dto.EssayQuestionSummaryResponse;
import com.careerdock.application.resource.dto.LinkCredentialRequest;
import com.careerdock.application.resource.dto.LinkExternalLinkRequest;
import com.careerdock.application.resource.dto.LinkFileRequest;
import com.careerdock.application.resource.repository.ApplicationCredentialRepository;
import com.careerdock.application.resource.repository.ApplicationExternalLinkRepository;
import com.careerdock.application.resource.repository.ApplicationFileRepository;
import com.careerdock.credential.domain.Credential;
import com.careerdock.credential.repository.CredentialRepository;
import com.careerdock.essay.domain.EssayAnswer;
import com.careerdock.essay.domain.EssayAnswerStatus;
import com.careerdock.essay.domain.EssayQuestion;
import com.careerdock.essay.repository.EssayAnswerRepository;
import com.careerdock.essay.repository.EssayQuestionRepository;
import com.careerdock.file.domain.FileAsset;
import com.careerdock.file.repository.FileAssetRepository;
import com.careerdock.global.exception.DuplicateResourceException;
import com.careerdock.global.exception.NotFoundException;
import com.careerdock.link.domain.ExternalLink;
import com.careerdock.link.repository.ExternalLinkRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 지원 건에 실제로 연결한 자료를 관리한다. 연결 해제는 이 서비스가 만든 연결 행만 지우고,
 * 파일·자격·외부 링크 원본은 각자의 서비스만 지울 수 있다.
 */
@Service
public class ApplicationResourceService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationFileRepository applicationFileRepository;
    private final ApplicationCredentialRepository applicationCredentialRepository;
    private final ApplicationExternalLinkRepository applicationExternalLinkRepository;
    private final FileAssetRepository fileAssetRepository;
    private final CredentialRepository credentialRepository;
    private final ExternalLinkRepository externalLinkRepository;
    private final EssayQuestionRepository essayQuestionRepository;
    private final EssayAnswerRepository essayAnswerRepository;

    public ApplicationResourceService(
            ApplicationRepository applicationRepository,
            ApplicationFileRepository applicationFileRepository,
            ApplicationCredentialRepository applicationCredentialRepository,
            ApplicationExternalLinkRepository applicationExternalLinkRepository,
            FileAssetRepository fileAssetRepository,
            CredentialRepository credentialRepository,
            ExternalLinkRepository externalLinkRepository,
            EssayQuestionRepository essayQuestionRepository,
            EssayAnswerRepository essayAnswerRepository
    ) {
        this.applicationRepository = applicationRepository;
        this.applicationFileRepository = applicationFileRepository;
        this.applicationCredentialRepository = applicationCredentialRepository;
        this.applicationExternalLinkRepository = applicationExternalLinkRepository;
        this.fileAssetRepository = fileAssetRepository;
        this.credentialRepository = credentialRepository;
        this.externalLinkRepository = externalLinkRepository;
        this.essayQuestionRepository = essayQuestionRepository;
        this.essayAnswerRepository = essayAnswerRepository;
    }

    @Transactional(readOnly = true)
    public ApplicationResourcesResponse findResources(Long userId, Long applicationId) {
        Long ownedApplicationId = getOwnedApplicationId(userId, applicationId);

        List<ApplicationFileResponse> files = applicationFileRepository
                .findByApplicationIdOrderByLinkedAtDesc(ownedApplicationId)
                .stream().map(ApplicationFileResponse::from).toList();
        List<ApplicationCredentialResponse> credentials = applicationCredentialRepository
                .findByApplicationIdOrderByLinkedAtDesc(ownedApplicationId)
                .stream().map(ApplicationCredentialResponse::from).toList();
        List<ApplicationExternalLinkResponse> externalLinks = applicationExternalLinkRepository
                .findByApplicationIdOrderByLinkedAtDesc(ownedApplicationId)
                .stream().map(ApplicationExternalLinkResponse::from).toList();
        List<EssayQuestionSummaryResponse> essayQuestions = essayQuestionRepository
                .findByApplicationIdOrderByQuestionOrderAsc(ownedApplicationId)
                .stream().map(question -> EssayQuestionSummaryResponse.from(question, findSubmittedAnswer(userId, question)))
                .toList();

        return new ApplicationResourcesResponse(ownedApplicationId, files, credentials, externalLinks, essayQuestions);
    }

    @Transactional
    public ApplicationFileResponse linkFile(Long userId, Long applicationId, LinkFileRequest request) {
        Application application = getOwnedApplication(userId, applicationId);
        FileAsset fileAsset = fileAssetRepository.findByIdAndUserId(request.fileAssetId(), userId)
                .orElseThrow(() -> new NotFoundException("연결할 파일을 찾을 수 없습니다."));
        if (applicationFileRepository.existsByApplicationIdAndFileAssetId(applicationId, fileAsset.getId())) {
            throw new DuplicateResourceException("이미 연결된 파일입니다.");
        }
        ApplicationFile link = applicationFileRepository.save(
                ApplicationFile.create(application, fileAsset, request.purpose()));
        return ApplicationFileResponse.from(link);
    }

    @Transactional
    public void unlinkFile(Long userId, Long applicationId, Long fileAssetId) {
        Long ownedApplicationId = getOwnedApplicationId(userId, applicationId);
        ApplicationFile link = applicationFileRepository
                .findByApplicationIdAndFileAssetId(ownedApplicationId, fileAssetId)
                .orElseThrow(() -> new NotFoundException("연결된 파일을 찾을 수 없습니다."));
        applicationFileRepository.delete(link);
    }

    @Transactional
    public ApplicationCredentialResponse linkCredential(Long userId, Long applicationId, LinkCredentialRequest request) {
        Application application = getOwnedApplication(userId, applicationId);
        Credential credential = credentialRepository.findByIdAndUserId(request.credentialId(), userId)
                .orElseThrow(() -> new NotFoundException("연결할 자격 정보를 찾을 수 없습니다."));
        if (applicationCredentialRepository.existsByApplicationIdAndCredentialId(applicationId, credential.getId())) {
            throw new DuplicateResourceException("이미 연결된 자격 정보입니다.");
        }
        ApplicationCredential link = applicationCredentialRepository.save(
                ApplicationCredential.create(application, credential, request.purpose()));
        return ApplicationCredentialResponse.from(link);
    }

    @Transactional
    public void unlinkCredential(Long userId, Long applicationId, Long credentialId) {
        Long ownedApplicationId = getOwnedApplicationId(userId, applicationId);
        ApplicationCredential link = applicationCredentialRepository
                .findByApplicationIdAndCredentialId(ownedApplicationId, credentialId)
                .orElseThrow(() -> new NotFoundException("연결된 자격 정보를 찾을 수 없습니다."));
        applicationCredentialRepository.delete(link);
    }

    @Transactional
    public ApplicationExternalLinkResponse linkExternalLink(Long userId, Long applicationId, LinkExternalLinkRequest request) {
        Application application = getOwnedApplication(userId, applicationId);
        ExternalLink externalLink = externalLinkRepository.findByIdAndUserId(request.externalLinkId(), userId)
                .orElseThrow(() -> new NotFoundException("연결할 외부 링크를 찾을 수 없습니다."));
        if (applicationExternalLinkRepository.existsByApplicationIdAndExternalLinkId(applicationId, externalLink.getId())) {
            throw new DuplicateResourceException("이미 연결된 외부 링크입니다.");
        }
        ApplicationExternalLink link = applicationExternalLinkRepository.save(
                ApplicationExternalLink.create(application, externalLink, request.purpose()));
        return ApplicationExternalLinkResponse.from(link);
    }

    @Transactional
    public void unlinkExternalLink(Long userId, Long applicationId, Long externalLinkId) {
        Long ownedApplicationId = getOwnedApplicationId(userId, applicationId);
        ApplicationExternalLink link = applicationExternalLinkRepository
                .findByApplicationIdAndExternalLinkId(ownedApplicationId, externalLinkId)
                .orElseThrow(() -> new NotFoundException("연결된 외부 링크를 찾을 수 없습니다."));
        applicationExternalLinkRepository.delete(link);
    }

    /** 제출본은 문항당 최대 하나만 "현재 제출본"으로 취급한다. 버전 내림차순 중 처음 만난 SUBMITTED. */
    private EssayAnswer findSubmittedAnswer(Long userId, EssayQuestion question) {
        return essayAnswerRepository.findByQuestionIdAndUserIdOrderByVersionDesc(question.getId(), userId)
                .stream()
                .filter(answer -> answer.getStatus() == EssayAnswerStatus.SUBMITTED)
                .findFirst()
                .orElse(null);
    }

    private Application getOwnedApplication(Long userId, Long applicationId) {
        // 남의 지원 건은 존재 자체를 알리지 않는다. 권한 없음 대신 404로 응답한다.
        return applicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new NotFoundException("지원 건을 찾을 수 없습니다."));
    }

    private Long getOwnedApplicationId(Long userId, Long applicationId) {
        return getOwnedApplication(userId, applicationId).getId();
    }
}
