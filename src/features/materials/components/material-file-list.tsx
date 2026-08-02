"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toast } from "@/components/ui/toast";
import { MaterialFileTypeBadge } from "@/features/materials/components/material-file-type-badge";
import {
  filterMaterialFiles,
  formatFileSize,
  formatMaterialFileDate,
  MATERIAL_FILE_TYPE_FILTERS,
} from "@/features/materials/file-utils";
import type {
  MaterialFile,
  MaterialFileTypeFilter,
} from "@/features/materials/types";

export interface MaterialFileListProps {
  files: MaterialFile[];
}

export function MaterialFileList({ files }: MaterialFileListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<MaterialFileTypeFilter>("전체");
  const [previewFile, setPreviewFile] = useState<MaterialFile | null>(files[0] ?? null);
  const [notice, setNotice] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MaterialFile | null>(null);

  const visibleFiles = useMemo(
    () => filterMaterialFiles(files, searchQuery, typeFilter),
    [files, searchQuery, typeFilter],
  );

  function showNotice(message: string) {
    setNotice(message);
  }

  function handlePreview(file: MaterialFile) {
    setPreviewFile(file);
    showNotice("파일 미리보기는 API와 S3 연동 단계에서 제공됩니다.");
  }

  function handleDownload(file: MaterialFile) {
    setPreviewFile(file);
    showNotice("다운로드 API 연동 전입니다. 실제 파일은 내려받지 않습니다.");
  }

  function handleUpload() {
    showNotice("파일 업로드는 S3 연동 전입니다. 현재는 화면 placeholder만 제공합니다.");
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
                <Button className="w-full sm:w-fit" onClick={handleUpload}>
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
                  onDownload={handleDownload}
                  onPreview={handlePreview}
                />
                <MaterialFileMobileList
                  files={visibleFiles}
                  onDelete={setDeleteTarget}
                  onDownload={handleDownload}
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
        <Toast widthClassName="sm:w-[380px]">{notice}</Toast>
      ) : null}

      {deleteTarget ? (
        <MaterialFileDeleteDialog
          file={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeletePlaceholder={() => {
            showNotice("파일 삭제 API 연동 전입니다. 실제 파일은 삭제되지 않습니다.");
            setDeleteTarget(null);
          }}
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
                <p className="text-caption text-neutral-600">Preview Placeholder</p>
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
  onDeletePlaceholder,
}: {
  file: MaterialFile;
  onClose: () => void;
  onDeletePlaceholder: () => void;
}) {
  return (
    <Dialog
      description={
        <p className="break-words">
          {file.fileName} 삭제는 실제 파일 API와 S3 연동 후 처리됩니다. 현재 화면에서는 파일이 삭제되지 않습니다.
        </p>
      }
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button onClick={onClose} variant="secondary">
            닫기
          </Button>
          <Button onClick={onDeletePlaceholder} variant="danger">
            삭제 예정
          </Button>
        </div>
      }
      onClose={onClose}
      title="삭제 기능 준비 중"
    />
  );
}
