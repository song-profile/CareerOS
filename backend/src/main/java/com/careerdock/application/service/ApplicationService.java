package com.careerdock.application.service;

import com.careerdock.application.domain.Application;
import com.careerdock.application.domain.ApplicationStatus;
import com.careerdock.application.domain.ApplicationStatusHistory;
import com.careerdock.application.dto.ApplicationCreateRequest;
import com.careerdock.application.dto.ApplicationResponse;
import com.careerdock.application.dto.ApplicationSearchCondition;
import com.careerdock.application.dto.ApplicationStatusHistoryResponse;
import com.careerdock.application.dto.ApplicationUpdateRequest;
import com.careerdock.application.repository.ApplicationRepository;
import com.careerdock.application.repository.ApplicationStatusHistoryRepository;
import com.careerdock.company.domain.Company;
import com.careerdock.company.repository.CompanyRepository;
import com.careerdock.global.exception.NotFoundException;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public ApplicationService(
            ApplicationRepository applicationRepository,
            ApplicationStatusHistoryRepository statusHistoryRepository,
            CompanyRepository companyRepository,
            UserRepository userRepository
    ) {
        this.applicationRepository = applicationRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ApplicationResponse create(Long userId, ApplicationCreateRequest request) {
        User user = getUser(userId);
        Company company = getOrCreateCompany(user, request.companyName(), request.companyHomepageUrl(), request.companyMemo());
        Application application = Application.create(
                user,
                company,
                request.positionName(),
                request.recruitmentTitle(),
                request.recruitmentYear(),
                request.season(),
                request.postingUrl(),
                request.applicationStartAt(),
                request.deadlineAt(),
                request.status(),
                request.workLocation(),
                request.applicationSiteUrl(),
                request.memo()
        );
        return toResponse(applicationRepository.save(application));
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> findAll(Long userId, ApplicationSearchCondition condition) {
        return applicationRepository.findAll(ApplicationSpecifications.byCondition(userId, condition))
                .stream()
                .sorted(deadlineAscNullLast())
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ApplicationResponse findOne(Long userId, Long applicationId) {
        return toResponse(getApplication(userId, applicationId));
    }

    @Transactional
    public ApplicationResponse update(Long userId, Long applicationId, ApplicationUpdateRequest request) {
        Application application = getApplication(userId, applicationId);
        Company company = getOrCreateCompany(
                application.getUser(),
                request.companyName(),
                request.companyHomepageUrl(),
                request.companyMemo()
        );
        application.update(
                company,
                request.positionName(),
                request.recruitmentTitle(),
                request.recruitmentYear(),
                request.season(),
                request.postingUrl(),
                request.applicationStartAt(),
                request.deadlineAt(),
                request.workLocation(),
                request.applicationSiteUrl(),
                request.memo()
        );
        return toResponse(application);
    }

    @Transactional
    public ApplicationResponse changeStatus(Long userId, Long applicationId, ApplicationStatus newStatus) {
        Application application = getApplication(userId, applicationId);
        ApplicationStatus previousStatus = application.changeStatus(newStatus);
        if (previousStatus != newStatus) {
            statusHistoryRepository.save(ApplicationStatusHistory.create(application, previousStatus, newStatus));
        }
        return toResponse(application);
    }

    @Transactional
    public void delete(Long userId, Long applicationId) {
        Application application = getApplication(userId, applicationId);
        applicationRepository.delete(application);
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
    }

    private Application getApplication(Long userId, Long applicationId) {
        return applicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new NotFoundException("지원 건을 찾을 수 없습니다."));
    }

    private Company getOrCreateCompany(User user, String name, String homepageUrl, String memo) {
        String normalizedName = name.trim();
        return companyRepository.findByUserIdAndName(user.getId(), normalizedName)
                .map(company -> {
                    company.updateOptionalInfo(homepageUrl, memo);
                    return company;
                })
                .orElseGet(() -> companyRepository.save(Company.create(user, normalizedName, homepageUrl, memo)));
    }

    private ApplicationResponse toResponse(Application application) {
        List<ApplicationStatusHistoryResponse> histories = statusHistoryRepository
                .findByApplicationIdOrderByChangedAtAsc(application.getId())
                .stream()
                .map(ApplicationStatusHistoryResponse::from)
                .toList();
        return ApplicationResponse.from(application, histories);
    }

    private Comparator<Application> deadlineAscNullLast() {
        return Comparator
                .comparing(Application::getDeadlineAt, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(application -> application.getCompany().getName())
                .thenComparing(Application::getPositionName);
    }
}
