package com.careerdock.file.domain;

import java.util.Arrays;
import java.util.Locale;
import java.util.Optional;

/**
 * 업로드를 허용하는 형식. 차단 목록이 아니라 허용 목록이다.
 *
 * 차단 목록은 빠뜨린 확장자가 그대로 구멍이 된다. 허용 목록이면 실행파일(.exe, .sh),
 * HTML, SVG처럼 브라우저에서 스크립트가 실행될 수 있는 형식이 따로 적지 않아도 모두 막힌다.
 * SVG는 XML 안에 스크립트를 넣을 수 있어 이번 단계에서는 의도적으로 제외한다.
 *
 * 확장자와 MIME 타입이 둘 다 맞아야 통과한다. 다만 둘 다 클라이언트가 보내는 값이라
 * 위조할 수 있다. 내용 자체가 정말 그 형식인지는 검사하지 않는다(아래 한계 참고).
 */
public enum AllowedFileType {
    PDF("pdf", "application/pdf"),
    JPG("jpg", "image/jpeg"),
    JPEG("jpeg", "image/jpeg"),
    PNG("png", "image/png");

    private final String extension;
    private final String mimeType;

    AllowedFileType(String extension, String mimeType) {
        this.extension = extension;
        this.mimeType = mimeType;
    }

    public String getExtension() {
        return extension;
    }

    public String getMimeType() {
        return mimeType;
    }

    /** 확장자와 MIME 타입이 같은 형식을 가리킬 때만 값을 돌려준다. */
    public static Optional<AllowedFileType> resolve(String extension, String mimeType) {
        if (extension == null || mimeType == null) {
            return Optional.empty();
        }
        String normalizedExtension = extension.toLowerCase(Locale.ROOT);
        String normalizedMime = mimeType.toLowerCase(Locale.ROOT).trim();
        return Arrays.stream(values())
                .filter(type -> type.extension.equals(normalizedExtension))
                .filter(type -> type.mimeType.equals(normalizedMime))
                .findFirst();
    }

    public static String allowedExtensions() {
        return String.join(", ", Arrays.stream(values()).map(type -> type.extension).toList());
    }
}
