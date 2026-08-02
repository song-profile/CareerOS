package com.careerdock.link.service;

import com.careerdock.application.resource.repository.ApplicationExternalLinkRepository;
import com.careerdock.global.exception.ConflictException;
import com.careerdock.global.exception.NotFoundException;
import com.careerdock.link.domain.ExternalLink;
import com.careerdock.link.dto.ExternalLinkRequest;
import com.careerdock.link.dto.ExternalLinkResponse;
import com.careerdock.link.repository.ExternalLinkRepository;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExternalLinkService {

    private final ExternalLinkRepository linkRepository;
    private final UserRepository userRepository;
    private final ApplicationExternalLinkRepository applicationExternalLinkRepository;

    public ExternalLinkService(
            ExternalLinkRepository linkRepository,
            UserRepository userRepository,
            ApplicationExternalLinkRepository applicationExternalLinkRepository
    ) {
        this.linkRepository = linkRepository;
        this.userRepository = userRepository;
        this.applicationExternalLinkRepository = applicationExternalLinkRepository;
    }

    @Transactional(readOnly = true)
    public List<ExternalLinkResponse> findAll(Long userId) {
        return linkRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(ExternalLinkResponse::from)
                .toList();
    }

    @Transactional
    public ExternalLinkResponse create(Long userId, ExternalLinkRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
        ExternalLink link = ExternalLink.create(
                user,
                request.linkType(),
                request.displayName(),
                request.url(),
                request.description(),
                request.visibility(),
                request.projectName()
        );
        return ExternalLinkResponse.from(linkRepository.save(link));
    }

    @Transactional
    public ExternalLinkResponse update(Long userId, Long linkId, ExternalLinkRequest request) {
        ExternalLink link = getLink(userId, linkId);
        link.update(
                request.linkType(),
                request.displayName(),
                request.url(),
                request.description(),
                request.visibility(),
                request.projectName()
        );
        return ExternalLinkResponse.from(link);
    }

    /**
     * 지원 건에 연결된 외부 링크는 지우지 않는다. 무엇을 제출했는지 나중에도 확인할 수 있어야 한다.
     * DB에도 같은 제약이 걸려 있지만, 사용자에게는 500이 아니라 409로 이유를 알려준다.
     */
    @Transactional
    public void delete(Long userId, Long linkId) {
        ExternalLink link = getLink(userId, linkId);
        if (applicationExternalLinkRepository.existsByExternalLinkId(linkId)) {
            throw new ConflictException("지원 건에 연결된 외부 링크입니다. 연결을 먼저 해제해주세요.");
        }
        linkRepository.delete(link);
    }

    private ExternalLink getLink(Long userId, Long linkId) {
        return linkRepository.findByIdAndUserId(linkId, userId)
                .orElseThrow(() -> new NotFoundException("외부 링크를 찾을 수 없습니다."));
    }
}
