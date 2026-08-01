"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDeadline } from "@/features/applications/date-utils";
import { countCharacters, getCharacterCountLevel, isBlank } from "@/features/essays/character-count";
import { CharacterCounter } from "@/features/essays/components/character-counter";
import { EssayStatusBadge } from "@/features/essays/components/essay-status-badge";
import { ReadOnlyEssayAnswer } from "@/features/essays/components/read-only-essay-answer";
import { SaveStatusIndicator } from "@/features/essays/components/save-status-indicator";
import { SubmitLockDialog } from "@/features/essays/components/submit-lock-dialog";
import { COMMON_QUESTION_TYPES, COMMON_QUESTION_TYPE_LABEL } from "@/features/essays/constants";
import { lockEssaySubmission, saveEssayDraft } from "@/features/essays/editor-service";
import type { EssayAnswerDetail, EssaySaveStatus } from "@/features/essays/editor-types";
import type { CommonQuestionType, EssayAnswerStatus } from "@/features/essays/types";

const QUESTION_TYPE_OPTIONS = COMMON_QUESTION_TYPES.map((type) => ({
  label: COMMON_QUESTION_TYPE_LABEL[type],
  value: type,
}));

interface EssayEditorProps {
  answer: EssayAnswerDetail;
}

export function EssayEditor({ answer }: EssayEditorProps) {
  const router = useRouter();
  const questionTextId = useId();
  const counterId = useId();

  const [content, setContent] = useState(answer.content);
  const [questionType, setQuestionType] = useState<CommonQuestionType>(
    answer.question.commonQuestionType,
  );
  const [savedContent, setSavedContent] = useState(answer.content);
  const [savedQuestionType, setSavedQuestionType] = useState<CommonQuestionType>(
    answer.question.commonQuestionType,
  );
  const [answerStatus, setAnswerStatus] = useState<EssayAnswerStatus>(answer.answerStatus);
  const [status, setStatus] = useState<EssaySaveStatus>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(answer.updatedAt);
  const [errorMessage, setErrorMessage] = useState("");
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  const readOnly = answerStatus === "제출본";
  const isDirty = !readOnly && (content !== savedContent || questionType !== savedQuestionType);
  const saving = status === "saving";

  const characterLimit = answer.question.characterLimit;
  const characterCount = useMemo(() => countCharacters(content), [content]);
  const isOverLimit = getCharacterCountLevel(characterCount, characterLimit) === "over";

  const lockBlockedReason = isBlank(content)
    ? "답변 내용을 입력해야 제출본으로 저장할 수 있습니다."
    : isOverLimit
      ? "제한 글자 수를 초과해 제출본으로 저장할 수 없습니다."
      : "";

  const handleSaveDraft = useCallback(async () => {
    if (readOnly || saving) {
      return;
    }

    setStatus("saving");
    setErrorMessage("");

    const result = await saveEssayDraft(answer.answerId, {
      content,
      commonQuestionType: questionType,
    });

    if (!result.ok) {
      // 실패해도 입력 내용은 그대로 두고 상태만 바꾼다.
      setStatus("error");
      setErrorMessage(result.message);
      return;
    }

    setSavedContent(content);
    setSavedQuestionType(questionType);
    setSavedAt(result.savedAt);
    setStatus("saved");
  }, [answer.answerId, content, questionType, readOnly, saving]);

  // 저장되지 않은 변경이 있을 때만 새로고침·탭 닫기를 경고한다.
  useEffect(() => {
    if (!isDirty) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key !== "s") {
        return;
      }

      event.preventDefault();

      if (readOnly) {
        setStatus("error");
        setErrorMessage("제출본은 수정할 수 없어 저장되지 않았습니다.");
        return;
      }

      void handleSaveDraft();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveDraft, readOnly]);

  function handleContentChange(nextContent: string) {
    setContent(nextContent);
    setStatus(nextContent === savedContent && questionType === savedQuestionType ? "idle" : "dirty");
  }

  function handleQuestionTypeChange(nextType: CommonQuestionType) {
    setQuestionType(nextType);
    setStatus(content === savedContent && nextType === savedQuestionType ? "idle" : "dirty");
  }

  async function handleLockConfirm() {
    setStatus("saving");
    setErrorMessage("");

    const result = await lockEssaySubmission(answer.answerId, { content, characterCount });

    if (!result.ok) {
      setStatus("error");
      setErrorMessage(result.message);
      setLockDialogOpen(false);
      return;
    }

    setSavedContent(content);
    setAnswerStatus("제출본");
    setSavedAt(result.savedAt);
    setStatus("saved");
    setLockDialogOpen(false);
  }

  function handleBackClick(event: ReactMouseEvent<HTMLAnchorElement>) {
    if (!isDirty) {
      return;
    }

    event.preventDefault();
    setLeaveDialogOpen(true);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
      <EssayQuestionPanel
        answer={answer}
        answerStatus={answerStatus}
        onBackClick={handleBackClick}
        onQuestionTypeChange={handleQuestionTypeChange}
        questionTextId={questionTextId}
        questionType={questionType}
        readOnly={readOnly}
      />

      <div className="grid gap-4">
        <Card>
          <CardContent>
            <div className="grid gap-4">
              {readOnly ? (
                <ReadOnlyEssayAnswer
                  characterCount={characterCount}
                  characterLimit={characterLimit}
                  content={content}
                />
              ) : (
                <div className="grid gap-2">
                  <Textarea
                    aria-describedby={`${questionTextId} ${counterId}`}
                    className="min-h-[420px] leading-7"
                    label={`답변 · ${answer.question.questionOrder}번 문항`}
                    onChange={(event) => handleContentChange(event.target.value)}
                    placeholder="답변을 입력하세요."
                    resize="vertical"
                    rows={16}
                    value={content}
                  />
                  <CharacterCounter count={characterCount} id={counterId} limit={characterLimit} />
                </div>
              )}

              {errorMessage ? (
                <div
                  className="rounded-card border border-danger-100 bg-danger-50 px-4 py-3"
                  role="alert"
                >
                  <p className="text-body-medium text-danger-700">저장하지 못했습니다.</p>
                  <p className="text-body text-danger-600">{errorMessage}</p>
                  <p className="mt-1 text-caption text-danger-600">
                    작성한 내용은 그대로 남아 있습니다.
                  </p>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="grid gap-3">
              <SaveStatusIndicator savedAt={savedAt} status={status} />

              {readOnly ? (
                <div className="grid gap-2">
                  <p className="text-body text-neutral-600">
                    제출본은 제출 당시 내용을 보존하기 위해 잠겨 있습니다. 내용을 보완하려면 개선본을
                    만들어야 합니다.
                  </p>
                  <Button className="w-full sm:w-fit" disabled variant="secondary">
                    개선본 만들기
                  </Button>
                  <p className="text-caption text-neutral-400">
                    개선본과 버전 생성은 11단계에서 구현합니다.
                  </p>
                </div>
              ) : (
                <div className="grid gap-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button
                      loading={saving}
                      onClick={() => void handleSaveDraft()}
                      variant="secondary"
                    >
                      임시 저장
                    </Button>
                    <Button
                      disabled={saving || lockBlockedReason !== ""}
                      onClick={() => setLockDialogOpen(true)}
                    >
                      제출본으로 저장
                    </Button>
                  </div>
                  <p className="text-caption text-neutral-400 sm:text-right">
                    {lockBlockedReason || "임시 저장은 Ctrl+S(또는 Cmd+S)로도 할 수 있습니다."}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <SubmitLockDialog
        characterCount={characterCount}
        characterLimit={characterLimit}
        companyName={answer.question.companyName}
        onCancel={() => setLockDialogOpen(false)}
        onConfirm={() => void handleLockConfirm()}
        open={lockDialogOpen}
        positionName={answer.question.positionName}
        saving={saving}
      />

      <LeaveConfirmDialog
        onCancel={() => setLeaveDialogOpen(false)}
        onLeave={() => {
          setLeaveDialogOpen(false);
          router.push("/essays");
        }}
        open={leaveDialogOpen}
      />
    </div>
  );
}

interface EssayQuestionPanelProps {
  answer: EssayAnswerDetail;
  answerStatus: EssayAnswerStatus;
  questionType: CommonQuestionType;
  questionTextId: string;
  readOnly: boolean;
  onBackClick: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
  onQuestionTypeChange: (nextType: CommonQuestionType) => void;
}

/** 답변을 쓰는 동안 문항과 메타정보가 항상 보이도록 데스크톱에서 고정한다. */
function EssayQuestionPanel({
  answer,
  answerStatus,
  onBackClick,
  onQuestionTypeChange,
  questionTextId,
  questionType,
  readOnly,
}: EssayQuestionPanelProps) {
  const { question } = answer;

  return (
    <Card className="lg:sticky lg:top-20">
      <CardContent>
        <div className="grid gap-4">
          <Link
            className="w-fit rounded-control text-caption text-primary-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            href="/essays"
            onClick={onBackClick}
          >
            ← 자소서 라이브러리로 돌아가기
          </Link>

          <div className="grid gap-1">
            <p className="text-body-medium text-neutral-900">
              {question.companyName} · {question.positionName}
            </p>
            <p className="text-caption text-neutral-400">
              {question.recruitmentYear} {question.season} · {question.questionOrder}번 문항
            </p>
          </div>

          <div className="grid gap-1.5">
            <p className="text-caption text-neutral-600">문항</p>
            <p className="text-body text-neutral-900" id={questionTextId}>
              {question.questionText}
            </p>
            <p className="font-mono text-mono text-neutral-600">
              {question.characterLimit === null
                ? "제한 글자 수 없음"
                : `제한 ${question.characterLimit.toLocaleString("ko-KR")}자`}
            </p>
          </div>

          <div className="grid gap-2 border-t border-neutral-200 pt-4">
            <EssayStatusBadge status={answerStatus} version={answer.version} />
            {answer.derivedFromVersion !== null ? (
              <p className="text-caption text-neutral-400">
                v{answer.derivedFromVersion} 제출본에서 파생된 개선본입니다.
              </p>
            ) : null}
            <p className="text-caption text-neutral-600">
              최종 저장 {formatDeadline(answer.updatedAt)}
            </p>
          </div>

          <div className="grid gap-3 border-t border-neutral-200 pt-4">
            {readOnly ? (
              <div className="grid gap-1">
                <p className="text-caption text-neutral-600">공통 질문 유형</p>
                <Badge className="w-fit" variant="primary">
                  {COMMON_QUESTION_TYPE_LABEL[questionType]}
                </Badge>
              </div>
            ) : (
              <Select
                label="공통 질문 유형"
                onChange={(event) => onQuestionTypeChange(event.target.value as CommonQuestionType)}
                options={QUESTION_TYPE_OPTIONS}
                value={questionType}
              />
            )}

            <div className="grid gap-1.5">
              <p className="text-caption text-neutral-600">연결된 태그</p>
              <div className="flex flex-wrap gap-1.5">
                {answer.experienceTags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
                {answer.competencyTags.map((tag) => (
                  <Badge className="border-dashed" key={tag}>
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="text-caption text-neutral-400">태그 편집은 11단계에서 구현합니다.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LeaveConfirmDialog({
  onCancel,
  onLeave,
  open,
}: {
  open: boolean;
  onCancel: () => void;
  onLeave: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-neutral-900/40 px-6"
      role="dialog"
    >
      <div className="grid w-full max-w-md gap-4 rounded-modal border border-neutral-200 bg-neutral-0 p-5 shadow-lg">
        <div className="grid gap-2">
          <h2 className="text-h2 text-neutral-900" id={titleId}>
            저장하지 않고 나갈까요?
          </h2>
          <p className="text-body text-neutral-600" id={descriptionId}>
            저장하지 않은 변경사항이 있습니다. 지금 나가면 작성한 내용이 사라집니다.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button onClick={onCancel} variant="secondary">
            계속 작성
          </Button>
          <Button onClick={onLeave} variant="danger">
            저장하지 않고 나가기
          </Button>
        </div>
      </div>
    </div>
  );
}
