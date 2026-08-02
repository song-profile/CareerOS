package com.careerdock.credential.domain;

/**
 * 프론트의 CredentialType(자격증·어학·수상·교육·기타)과 1:1로 대응한다.
 */
public enum CredentialType {
    CERTIFICATION,
    LANGUAGE,
    AWARD,
    EDUCATION_DOCUMENT,
    OTHER
}
