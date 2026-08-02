package com.careerdock.link.domain;

/**
 * 프론트의 ExternalLinkType(GitHub·Notion·Velog·Blog·Portfolio·LinkedIn·기타)을 모두 담고,
 * 기획서의 배포 서비스·프로젝트 저장소 구분을 추가한다.
 */
public enum LinkType {
    GITHUB,
    NOTION,
    BLOG,
    VELOG,
    PORTFOLIO,
    LINKEDIN,
    DEPLOYED_SERVICE,
    PROJECT_REPOSITORY,
    OTHER
}
