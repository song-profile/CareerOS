package com.careerdock.file.domain;

import com.careerdock.global.domain.BaseTimeEntity;
import com.careerdock.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "file_assets")
public class FileAsset extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private FileCategory category;

    @Column(name = "display_name", nullable = false, length = 150)
    private String displayName;

    /**
     * 스토리지 안에서의 위치. 서버가 UUID로 만들며 외부 입력이 이 값에 들어오면 안 된다.
     * 원본 파일명은 저장 경로에 절대 쓰지 않는다.
     */
    @Column(name = "storage_key", nullable = false, length = 200, updatable = false)
    private String storageKey;

    /** 다운로드할 때 돌려줄 이름. 표시용이며 저장 경로로는 쓰지 않는다. */
    @Column(name = "original_filename", nullable = false, length = 255)
    private String originalFilename;

    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    @Column(nullable = false)
    private long size;

    /** 버전 체인 자리. 이번 단계는 항상 1이며 버전 잠금은 범위 밖이다. */
    @Column(nullable = false)
    private int version;

    @Column(name = "parent_asset_id")
    private Long parentAssetId;

    protected FileAsset() {
    }

    public static FileAsset create(
            User user,
            FileCategory category,
            String displayName,
            String storageKey,
            String originalFilename,
            String mimeType,
            long size
    ) {
        FileAsset asset = new FileAsset();
        asset.user = user;
        asset.category = category;
        asset.displayName = displayName.trim();
        asset.storageKey = storageKey;
        asset.originalFilename = originalFilename;
        asset.mimeType = mimeType;
        asset.size = size;
        asset.version = 1;
        return asset;
    }

    public Long getId() { return id; }

    public User getUser() { return user; }

    public FileCategory getCategory() { return category; }

    public String getDisplayName() { return displayName; }

    public String getStorageKey() { return storageKey; }

    public String getOriginalFilename() { return originalFilename; }

    public String getMimeType() { return mimeType; }

    public long getSize() { return size; }

    public int getVersion() { return version; }

    public Long getParentAssetId() { return parentAssetId; }
}
