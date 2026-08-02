"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { hasSameTags, toggleTag } from "@/features/essays/version-utils";
import type {
  EssayAnswerVersion,
  EssayTagSelection,
  EssayTagType,
} from "@/features/essays/version-types";

/** 목록이 길어져도 화면이 무너지지 않도록 검색 결과를 제한한다. */
const MAX_VISIBLE_TAGS = 12;

const TAG_TYPE_LABEL: Record<EssayTagType, string> = {
  experience: "경험 소재",
  competency: "역량 태그",
};

function searchTags(catalog: string[], query: string): string[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return catalog;
  }

  return catalog.filter((tag) => tag.toLowerCase().includes(normalized));
}

interface TagGroupProps {
  catalog: string[];
  type: EssayTagType;
  selected: string[];
  disabled: boolean;
  onToggle: (tag: string) => void;
}

function TagGroup({ catalog, disabled, onToggle, selected, type }: TagGroupProps) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchTags(catalog, query), [catalog, query]);
  const visible = results.slice(0, MAX_VISIBLE_TAGS);

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-body-medium text-neutral-900">{TAG_TYPE_LABEL[type]}</p>
        <span className="text-caption text-neutral-600">{selected.length}개 선택됨</span>
      </div>

      {catalog.length === 0 ? (
        <p className="text-caption text-neutral-600">
          등록된 {TAG_TYPE_LABEL[type]}가 없습니다.
        </p>
      ) : (
        <>
          <Input
            label={`${TAG_TYPE_LABEL[type]} 검색`}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="태그 이름"
            type="search"
            value={query}
          />

          {visible.length === 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-caption text-neutral-600">검색 결과가 없습니다.</p>
              <Button onClick={() => setQuery("")} size="sm" variant="ghost">
                검색어 지우기
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {visible.map((tag) => {
                const active = selected.includes(tag);

                return (
                  <Button
                    aria-pressed={active}
                    disabled={disabled}
                    key={tag}
                    onClick={() => onToggle(tag)}
                    size="sm"
                    variant={active ? "primary" : "secondary"}
                  >
                    {tag}
                  </Button>
                );
              })}
            </div>
          )}

          {results.length > visible.length ? (
            <p className="text-caption text-neutral-400">
              {results.length - visible.length}개를 더 보려면 검색어를 좁혀 주세요.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

interface EssayTagEditorProps {
  availableExperienceTags: string[];
  version: EssayAnswerVersion;
  onSave: (selection: EssayTagSelection) => Promise<{ ok: boolean; message?: string }>;
}

export function EssayTagEditor({ availableExperienceTags, onSave, version }: EssayTagEditorProps) {
  const [experienceTags, setExperienceTags] = useState(version.experienceTags);
  const [competencyTags, setCompetencyTags] = useState(version.competencyTags);
  const [savedSelection, setSavedSelection] = useState<EssayTagSelection>({
    experienceTags: version.experienceTags,
    competencyTags: version.competencyTags,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);

  // 다른 버전을 선택하면 그 버전의 연결 상태로 되돌린다.
  useEffect(() => {
    setExperienceTags(version.experienceTags);
    setCompetencyTags(version.competencyTags);
    setSavedSelection({
      experienceTags: version.experienceTags,
      competencyTags: version.competencyTags,
    });
    setMessage("");
    setFailed(false);
  }, [version]);

  const locked = version.isLocked;
  const isDirty =
    !hasSameTags(experienceTags, savedSelection.experienceTags) ||
    !hasSameTags(competencyTags, savedSelection.competencyTags);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    setFailed(false);

    const result = await onSave({ competencyTags, experienceTags });

    setSaving(false);

    if (!result.ok) {
      // 실패해도 선택 상태는 그대로 둔다. 되돌리면 사용자가 방금 고른 내용을 잃는다.
      setFailed(true);
      setMessage(result.message ?? "태그를 저장하지 못했습니다.");
      return;
    }

    setSavedSelection({ competencyTags, experienceTags });
    setMessage("태그 연결을 저장했습니다.");
  }

  return (
    <Card>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-1">
            <h2 className="text-h3 text-neutral-900">태그 연결</h2>
            <p className="text-caption text-neutral-600">
              태그는 버전마다 따로 저장됩니다. 제출본의 태그는 제출 당시 상태로 잠깁니다.
            </p>
          </div>

          {locked ? (
            <div className="grid gap-2">
              <p className="text-body text-neutral-600">
                제출본은 태그를 변경할 수 없습니다. 연결된 태그는 다음과 같습니다.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {version.experienceTags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
                {version.competencyTags.map((tag) => (
                  <Badge className="border-dashed" key={tag}>
                    {tag}
                  </Badge>
                ))}
                {version.experienceTags.length + version.competencyTags.length === 0 ? (
                  <p className="text-caption text-neutral-400">연결된 태그가 없습니다.</p>
                ) : null}
              </div>
            </div>
          ) : (
            <>
              <TagGroup
                catalog={availableExperienceTags}
                disabled={saving}
                onToggle={(tag) => setExperienceTags((current) => toggleTag(current, tag))}
                selected={experienceTags}
                type="experience"
              />

              <TagGroup
                catalog={[]}
                disabled={saving}
                onToggle={(tag) => setCompetencyTags((current) => toggleTag(current, tag))}
                selected={competencyTags}
                type="competency"
              />

              <div className="grid gap-2 border-t border-neutral-200 pt-3">
                <p className="text-caption text-neutral-600">선택된 태그</p>
                <div className="flex flex-wrap gap-1.5">
                  {experienceTags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                  {competencyTags.map((tag) => (
                    <Badge className="border-dashed" key={tag}>
                      {tag}
                    </Badge>
                  ))}
                  {experienceTags.length + competencyTags.length === 0 ? (
                    <p className="text-caption text-neutral-400">아직 연결한 태그가 없습니다.</p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p
                  aria-live="polite"
                  className={`min-h-5 text-caption ${failed ? "text-danger-600" : "text-success-700"}`}
                  role="status"
                >
                  {message || (isDirty ? "" : " ")}
                </p>
                <Button
                  className="w-full sm:w-fit"
                  disabled={!isDirty}
                  loading={saving}
                  onClick={() => void handleSave()}
                  size="sm"
                >
                  태그 저장
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
