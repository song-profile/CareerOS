"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toast } from "@/components/ui/toast";
import {
  deleteFile,
  downloadFileBlob,
  uploadMaterialFile,
} from "@/features/materials/api/file-api";
import { MaterialFileTypeBadge } from "@/features/materials/components/material-file-type-badge";
import {
  filterMaterialFiles,
  formatFileSize,
  formatMaterialFileDate,
  MATERIAL_FILE_TYPE_FILTERS,
} from "@/features/materials/file-utils";
import type {
  MaterialFile,
  MaterialFileType,
  MaterialFileTypeFilter,
} from "@/features/materials/types";

export interface MaterialFileListProps {
  files: MaterialFile[];
}

export function MaterialFileList({ files }: MaterialFileListProps) {
  const [items, setItems] = useState<MaterialFile[]>(files);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<MaterialFileTypeFilter>("전체");
  const [previewFile, setPreviewFile] = useState<MaterialFile | null>(files[0] ?? null);
  const [notice, setNotice] = useState("");
  const [noticeTone, setNoticeTone] = useState<"success" | "error" | "info">("info");
  const [deleteTarget, setDeleteTarget] = useState<MaterialFile | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const visibleFiles = useMemo(
    () => filterMaterialFiles(items, searchQuery, typeFilter),
    [items, searchQuery, typeFilter],
  );

  function showNotice(message: string, tone: "success" | "error" | "info" = "info") {
    setNotice(message);
    setNoticeTone(tone);
  }

  function handlePreview(file: MaterialFile) {
    setPreviewFile(file);
    showNotice("다운로드 보안 정책상 브라우저 내 미리보기는 제공하지 않습니다.");
  }

  async function handleDownload(file: MaterialFile) {
    setPreviewFile(file);
    try {
      const blob = await downloadFileBlob(file.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = file.fileName;
      anchor.click();
      URL.revokeObjectURL(url);
      showNotice("파일 다운로드를 시작했습니다.", "success");
    } catch {
      showNotice("파일 다운로드에 실패했습니다.", "error");
    }
  }

  async function handleUpload(values: UploadFormValues): Promise<boolean> {
    try {
      const uploaded = await uploadMaterialFile(
        values.file,
        values.type,
        values.displayName,
      );
      setItems((current) => [uploaded, ...current]);
      setPreviewFile(uploaded);
      showNotice("파일을 업로드했습니다.", "success");
      return true;
    } catch {
      showNotice("파일 업로드에 실패했습니다.", "error");
      return false;
    }
  }

  async function handleDelete(file: MaterialFile) {
    try {
      await deleteFile(file.id);
      setItems((current) => current.filter((item) => item.id !== file.id));
      setPreviewFile((current) => current?.id === file.id ? null : current);
      setDeleteTarget(null);
      showNotice("파일을 삭제했습니다.", "success");
    } catch {
      setDeleteTarget(null);
      showNotice("파일 삭제에 실패했습니다.", "error");
    }
  }

  return (
    <>
      <div className="grid gap-6">
        <Card>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="grid gap-1">
                  <h2 className="text-h2 text-neutral-900">파일 보관함</h2>
                  <p className="text-body text-neutral-600">
                    지원서에 반복해서 첨부하는 파일을 유형별로 확인합니다.
                  </p>
                </div>
                <Button className="w-full sm:w-fit" onClick={() => setUploadDialogOpen(true)}>
                  파일 업로드
                </Button>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(240px,1fr)_220px] lg:items-start">
                <Input
                  helperText="파일명으로 검색합니다."
                  label="검색"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="파일명"
                  type="search"
                  value={searchQuery}
                />
                <Select
                  label="파일 유형"
                  onChange={(event) => setTypeFilter(event.target.value as MaterialFileTypeFilter)}
                  options={MATERIAL_FILE_TYPE_FILTERS.map((filter) => ({
                    label: filter,
                    value: filter,
                  }))}
                  value={typeFilter}
                />
              </div>

              <p className="text-caption text-neutral-600">
                총 {visibleFiles.length}개의 파일을 표시합니다.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid gap-4">
            {visibleFiles.length > 0 ? (
              <>
                <MaterialFileTable
                  files={visibleFiles}
                  onDelete={setDeleteTarget}
                  onDownload={(file) => void handleDownload(file)}
                  onPreview={handlePreview}
                />
                <MaterialFileMobileList
                  files={visibleFiles}
                  onDelete={setDeleteTarget}
                  onDownload={(file) => void handleDownload(file)}
                  onPreview={handlePreview}
                />
              </>
            ) : (
              <MaterialFileEmptyState />
            )}
          </div>

          <MaterialFilePreview file={previewFile} />
        </div>
      </div>

      {notice ? (
        <Toast tone={noticeTone} widthClassName="sm:w-[380px]">{notice}</Toast>
      ) : null}

      {uploadDialogOpen ? (
        <MaterialFileUploadDialog
          onClose={() => setUploadDialogOpen(false)}
          onUpload={handleUpload}
        />
      ) : null}

      {deleteTarget ? (
        <MaterialFileDeleteDialog
          file={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDelete={() => void handleDelete(deleteTarget)}
        />
      ) : null}
    </>
  );
}

interface MaterialFileActionProps {
  files: MaterialFile[];
  onDelete: (file: MaterialFile) => void;
  onDownload: (file: MaterialFile) => void;
  onPreview: (file: MaterialFile) => void;
}

function MaterialFileTable({
  files,
  onDelete,
  onDownload,
  onPreview,
}: MaterialFileActionProps) {
  return (
    <DataTable
      columns={[
        { key: "name", header: "파일명" },
        { key: "type", header: "파일유형" },
        { key: "createdAt", header: "업로드일" },
        { key: "size", header: "파일크기" },
        { key: "usage", header: "사용중 여부" },
        { key: "download", header: "다운로드" },
        { key: "actions", header: "더보기" },
      ]}
      getRowKey={(file) => file.id}
      items={files}
      renderCell={(file, columnKey) => {
        switch (columnKey) {
          case "name":
            return <span className="block max-w-xs break-words text-body-medium text-neutral-900">{file.fileName}</span>;
          case "type":
            return <MaterialFileTypeBadge type={file.type} />;
          case "createdAt":
            return <span className="font-mono text-mono text-neutral-600">{formatMaterialFileDate(file.createdAt)}</span>;
          case "size":
            return <span className="font-mono text-mono text-neutral-600">{formatFileSize(file.size)}</span>;
          case "usage":
            return <Badge variant={file.isUsed ? "success" : "neutral"}>{file.isUsed ? "사용중" : "미사용"}</Badge>;
          case "download":
            return (
              <Button onClick={() => onDownload(file)} size="sm" variant="secondary">
                다운로드
              </Button>
            );
          case "actions":
            return (
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => onPreview(file)} size="sm" variant="secondary">
                  미리보기
                </Button>
                <Button onClick={() => onDelete(file)} size="sm" variant="danger">
                  삭제
                </Button>
              </div>
            );
          default:
            return null;
        }
      }}
    />
  );
}

function MaterialFileMobileList({
  files,
  onDelete,
  onDownload,
  onPreview,
}: MaterialFileActionProps) {
  return (
    <div className="grid gap-3 lg:hidden">
      {files.map((file) => (
        <Card key={file.id}>
          <CardContent>
            <article className="grid gap-4">
              <div className="grid gap-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="break-words text-body-medium text-neutral-900">
                    {file.fileName}
                  </h3>
                  <MaterialFileTypeBadge type={file.type} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="font-mono text-mono text-neutral-600">
                    {formatMaterialFileDate(file.createdAt)}
                  </span>
                  <span className="font-mono text-mono text-neutral-600">
                    {formatFileSize(file.size)}
                  </span>
                  <Badge variant={file.isUsed ? "success" : "neutral"}>
                    {file.isUsed ? "사용중" : "미사용"}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <Button onClick={() => onDownload(file)} size="sm" variant="secondary">
                  다운로드
                </Button>
                <Button onClick={() => onPreview(file)} size="sm" variant="secondary">
                  미리보기
                </Button>
                <Button onClick={() => onDelete(file)} size="sm" variant="danger">
                  삭제
                </Button>
              </div>
            </article>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MaterialFilePreview({ file }: { file: MaterialFile | null }) {
  return (
    <Card className="xl:sticky xl:top-24">
      <CardContent>
        <aside className="grid gap-4" aria-label="파일 미리보기">
          <div className="grid gap-1">
            <h2 className="text-h3 text-neutral-900">파일 미리보기</h2>
            <p className="text-body text-neutral-600">
              실제 파일 미리보기는 S3 연동 단계에서 제공됩니다.
            </p>
          </div>

          <div className="grid min-h-48 place-items-center rounded-control border border-dashed border-neutral-200 bg-neutral-50 p-4 text-center">
            {file ? (
              <div className="grid gap-2">
                <MaterialFileTypeBadge type={file.type} />
                <p className="break-words text-body-medium text-neutral-900">{file.fileName}</p>
                <p className="font-mono text-mono text-neutral-600">
                  {formatFileSize(file.size)}
                </p>
                <p className="text-caption text-neutral-600">미리보기 미지원</p>
              </div>
            ) : (
              <p className="text-body text-neutral-600">미리볼 파일을 선택하세요.</p>
            )}
          </div>
        </aside>
      </CardContent>
    </Card>
  );
}

function MaterialFileEmptyState() {
  return (
    <Card>
      <CardContent>
        <div className="grid gap-2">
          <p className="text-body-medium text-neutral-900">조건에 맞는 파일이 없습니다.</p>
          <p className="text-body text-neutral-600">
            검색어 또는 파일 유형 필터를 조정해 보세요.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function MaterialFileDeleteDialog({
  file,
  onClose,
  onDelete,
}: {
  file: MaterialFile;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <Dialog
      description={
        <p className="break-words">
          {file.fileName} 파일을 삭제합니다. 지원 건에 연결된 파일이면 서버에서 거절될 수 있습니다.
        </p>
      }
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button onClick={onClose} variant="secondary">
            닫기
          </Button>
          <Button onClick={onDelete} variant="danger">
            삭제
          </Button>
        </div>
      }
      onClose={onClose}
      title="파일 삭제"
    />
  );
}

interface UploadFormValues {
  file: File;
  type: MaterialFileType;
  displayName?: string;
}

function MaterialFileUploadDialog({
  onClose,
  onUpload,
}: {
  onClose: () => void;
  onUpload: (values: UploadFormValues) => Promise<boolean>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<MaterialFileType>("기타");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setError("업로드할 파일을 선택해 주세요.");
      fileInputRef.current?.focus();
      return;
    }

    setSubmitting(true);
    const uploaded = await onUpload({
      file,
      type,
      displayName: displayName.trim() || undefined,
    });
    setSubmitting(false);

    if (uploaded) {
      onClose();
    }
  }

  return (
    <Dialog
      className="max-w-lg"
      description="파일과 분류를 선택해 보관함에 업로드합니다."
      onClose={onClose}
      title="파일 업로드"
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <Input
          ref={fileInputRef}
          errorMessage={error}
          label="파일"
          onChange={handleFileChange}
          required
          type="file"
        />
        <Select
          label="파일 유형"
          onChange={(event) => setType(event.target.value as MaterialFileType)}
          options={MATERIAL_FILE_TYPE_FILTERS.filter((filter) => filter !== "전체").map(
            (filter) => ({
              label: filter,
              value: filter,
            }),
          )}
          value={type}
        />
        <Input
          helperText="비워 두면 원본 파일명을 사용합니다."
          label="표시 이름"
          onChange={(event) => setDisplayName(event.target.value)}
          value={displayName}
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button disabled={submitting} onClick={onClose} type="button" variant="secondary">
            취소
          </Button>
          <Button loading={submitting} type="submit">
            업로드
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
