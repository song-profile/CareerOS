package com.careerdock.file.storage;

import java.io.InputStream;
import org.springframework.core.io.Resource;

/**
 * 파일 본문 저장소. 지금은 로컬 디스크 구현 하나뿐이고, S3로 바꿀 때 이 인터페이스만 다시 구현한다.
 *
 * storageKey는 항상 서비스가 UUID로 만들어 넘긴다. 사용자 입력이 이 값으로 들어오면 안 된다.
 * 구현체는 스토리지 내부 경로를 밖으로 노출하지 않는다.
 */
public interface FileStorage {

    void store(String storageKey, InputStream content);

    /** 키에 해당하는 본문. 실제로 없으면 {@link StoredFileNotFoundException}. */
    Resource load(String storageKey);

    /** 없는 키를 지워도 예외를 내지 않는다. */
    void delete(String storageKey);
}
