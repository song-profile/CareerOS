import type {
  MaterialFile,
  MaterialFileType,
  MaterialFileTypeFilter,
} from "@/features/materials/types";

export const MATERIAL_FILE_TYPES: MaterialFileType[] = [
  "증명사진",
  "포트폴리오",
  "성적증명서",
  "졸업증명서",
  "자격증",
  "기타",
];

export const MATERIAL_FILE_TYPE_FILTERS: MaterialFileTypeFilter[] = [
  "전체",
  ...MATERIAL_FILE_TYPES,
];

/** 백엔드 MAX_UPLOAD_SIZE 기본값(10MB)과 맞춘다. 서버 왕복 없이 미리 막는다. */
export const MATERIAL_FILE_MAX_SIZE_BYTES = 10 * 1024 * 1024;

export function formatMaterialFileDate(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  }

  const kilobytes = size / 1024;

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`;
  }

  return `${(kilobytes / 1024).toFixed(1)} MB`;
}

export function filterMaterialFiles(
  files: MaterialFile[],
  searchQuery: string,
  typeFilter: MaterialFileTypeFilter,
): MaterialFile[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return files.filter((file) => {
    const matchesQuery =
      !normalizedQuery || file.fileName.toLowerCase().includes(normalizedQuery);
    const matchesType = typeFilter === "전체" || file.type === typeFilter;

    return matchesQuery && matchesType;
  });
}
