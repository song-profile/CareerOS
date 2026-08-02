package com.careerdock.file.storage;

import com.careerdock.global.exception.FileHandlingException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.InvalidPathException;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

/**
 * 로컬 디스크 구현. 운영에서는 FILE_STORAGE_PATH를 볼륨에 연결한다.
 *
 * 루트를 절대경로로 정규화해 두고, 키를 붙인 뒤 다시 정규화해 루트 밖으로 벗어나는지 확인한다.
 * 키는 서비스가 UUID로 만들지만 저장소가 스스로도 막아 두는 편이 안전하다.
 */
@Component
public class LocalFileStorage implements FileStorage {

    private final Path root;

    public LocalFileStorage(@Value("${app.file.storage-path}") String storagePath) {
        this.root = Path.of(storagePath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to prepare the file storage directory.");
        }
    }

    @Override
    public void store(String storageKey, InputStream content) {
        Path target = resolve(storageKey);
        try {
            Files.createDirectories(target.getParent());
            Files.copy(content, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new FileHandlingException("파일을 저장하지 못했습니다.");
        }
    }

    @Override
    public Resource load(String storageKey) {
        Path target = resolve(storageKey);
        if (!Files.isRegularFile(target)) {
            throw new StoredFileNotFoundException("저장된 파일 본문을 찾을 수 없습니다.");
        }
        return new PathResource(target);
    }

    @Override
    public void delete(String storageKey) {
        try {
            Files.deleteIfExists(resolve(storageKey));
        } catch (IOException exception) {
            throw new FileHandlingException("파일을 삭제하지 못했습니다.");
        }
    }

    /**
     * 키를 루트 아래 실제 경로로 바꾼다. `../`가 섞여 루트를 벗어나면 거부한다.
     * 예외 메시지에는 내부 경로를 넣지 않는다.
     */
    private Path resolve(String storageKey) {
        Path target;
        try {
            target = root.resolve(storageKey).normalize();
        } catch (InvalidPathException exception) {
            throw new FileHandlingException("잘못된 파일 키입니다.");
        }
        if (!target.startsWith(root)) {
            throw new FileHandlingException("잘못된 파일 키입니다.");
        }
        return target;
    }
}
