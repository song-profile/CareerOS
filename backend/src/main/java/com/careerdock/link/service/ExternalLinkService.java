package com.careerdock.link.service;

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

    public ExternalLinkService(ExternalLinkRepository linkRepository, UserRepository userRepository) {
        this.linkRepository = linkRepository;
        this.userRepository = userRepository;
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

    @Transactional
    public void delete(Long userId, Long linkId) {
        linkRepository.delete(getLink(userId, linkId));
    }

    private ExternalLink getLink(Long userId, Long linkId) {
        return linkRepository.findByIdAndUserId(linkId, userId)
                .orElseThrow(() -> new NotFoundException("외부 링크를 찾을 수 없습니다."));
    }
}
