package com.careerdock.file.controller;

import com.careerdock.file.domain.FileCategory;
import com.careerdock.file.dto.FileAssetResponse;
import com.careerdock.file.dto.FileDownload;
import com.careerdock.file.service.FileService;
import com.careerdock.global.auth.CurrentUserAccessor;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;
    private final CurrentUserAccessor currentUserAccessor;

    public FileController(FileService fileService, CurrentUserAccessor currentUserAccessor) {
        this.fileService = fileService;
        this.currentUserAccessor = currentUserAccessor;
    }

    @GetMapping
    public List<FileAssetResponse> findAll(@RequestParam(required = false) FileCategory category) {
        return fileService.findAll(currentUserAccessor.getCurrentUserId(), category);
    }

    /** multipart/form-data. 파트가 빠진 경우도 서비스에서 400으로 답한다. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FileAssetResponse upload(
            @RequestParam(name = "file", required = false) MultipartFile file,
            @RequestParam FileCategory category,
            @RequestParam(required = false) String displayName
    ) {
        return fileService.upload(currentUserAccessor.getCurrentUserId(), category, displayName, file);
    }

    @GetMapping("/{id}")
    public FileAssetResponse findOne(@PathVariable Long id) {
        return fileService.findOne(currentUserAccessor.getCurrentUserId(), id);
    }

    /**
     * 언제나 attachment로 내려보낸다. 업로드한 사람이 만든 내용을 같은 출처에서 열어주지 않는다.
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        FileDownload download = fileService.download(currentUserAccessor.getCurrentUserId(), id);
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(download.filename(), StandardCharsets.UTF_8)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(MediaType.parseMediaType(download.mimeType()))
                .contentLength(download.size())
                .body(download.resource());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        fileService.delete(currentUserAccessor.getCurrentUserId(), id);
    }
}
