package com.careerdock.application.resource.domain;

import com.careerdock.application.domain.Application;
import com.careerdock.file.domain.FileAsset;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

/**
 * 지원 건에 연결한 파일. 연결을 지워도 {@link FileAsset} 원본은 그대로 남는다.
 *
 * 연결과 원본 삭제는 다른 동작이다. 이 엔티티가 지워지는 것은 "이 지원 건에서 뗀다"는
 * 뜻이고, 파일 자체를 지우려면 {@code DELETE /api/files/{id}}를 따로 불러야 한다.
 */
@Entity
@Table(
        name = "application_files",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_application_files_application_file",
                columnNames = {"application_id", "file_asset_id"}
        )
)
public class ApplicationFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "file_asset_id", nullable = false)
    private FileAsset fileAsset;

    /**
     * 연결 시점의 파일 버전을 기록해 둔다. 지금은 파일 버전 기능 자체가 없어 항상 1이고,
     * 이 값을 근거로 잠그거나 막는 로직도 없다. 버전 관리가 생겼을 때 "제출 당시 버전이
     * 무엇이었는지" 물음에 답하기 위한 자리다.
     */
    @Column(name = "locked_version", nullable = false)
    private int lockedVersion;

    @Column(length = 100)
    private String purpose;

    @Column(name = "linked_at", nullable = false, updatable = false)
    private Instant linkedAt;

    protected ApplicationFile() {
    }

    public static ApplicationFile create(Application application, FileAsset fileAsset, String purpose) {
        ApplicationFile link = new ApplicationFile();
        link.application = application;
        link.fileAsset = fileAsset;
        link.lockedVersion = fileAsset.getVersion();
        link.purpose = blankToNull(purpose);
        link.linkedAt = Instant.now();
        return link;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    public Long getId() { return id; }

    public Application getApplication() { return application; }

    public FileAsset getFileAsset() { return fileAsset; }

    public int getLockedVersion() { return lockedVersion; }

    public String getPurpose() { return purpose; }

    public Instant getLinkedAt() { return linkedAt; }
}
