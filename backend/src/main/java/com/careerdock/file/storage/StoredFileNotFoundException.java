package com.careerdock.file.storage;

import com.careerdock.global.exception.NotFoundException;

/**
 * DB에는 기록이 있는데 스토리지에 본문이 없는 상태.
 *
 * 저장 실패 보상이 중간에 끊겼거나 스토리지 볼륨이 갈아끼워진 경우에 발생한다.
 * 클라이언트 입장에서는 파일이 없는 것과 같으므로 404로 나간다. 메시지에 내부 경로를 담지 않는다.
 */
public class StoredFileNotFoundException extends NotFoundException {

    public StoredFileNotFoundException(String message) {
        super(message);
    }
}
