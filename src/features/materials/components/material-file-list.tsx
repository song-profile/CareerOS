"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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

interface MaterialFileListProps {
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
        <div
          className="fixed bottom-6 left-6 right-6 z-50 rounded-card border border-primary-100 bg-primary-50 px-4 py-3 text-body-medium text-primary-700 shadow-lg sm:left-auto sm:w-[380px]"
          role="status"
        >
          {notice}
        </div>
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
    <Card className="hidden overflow-hidden lg:block">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-caption text-neutral-600">
            <tr>
              <th className="px-4 py-3 font-medium">파일명</th>
              <th className="px-4 py-3 font-medium">파일유형</th>
              <th className="px-4 py-3 font-medium">업로드일</th>
              <th className="px-4 py-3 font-medium">파일크기</th>
              <th className="px-4 py-3 font-medium">사용중 여부</th>
              <th className="px-4 py-3 font-medium">다운로드</th>
              <th className="px-4 py-3 font-medium">더보기</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {files.map((file) => (
              <tr className="hover:bg-neutral-50" key={file.id}>
                <td className="max-w-xs break-words px-4 py-4 text-body-medium text-neutral-900">
                  {file.fileName}
                </td>
                <td className="px-4 py-4">
                  <MaterialFileTypeBadge type={file.type} />
                </td>
                <td className="px-4 py-4 font-mono text-mono text-neutral-600">
                  {formatMaterialFileDate(file.createdAt)}
                </td>
                <td className="px-4 py-4 font-mono text-mono text-neutral-600">
                  {formatFileSize(file.size)}
                </td>
                <td className="px-4 py-4">
                  <Badge variant={file.isUsed ? "success" : "neutral"}>
                    {file.isUsed ? "사용중" : "미사용"}
                  </Badge>
                </td>
                <td className="px-4 py-4">
                  <Button onClick={() => onDownload(file)} size="sm" variant="secondary">
                    다운로드
                  </Button>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => onPreview(file)} size="sm" variant="secondary">
                      미리보기
                    </Button>
                    <Button onClick={() => onDelete(file)} size="sm" variant="danger">
                      삭제
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
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
    <div
      aria-labelledby="material-file-delete-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-neutral-900/40 px-6"
      role="dialog"
    >
      <div className="grid w-full max-w-md gap-4 rounded-modal border border-neutral-200 bg-neutral-0 p-5 shadow-lg">
        <div className="grid gap-2">
          <h2 className="text-h2 text-neutral-900" id="material-file-delete-title">
            삭제 기능 준비 중
          </h2>
          <p className="break-words text-body text-neutral-600">
            {file.fileName} 삭제는 실제 파일 API와 S3 연동 후 처리됩니다. 현재 화면에서는
            파일이 삭제되지 않습니다.
          </p>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button onClick={onClose} variant="secondary">
            닫기
          </Button>
          <Button onClick={onDeletePlaceholder} variant="danger">
            삭제 예정
          </Button>
        </div>
      </div>
    </div>
  );
}
