package com.careerdock.link.domain;

/**
 * 링크 공개 범위. 기본은 비공개이며, 지원서에 첨부할 링크만 사용자가 공개로 바꾼다.
 */
public enum LinkVisibility {
    PRIVATE,
    PUBLIC
}
