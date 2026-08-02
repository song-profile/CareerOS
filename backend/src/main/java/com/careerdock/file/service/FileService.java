package com.careerdock.file.service;

import com.careerdock.credential.repository.CredentialRepository;
import com.careerdock.file.domain.AllowedFileType;
import com.careerdock.file.domain.FileAsset;
import com.careerdock.file.domain.FileCategory;
import com.careerdock.file.dto.FileAssetResponse;
import com.careerdock.file.dto.FileDownload;
import com.careerdock.file.repository.FileAssetRepository;
import com.careerdock.file.storage.FileStorage;
import com.careerdock.global.exception.BadRequestException;
import com.careerdock.global.exception.ConflictException;
import com.careerdock.global.exception.FileHandlingException;
import com.careerdock.global.exception.NotFoundException;
import com.careerdock.user.domain.User;
import com.careerdock.user.repository.UserRepository;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileService {

    private static final int MAX_DISPLAY_NAME_LENGTH = 150;
    private static final int MAX_ORIGINAL_FILENAME_LENGTH = 255;

    private final FileAssetRepository fileAssetRepository;
    private final CredentialRepository credentialRepository;
    private final UserRepository userRepository;
    private final FileStorage storage;

    public FileService(
            FileAssetRepository fileAssetRepository,
            CredentialRepository credentialRepository,
            UserRepository userRepository,
            FileStorage storage
    ) {
        this.fileAssetRepository = fileAssetRepository;
        this.credentialRepository = credentialRepository;
        this.userRepository = userRepository;
        this.storage = storage;
    }

    @Transactional(readOnly = true)
    public List<FileAssetResponse> findAll(Long userId, FileCategory category) {
        List<FileAsset> assets = category == null
                ? fileAssetRepository.findByUserIdOrderByCreatedAtDesc(userId)
                : fileAssetRepository.findByUserIdAndCategoryOrderByCreatedAtDesc(userId, category);
        return assets.stream().map(FileAssetResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public FileAssetResponse findOne(Long userId, Long fileId) {
        return FileAssetResponse.from(getAsset(userId, fileId));
    }

    /**
     * 본문을 먼저 저장하고 기록을 남긴다. 기록에 실패하면 방금 쓴 본문을 지워 고아 파일을 남기지 않는다.
     *
     * 순서를 뒤집으면 롤백된 기록의 본문이 그대로 남는다. 다만 커밋 자체가 실패하는 드문 경우까지는
     * 막지 못한다.
     */
    // ponytail: 커밋 실패 시 남는 고아 본문은 방치한다. 실제로 쌓이면 storage_key 대조 청소 배치를 붙인다.
    @Transactional
    public FileAssetResponse upload(Long userId, FileCategory category, String displayName, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
        if (file == null || file.isEmpty()) {
            throw new FileHandlingException("업로드할 파일이 없습니다.");
        }

        String originalFilename = sanitizeFilename(file.getOriginalFilename());
        AllowedFileType type = AllowedFileType.resolve(extensionOf(originalFilename), file.getContentType())
                .orElseThrow(() -> new FileHandlingException(
                        "허용하지 않는 파일 형식입니다. 가능한 형식: " + AllowedFileType.allowedExtensions()));

        // 저장 경로에는 사용자 입력이 한 조각도 들어가지 않는다.
        String storageKey = userId + "/" + UUID.randomUUID() + "." + type.getExtension();
        try (InputStream content = file.getInputStream()) {
            storage.store(storageKey, content);
        } catch (IOException exception) {
            throw new FileHandlingException("파일을 읽지 못했습니다.");
        }

        try {
            FileAsset asset = FileAsset.create(
                    user,
                    category,
                    resolveDisplayName(displayName, originalFilename),
                    storageKey,
                    originalFilename,
                    type.getMimeType(),
                    file.getSize()
            );
            return FileAssetResponse.from(fileAssetRepository.saveAndFlush(asset));
        } catch (RuntimeException exception) {
            storage.delete(storageKey);
            throw exception;
        }
    }

    @Transactional(readOnly = true)
    public FileDownload download(Long userId, Long fileId) {
        FileAsset asset = getAsset(userId, fileId);
        return new FileDownload(
                storage.load(asset.getStorageKey()),
                asset.getOriginalFilename(),
                asset.getMimeType(),
                asset.getSize()
        );
    }

    /**
     * 어딘가 연결된 파일은 지우지 않는다. 자격 증빙이 조용히 사라지면 나중에 무엇을 제출했는지 확인할 수 없다.
     * DB에도 같은 제약이 걸려 있지만, 사용자에게는 500이 아니라 409로 이유를 알려준다.
     */
    @Transactional
    public void delete(Long userId, Long fileId) {
        FileAsset asset = getAsset(userId, fileId);
        if (credentialRepository.existsByFileAssetId(fileId)) {
            throw new ConflictException("자격 정보에 연결된 파일입니다. 연결을 먼저 해제해주세요.");
        }
        fileAssetRepository.delete(asset);
        fileAssetRepository.flush();
        storage.delete(asset.getStorageKey());
    }

    private FileAsset getAsset(Long userId, Long fileId) {
        // 남의 파일은 존재 자체를 알리지 않는다. 권한 없음 대신 404로 응답한다.
        return fileAssetRepository.findByIdAndUserId(fileId, userId)
                .orElseThrow(() -> new NotFoundException("파일을 찾을 수 없습니다."));
    }

    /** 경로 조각을 떼고 파일명만 남긴다. `../../etc/passwd`는 `passwd`가 된다. */
    private String sanitizeFilename(String rawFilename) {
        String filename = rawFilename == null ? "" : StringUtils.getFilename(StringUtils.cleanPath(rawFilename));
        if (filename == null || filename.isBlank()) {
            throw new FileHandlingException("파일 이름이 없습니다.");
        }
        if (filename.length() > MAX_ORIGINAL_FILENAME_LENGTH) {
            throw new FileHandlingException("파일 이름이 너무 깁니다.");
        }
        return filename;
    }

    private String extensionOf(String filename) {
        int lastDot = filename.lastIndexOf('.');
        return lastDot < 0 ? "" : filename.substring(lastDot + 1);
    }

    private String resolveDisplayName(String displayName, String originalFilename) {
        if (displayName == null || displayName.isBlank()) {
            return originalFilename.length() > MAX_DISPLAY_NAME_LENGTH
                    ? originalFilename.substring(0, MAX_DISPLAY_NAME_LENGTH)
                    : originalFilename;
        }
        String trimmed = displayName.trim();
        if (trimmed.length() > MAX_DISPLAY_NAME_LENGTH) {
            throw new BadRequestException("표시 이름은 " + MAX_DISPLAY_NAME_LENGTH + "자 이하여야 합니다.");
        }
        return trimmed;
    }
}
