package com.careerdock.credential.service;

import com.careerdock.credential.domain.Credential;
import com.careerdock.credential.domain.CredentialAccessAudit;
import com.careerdock.credential.domain.CredentialType;
import com.careerdock.credential.dto.CredentialNumberResponse;
import com.careerdock.credential.dto.CredentialRequest;
import com.careerdock.credential.dto.CredentialResponse;
import com.careerdock.credential.repository.CredentialAccessAuditRepository;
import com.careerdock.credential.repository.CredentialRepository;
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

    public CredentialService(
            CredentialRepository credentialRepository,
            CredentialAccessAuditRepository auditRepository,
            CredentialNumberCipher cipher,
            UserRepository userRepository
    ) {
        this.credentialRepository = credentialRepository;
        this.auditRepository = auditRepository;
        this.cipher = cipher;
        this.userRepository = userRepository;
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
        return toResponse(credential);
    }

    @Transactional
    public void delete(Long userId, Long credentialId) {
        credentialRepository.delete(getCredential(userId, credentialId));
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
