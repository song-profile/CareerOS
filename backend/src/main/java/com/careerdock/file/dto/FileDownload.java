package com.careerdock.file.dto;

import org.springframework.core.io.Resource;

/**
 * 다운로드 응답 재료. 컨트롤러가 엔티티를 직접 만지지 않도록 필요한 값만 담는다.
 */
public record FileDownload(Resource resource, String filename, String mimeType, long size) {
}
