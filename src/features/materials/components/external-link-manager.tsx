"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { copyToClipboard } from "@/components/ui/copy-field";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Toast } from "@/components/ui/toast";
import {
  createExternalLink,
  deleteExternalLink,
  updateExternalLink,
} from "@/features/materials/api/external-link-api";
import { ExternalLinkTypeBadge } from "@/features/materials/components/external-link-type-badge";
import {
  EXTERNAL_LINK_TYPES,
  filterExternalLinks,
  formatExternalLinkDate,
  hasExternalLinkErrors,
  validateExternalLinkForm,
} from "@/features/materials/link-utils";
import type {
  ExternalLink,
  ExternalLinkFormErrors,
  ExternalLinkFormValues,
  ExternalLinkType,
} from "@/features/materials/types";
import { EXTERNAL_LINK_DESCRIPTION_MAX_LENGTH } from "@/features/materials/types";

export interface ExternalLinkManagerProps {
  links: ExternalLink[];
}

type DialogMode = "create" | "edit";

const emptyFormValues: ExternalLinkFormValues = {
  type: "GitHub",
  title: "",
  url: "",
  description: "",
};

export function ExternalLinkManager({ links }: ExternalLinkManagerProps) {
  const [items, setItems] = useState<ExternalLink[]>(links);
  const [searchQuery, setSearchQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeTone, setNoticeTone] = useState<"success" | "error" | "info">("info");
  const [copyId, setCopyId] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<{
    mode: DialogMode;
    link: ExternalLink | null;
  } | null>(null);

  const visibleLinks = useMemo(
    () => filterExternalLinks(items, searchQuery),
    [items, searchQuery],
  );

  function showNotice(message: string, tone: "success" | "error" | "info" = "info") {
    setNotice(message);
    setNoticeTone(tone);
  }

  function openCreateDialog() {
    setDialogState({ mode: "create", link: null });
  }

  function openEditDialog(link: ExternalLink) {
    setDialogState({ mode: "edit", link });
  }

  async function handleCopy(link: ExternalLink) {
    const succeeded = await copyToClipboard(link.url);
    setCopyId(link.id);
    showNotice(
      succeeded ? "링크를 복사했습니다." : "클립보드 복사에 실패했습니다.",
      succeeded ? "success" : "error",
    );
    window.setTimeout(() => setCopyId(null), 2000);
  }

  async function handleDelete(link: ExternalLink) {
    try {
      await deleteExternalLink(link.id);
      setItems((current) => current.filter((item) => item.id !== link.id));
      showNotice(`${link.title} 링크를 삭제했습니다.`, "success");
    } catch {
      showNotice("링크 삭제에 실패했습니다.", "error");
    }
  }

  async function handleSave(
    values: ExternalLinkFormValues,
    editingLink: ExternalLink | null,
  ): Promise<boolean> {
    try {
      if (editingLink) {
        const updated = await updateExternalLink(editingLink.id, values);
        setItems((current) =>
          current.map((link) =>
            link.id === editingLink.id ? updated : link,
          ),
        );
        showNotice("링크를 수정했습니다.", "success");
        return true;
      }

      const created = await createExternalLink(values);
      setItems((current) => [created, ...current]);
      showNotice("링크를 등록했습니다.", "success");
      return true;
    } catch {
      showNotice(
        editingLink ? "링크 수정에 실패했습니다." : "링크 등록에 실패했습니다.",
        "error",
      );
      return false;
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
                  <h2 className="text-h2 text-neutral-900">외부 링크</h2>
                  <p className="text-body text-neutral-600">
                    지원서에 자주 넣는 공개 프로필과 포트폴리오 URL을 관리합니다.
                  </p>
                </div>
                <Button className="w-full sm:w-fit" onClick={openCreateDialog}>
                  새 링크 등록
                </Button>
              </div>

              <Input
                helperText="제목, URL, 설명, 유형으로 검색합니다."
                label="검색"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="GitHub, 포트폴리오, 블로그"
                type="search"
                value={searchQuery}
              />

              <p className="text-caption text-neutral-600">
                총 {visibleLinks.length}개의 링크를 표시합니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {visibleLinks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleLinks.map((link) => (
              <ExternalLinkCard
                copied={copyId === link.id}
                key={link.id}
                link={link}
                onCopy={handleCopy}
                onDelete={(target) => void handleDelete(target)}
                onEdit={openEditDialog}
              />
            ))}
          </div>
        ) : (
          <ExternalLinkEmptyState />
        )}
      </div>

      {notice ? (
        <Toast tone={noticeTone} widthClassName="sm:w-[400px]">{notice}</Toast>
      ) : null}

      {dialogState ? (
        <ExternalLinkDialog
          link={dialogState.link}
          mode={dialogState.mode}
          onClose={() => setDialogState(null)}
          onSave={handleSave}
        />
      ) : null}
    </>
  );
}

interface ExternalLinkCardProps {
  copied: boolean;
  link: ExternalLink;
  onCopy: (link: ExternalLink) => void;
  onDelete: (link: ExternalLink) => void;
  onEdit: (link: ExternalLink) => void;
}

function ExternalLinkCard({
  copied,
  link,
  onCopy,
  onDelete,
  onEdit,
}: ExternalLinkCardProps) {
  return (
    <Card>
      <CardContent>
        <article className="flex h-full flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span
                aria-hidden="true"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-primary-50 text-caption font-semibold text-primary-700"
              >
                {getLinkIconText(link.type)}
              </span>
              <div className="grid min-w-0 gap-1">
                <h3 className="break-words text-body-medium text-neutral-900">{link.title}</h3>
                <p className="break-all font-mono text-mono text-neutral-600">{link.url}</p>
              </div>
            </div>
            <ExternalLinkTypeBadge type={link.type} />
          </div>

          <p className="min-h-10 break-words text-body text-neutral-600">
            {link.description || "설명이 없습니다."}
          </p>

          <div className="mt-auto grid gap-3">
            <p className="font-mono text-mono text-neutral-600">
              등록 {formatExternalLinkDate(link.createdAt)}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button onClick={() => void onCopy(link)} size="sm" variant="secondary">
                {copied ? "복사됨" : "복사"}
              </Button>
              <LinkButton
                href={link.url}
                rel="noreferrer"
                size="sm"
                target="_blank"
                variant="secondary"
              >
                새창 열기
              </LinkButton>
              <Button onClick={() => onEdit(link)} size="sm" variant="secondary">
                수정
              </Button>
              <Button onClick={() => onDelete(link)} size="sm" variant="danger">
                삭제
              </Button>
            </div>
          </div>
        </article>
      </CardContent>
    </Card>
  );
}

function ExternalLinkDialog({
  link,
  mode,
  onClose,
  onSave,
}: {
  link: ExternalLink | null;
  mode: DialogMode;
  onClose: () => void;
  onSave: (values: ExternalLinkFormValues, editingLink: ExternalLink | null) => Promise<boolean>;
}) {
  const [values, setValues] = useState<ExternalLinkFormValues>(
    link
      ? {
          type: link.type,
          title: link.title,
          url: link.url,
          description: link.description,
        }
      : emptyFormValues,
  );
  const [errors, setErrors] = useState<ExternalLinkFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function updateField<TKey extends keyof ExternalLinkFormValues>(
    key: TKey,
    value: ExternalLinkFormValues[TKey],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateExternalLinkForm(values);
    setErrors(nextErrors);

    if (hasExternalLinkErrors(nextErrors)) {
      return;
    }

    setSubmitting(true);
    const saved = await onSave(values, link);
    setSubmitting(false);
    if (saved) {
      onClose();
    }
  }

  return (
    <Dialog
      className="max-w-lg"
      description="http 또는 https URL만 등록할 수 있습니다."
      onClose={onClose}
      title={mode === "create" ? "새 링크 등록" : "링크 수정"}
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <Select
          errorMessage={errors.type}
          label="링크 유형"
          onChange={(event) => updateField("type", event.target.value as ExternalLinkType)}
          options={EXTERNAL_LINK_TYPES.map((type) => ({ label: type, value: type }))}
          required
          value={values.type}
        />
        <Input
          errorMessage={errors.title}
          label="제목"
          onChange={(event) => updateField("title", event.target.value)}
          placeholder="GitHub 프로필"
          required
          value={values.title}
        />
        <Input
          errorMessage={errors.url}
          helperText="http:// 또는 https://로 시작하는 공개 링크만 입력해 주세요."
          label="URL"
          onChange={(event) => updateField("url", event.target.value)}
          placeholder="https://github.com/example"
          required
          type="url"
          value={values.url}
        />
        <Textarea
          errorMessage={errors.description}
          helperText={`${values.description.length}/${EXTERNAL_LINK_DESCRIPTION_MAX_LENGTH}자`}
          label="설명"
          onChange={(event) => updateField("description", event.target.value)}
          resize="vertical"
          value={values.description}
        />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button disabled={submitting} onClick={onClose} type="button" variant="secondary">
            취소
          </Button>
          <Button loading={submitting} type="submit">
            저장
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

function ExternalLinkEmptyState() {
  return (
    <Card>
      <CardContent>
        <div className="grid gap-2">
          <p className="text-body-medium text-neutral-900">조건에 맞는 링크가 없습니다.</p>
          <p className="text-body text-neutral-600">
            검색어를 조정하거나 새 링크를 등록해 보세요.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function getLinkIconText(type: ExternalLinkType): string {
  const iconText: Record<ExternalLinkType, string> = {
    GitHub: "GH",
    Notion: "NO",
    Velog: "VE",
    Blog: "BL",
    Portfolio: "PF",
    LinkedIn: "IN",
    "배포 서비스": "DP",
    "프로젝트 Repository": "PR",
    기타: "ET",
  };

  return iconText[type];
}
