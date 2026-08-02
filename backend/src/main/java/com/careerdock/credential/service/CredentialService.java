package com.careerdock.credential.service;

import com.careerdock.credential.domain.Credential;
import com.careerdock.credential.domain.CredentialAccessAudit;
import com.careerdock.credential.domain.CredentialType;
import com.careerdock.credential.dto.CredentialNumberResponse;
import com.careerdock.credential.dto.CredentialRequest;
import com.careerdock.credential.dto.CredentialResponse;
import com.careerdock.application.resource.repository.ApplicationCredentialRepository;
import com.careerdock.credential.repository.CredentialAccessAuditRepository;
import com.careerdock.credential.repository.CredentialRepository;
import com.careerdock.file.repository.FileAssetRepository;
import com.careerdock.global.exception.ConflictException;
import com.careerdock.global.exception.NotFoundException;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CredentialService {

    private final CredentialRepository credentialRepository;
    private final CredentialAccessAuditRepository auditRepository;
    private final CredentialNumberCipher cipher;
    private final UserRepository userRepository;
    private final FileAssetRepository fileAssetRepository;
    private final ApplicationCredentialRepository applicationCredentialRepository;

    public CredentialService(
            CredentialRepository credentialRepository,
            CredentialAccessAuditRepository auditRepository,
            CredentialNumberCipher cipher,
            UserRepository userRepository,
            FileAssetRepository fileAssetRepository,
            ApplicationCredentialRepository applicationCredentialRepository
    ) {
        this.credentialRepository = credentialRepository;
        this.auditRepository = auditRepository;
        this.cipher = cipher;
        this.userRepository = userRepository;
        this.fileAssetRepository = fileAssetRepository;
        this.applicationCredentialRepository = applicationCredentialRepository;
    }

    @Transactional(readOnly = true)
    public List<CredentialResponse> findAll(Long userId, CredentialType type, Integer expiringInDays) {
        LocalDate today = LocalDate.now();
        return credentialRepository.findByUserIdOrderByAcquiredAtDesc(userId).stream()
                .filter(credential -> type == null || credential.getCredentialType() == type)
                .filter(credential -> expiringInDays == null || isExpiringWithin(credential, today, expiringInDays))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CredentialResponse findOne(Long userId, Long credentialId) {
        return toResponse(getCredential(userId, credentialId));
    }

    @Transactional
    public CredentialResponse create(Long userId, CredentialRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
        Credential credential = Credential.create(
                user,
                request.credentialType(),
                request.name(),
                request.issuer(),
                request.acquiredAt(),
                cipher.encrypt(request.credentialNumber()),
                request.score(),
                request.grade(),
                request.validFrom(),
                request.expiresAt(),
                request.permanent(),
                request.description(),
                request.usageMemo(),
                request.studyMemo(),
                request.referenceUrl()
        );
        credential.linkFileAsset(verifiedFileAssetId(userId, request.fileAssetId()));
        return toResponse(credentialRepository.save(credential));
    }

    @Transactional
    public CredentialResponse update(Long userId, Long credentialId, CredentialRequest request) {
        Credential credential = getCredential(userId, credentialId);
        credential.update(
                request.credentialType(),
                request.name(),
                request.issuer(),
                request.acquiredAt(),
                request.score(),
                request.grade(),
                request.validFrom(),
                request.expiresAt(),
                request.permanent(),
                request.description(),
                request.usageMemo(),
                request.studyMemo(),
                request.referenceUrl()
        );
        credential.replaceCredentialNumber(cipher.encrypt(request.credentialNumber()));
        credential.linkFileAsset(verifiedFileAssetId(userId, request.fileAssetId()));
        return toResponse(credential);
    }

    /**
     * 지원 건에 연결된 자격은 지우지 않는다. 무엇을 제출했는지 나중에도 확인할 수 있어야 한다.
     * DB에도 같은 제약이 걸려 있지만, 사용자에게는 500이 아니라 409로 이유를 알려준다.
     */
    @Transactional
    public void delete(Long userId, Long credentialId) {
        Credential credential = getCredential(userId, credentialId);
        if (applicationCredentialRepository.existsByCredentialId(credentialId)) {
            throw new ConflictException("지원 건에 연결된 자격 정보입니다. 연결을 먼저 해제해주세요.");
        }
        credentialRepository.delete(credential);
    }

    /**
     * 자격번호 전체 조회. 본인 소유일 때만 복호화하고, 조회 사실을 감사 기록에 남긴다.
     */
    @Transactional
    public CredentialNumberResponse readNumber(Long userId, Long credentialId) {
        Credential credential = getCredential(userId, credentialId);
        String number = cipher.decrypt(credential.getCredentialNumberEncrypted());
        if (number == null) {
            throw new NotFoundException("등록된 자격번호가 없습니다.");
        }
        auditRepository.save(CredentialAccessAudit.numberViewed(credential.getId(), userId));
        return new CredentialNumberResponse(credential.getId(), number);
    }

    /** 남의 파일을 자기 자격에 붙이지 못하게 막는다. 남의 파일은 없는 것으로 답한다. */
    private Long verifiedFileAssetId(Long userId, Long fileAssetId) {
        if (fileAssetId == null) {
            return null;
        }
        if (!fileAssetRepository.existsByIdAndUserId(fileAssetId, userId)) {
            throw new NotFoundException("연결할 파일을 찾을 수 없습니다.");
        }
        return fileAssetId;
    }

    private boolean isExpiringWithin(Credential credential, LocalDate today, int days) {
        if (credential.isPermanent() || credential.getExpiresAt() == null) {
            return false;
        }
        return !credential.getExpiresAt().isAfter(today.plusDays(days));
    }

    private Credential getCredential(Long userId, Long credentialId) {
        // 남의 자격은 존재 자체를 알리지 않는다. 권한 없음 대신 404로 응답한다.
        return credentialRepository.findByIdAndUserId(credentialId, userId)
                .orElseThrow(() -> new NotFoundException("자격 정보를 찾을 수 없습니다."));
    }

    private CredentialResponse toResponse(Credential credential) {
        return CredentialResponse.from(credential, cipher.decrypt(credential.getCredentialNumberEncrypted()));
    }
}
