import { addDays } from "@/features/applications/date-utils";
import { countCharacters } from "@/features/essays/character-count";
import type { EssayLibraryItem } from "@/features/essays/types";

const today = new Date();

/**
 * 답변 전문. 목록의 미리보기와 글자 수를 여기서 파생시켜 에디터와 값이 어긋나지 않게 한다.
 * 실제 개인정보나 자격번호는 포함하지 않는다.
 */
export const ESSAY_ANSWER_CONTENT: Record<string, string> = {
  "answer-kb-1": `금융 서비스는 한 번의 오류가 사용자의 하루를 무너뜨린다고 생각합니다. LOODI를 운영하며 결제 흐름에서 발생한 중복 요청을 직접 추적했던 경험이 있습니다.

당시에는 요청이 두 번 들어오는 것을 막는 것보다, 두 번 들어와도 결과가 같도록 만드는 편이 안전하다고 판단했습니다. 처리 키를 기준으로 중복을 걸러내는 구조로 바꾸면서 같은 문제가 다시 발생하지 않았습니다.

안정적인 시스템이 곧 신뢰라는 점을 그때 배웠습니다. 은행은 그 신뢰가 가장 먼저 요구되는 곳이라고 생각합니다. 눈에 띄는 기능을 만드는 일보다, 매일 같은 결과를 내는 시스템을 지키는 일을 오래 하고 싶습니다.`,

  "answer-kb-2": `동시 요청이 몰릴 때만 재현되는 데이터 정합성 문제가 있었습니다. 평소에는 정상이었지만 특정 시간대에만 잔액이 어긋났습니다.

로그만으로는 원인을 좁히지 못해 요청이 처리된 순서를 기록하는 임시 추적 코드를 넣었습니다. 며칠간 데이터를 모으고 나서야 두 요청이 같은 레코드를 동시에 읽고 각자 계산한 값을 쓰고 있다는 것을 확인했습니다.

트랜잭션 경계가 조회와 수정 사이에서 끊어져 있던 것이 원인이었습니다. 경계를 다시 잡고 갱신 시점에 버전을 확인하도록 바꿨습니다. 이후 동일한 오류는 재발하지 않았고, 재현되지 않는 문제일수록 추측보다 기록이 빠르다는 것을 배웠습니다.`,

  "answer-kb-3": `기숙사 커뮤니티 운영진 사이에서 공지 방식에 대한 의견이 갈렸습니다. 한쪽은 모든 공지를 푸시로 보내자고 했고, 다른 한쪽은 알림이 많으면 아무도 읽지 않는다고 반대했습니다.

저는 두 주장이 각각 다른 것을 지키려 한다고 정리했습니다. 하나는 전달률, 다른 하나는 신뢰도였습니다. 그래서 어느 쪽이 옳은지를 두고 다투는 대신 이용자에게 직접 묻기로 했습니다.

간단한 설문으로 어떤 공지를 알림으로 받고 싶은지 확인했고, 결과에 따라 공지를 두 등급으로 나눴습니다. 감정이 아니라 데이터로 합의한 경험이었습니다.`,

  "answer-shinhan-1": `인턴 기간 동안 운영 중인 시스템의 장애 대응을 가까이에서 지켜봤습니다. 새 기능을 만드는 회의보다 이미 돌아가는 시스템을 점검하는 시간이 훨씬 길다는 것이 인상적이었습니다.

장애가 나면 원인을 찾는 사람과 사용자에게 알리는 사람이 따로 움직였습니다. 기술만으로 해결되는 일이 아니라는 것을 그때 알았습니다.

새로운 것을 만드는 일보다 이미 돌아가는 시스템을 지키는 일이 더 어렵다고 생각합니다. ICT 직무에서 그 역할을 맡고 싶어 지원했습니다.`,

  "answer-kakao-1": `서비스 초기에는 응답 속도보다 기능 추가가 우선이었습니다. 사용자가 늘면서 목록 조회가 눈에 띄게 느려졌고, 특정 화면은 열리기까지 3초 이상 걸렸습니다.

먼저 느린 화면을 추측으로 고치지 않고 쿼리 실행 계획을 하나씩 확인했습니다. 정렬 조건과 검색 조건이 서로 다른 컬럼을 쓰고 있어서 인덱스가 사용되지 못하고 있었습니다.

조회 패턴에 맞춰 복합 인덱스를 다시 설계하고, 목록에서 쓰지 않는 컬럼을 조회 대상에서 제외했습니다. 평균 응답 시간을 절반 이하로 줄였습니다. 성능 문제는 감이 아니라 측정에서 시작해야 한다는 것을 확인한 작업이었습니다.`,

  "answer-kakao-2": `첫 배포에서 롤백 절차를 준비하지 않아 서비스가 30분간 중단되었습니다. 배포 자체는 몇 분 만에 끝났지만, 문제가 생겼을 때 되돌리는 방법을 아무도 정해두지 않았습니다.

원인을 찾는 데 걸린 시간보다 복구가 늦었던 점이 더 뼈아팠습니다. 사용자 입장에서는 원인이 무엇인지보다 언제 다시 쓸 수 있는지가 중요했습니다.

이후에는 배포 전에 롤백 시나리오를 먼저 문서화하는 습관을 들였습니다. 되돌릴 수 없는 변경은 따로 표시하고, 그런 작업은 사용자가 적은 시간대에만 진행했습니다. 실패를 줄이는 것보다 실패했을 때 빨리 돌아오는 준비가 더 중요하다고 생각합니다.`,

  "answer-naver-1": `군 복무 중 통신 장비 관리를 맡으면서 반복 점검의 가치를 배웠습니다. 매일 같은 항목을 확인하는 일이라 처음에는 의미를 찾기 어려웠습니다.

그러다 점검표에서 사소하게 넘겼던 항목 하나가 실제 장애로 이어지는 것을 봤습니다. 눈에 띄지 않는 일이지만 빠뜨리면 전체가 멈추는 일이었습니다.

이후에는 점검 결과를 기록하고 이전 기록과 비교하는 방식으로 바꿨습니다. 변화가 생기는 지점을 미리 찾을 수 있었습니다. 꾸준함이 성과로 이어질 수 있다는 것을 처음 체감한 시간이었습니다.`,

  "answer-naver-2": `플랫폼은 사용하는 개발자가 첫 번째 사용자라고 생각합니다. 내부 도구가 불편하면 그 비용이 팀 전체의 시간으로 쌓입니다.

입사 후에는 반복적으로 손이 가는 작업을 찾아 줄이는 일을 맡고 싶습니다. 특히 배포와 로그 확인처럼 매일 반복되는 흐름을 개선하고 싶습니다.

새로운 도구를 늘리기보다 이미 쓰는 도구의 사용성을 다듬는 방향을 우선하겠습니다.`,

  "answer-line-1": `일정이 밀릴 때마다 원인을 개인이 아닌 절차에서 찾으려 했습니다. 누가 늦었는지를 따지는 회의는 다음 일정에 도움이 되지 않았습니다.

작업 단위가 너무 커서 진행 상황이 보이지 않는 것이 문제라고 판단했습니다. 그래서 하루 안에 끝낼 수 있는 크기로 작업을 쪼개고, 매일 짧게 진행 상황을 공유하도록 제안했습니다.

막힌 지점이 하루 안에 드러나면서 도움을 요청하는 시점도 빨라졌습니다. 마감 지연이 눈에 띄게 줄었습니다.`,

  "answer-toss-1": `좋은 금융 서비스는 사용자가 시스템의 존재를 의식하지 않는 상태라고 생각합니다. 송금이 성공하는 것은 당연하게 여겨지고, 실패했을 때만 서비스가 보입니다.

인턴 기간에 본 장애 대응 절차가 그 기준을 만들어 주었습니다. 장애 하나에 대응하는 인원과 절차가 기능 하나를 만드는 것보다 촘촘했습니다.

화면이 화려한 것보다 실패하지 않는 것이 먼저입니다. 다만 실패를 완전히 없앨 수 없다면, 실패했을 때 사용자가 무엇을 해야 하는지 알려주는 것까지가 서비스의 몫이라고 생각합니다.

Core Banking은 그 기준이 가장 엄격하게 요구되는 영역이라고 알고 있습니다. 되돌릴 수 없는 작업을 다루는 만큼 신중함이 속도보다 앞서야 한다고 생각합니다.`,

  "answer-toss-2": `금융 도메인에서는 되돌릴 수 없는 작업이 많습니다. 그래서 빠른 처리보다 확인 절차를 지키는 편을 택하겠습니다.

다만 절차를 지키는 것과 절차를 그대로 두는 것은 다르다고 생각합니다. 절차 자체가 병목이라면 지키면서 동시에 고치자고 제안하겠습니다.

원칙을 어기는 방식으로 효율을 얻으면 그 비용은 나중에 더 크게 돌아온다고 생각합니다.`,

  "answer-hyundai-1": `데이터가 쌓이기만 하고 쓰이지 않는 상황을 여러 번 봤습니다. 수집 파이프라인은 있는데 정작 같은 지표를 두고 팀마다 다른 숫자를 말하는 경우가 많았습니다.

수집보다 정의가 먼저라고 생각해 지표 기준부터 문서로 정리했습니다. 어떤 이벤트를 언제 집계하는지, 제외 조건은 무엇인지를 한 곳에 모았습니다.

이후 같은 숫자를 두고 논쟁하는 일이 줄었습니다. 데이터 플랫폼의 역할은 저장이 아니라 합의라고 생각합니다.`,

  "answer-coupang-1": `배포마다 수작업이 반복되어 실수가 잦았습니다. 순서를 적어둔 문서는 있었지만 사람이 하는 이상 빠뜨리는 단계가 생겼습니다.

컨테이너와 배포 스크립트를 처음부터 학습해 자동화 흐름을 만들었습니다. 처음에는 기존 절차를 그대로 옮기는 것부터 시작했고, 익숙해진 뒤에 불필요한 단계를 줄였습니다.

배포 시간이 줄었을 뿐 아니라 실수 자체가 사라졌습니다. 자동화의 목적은 속도보다 일관성이라고 생각합니다.`,

  "answer-woowa-1": `사용자가 남긴 불편을 기능으로 옮기는 과정을 좋아합니다. 커뮤니티를 운영하며 요청을 정리하고 우선순위를 정하는 일을 반복했습니다.

모든 요청을 다 들어줄 수는 없었기 때문에 얼마나 많은 사람이 겪는 문제인지, 대안이 있는지를 기준으로 나눴습니다. 거절한 요청에도 이유를 적어 회신했습니다.

그 감각을 서비스 개발에서 쓰고 싶습니다.`,

  "answer-ncsoft-1": `한 학기 동안 매주 같은 시간에 스터디를 운영했습니다. 처음에는 열 명 가까이 모였지만 중간고사를 지나며 절반으로 줄었습니다.

인원이 줄어도 기록을 남기는 일은 멈추지 않았습니다. 매주 무엇을 다뤘고 어디까지 진행했는지 적어두니 늦게 합류한 사람도 따라올 수 있었습니다.

결과보다 지속이 어렵다는 것을 배운 시간이었습니다.`,
};

const PREVIEW_LENGTH = 150;

function toPreview(content: string): string {
  const singleLine = content.replace(/\s+/g, " ").trim();
  return singleLine.length <= PREVIEW_LENGTH
    ? singleLine
    : `${singleLine.slice(0, PREVIEW_LENGTH)}…`;
}

type EssayLibrarySeed = Omit<EssayLibraryItem, "contentPreview" | "characterCount">;

const essayLibrarySeeds: EssayLibrarySeed[] = [
  {
    answerId: "answer-kb-1",
    questionId: "question-kb-1",
    applicationId: "app-kb-2026-it",
    companyName: "KB국민은행",
    positionName: "IT 개발",
    recruitmentYear: 2026,
    season: "하반기",
    questionText: "당사를 선택한 기준과 지원 동기를 기술하시오.",
    commonQuestionType: "지원동기",
    experienceTags: ["LOODI"],
    competencyTags: ["문제 해결", "안정성"],
    // 11단계 버전 시나리오: v1 작성본 → v2 제출본 → v3 개선본
    answerStatus: "개선본",
    version: 3,
    characterLimit: 1000,
    submittedAt: addDays(today, -14),
    updatedAt: addDays(today, -1),
  },
  {
    answerId: "answer-kb-2",
    questionId: "question-kb-2",
    applicationId: "app-kb-2026-it",
    companyName: "KB국민은행",
    positionName: "IT 개발",
    recruitmentYear: 2026,
    season: "하반기",
    questionText: "가장 어려웠던 문제를 해결한 경험을 서술하시오.",
    commonQuestionType: "문제해결",
    experienceTags: ["LOODI", "씨앤태크 ICT 인턴"],
    competencyTags: ["문제 해결", "안정성"],
    answerStatus: "작성본",
    version: 2,
    characterLimit: 1000,
    submittedAt: null,
    updatedAt: addDays(today, -2),
  },
  {
    answerId: "answer-kb-3",
    questionId: "question-kb-3",
    applicationId: "app-kb-2026-it",
    companyName: "KB국민은행",
    positionName: "IT 개발",
    recruitmentYear: 2026,
    season: "하반기",
    questionText: "협업 과정에서 갈등을 조정한 경험을 기술하시오.",
    commonQuestionType: "협업갈등",
    experienceTags: ["기숙사 커뮤니티"],
    competencyTags: ["협업", "책임감"],
    answerStatus: "작성본",
    version: 1,
    characterLimit: 800,
    submittedAt: null,
    updatedAt: addDays(today, -5),
  },
  {
    answerId: "answer-shinhan-1",
    questionId: "question-shinhan-1",
    applicationId: "app-shinhan-ict",
    companyName: "신한은행",
    positionName: "ICT",
    recruitmentYear: 2026,
    season: "하반기",
    questionText: "지원 분야를 선택한 이유와 준비 과정을 작성해 주세요.",
    commonQuestionType: "지원동기",
    experienceTags: ["씨앤태크 ICT 인턴"],
    competencyTags: ["안정성", "책임감"],
    answerStatus: "작성본",
    version: 1,
    characterLimit: 1000,
    submittedAt: null,
    updatedAt: addDays(today, -3),
  },
  {
    answerId: "answer-kakao-1",
    questionId: "question-kakao-1",
    applicationId: "app-kakao-backend",
    companyName: "카카오",
    positionName: "백엔드",
    recruitmentYear: 2026,
    season: "수시",
    questionText: "본인의 기술적 강점을 프로젝트 사례와 함께 설명해 주세요.",
    commonQuestionType: "직무역량",
    experienceTags: ["LOODI"],
    competencyTags: ["문제 해결", "안정성"],
    answerStatus: "제출본",
    version: 4,
    characterLimit: 1000,
    submittedAt: addDays(today, -12),
    updatedAt: addDays(today, -12),
  },
  {
    answerId: "answer-kakao-2",
    questionId: "question-kakao-2",
    applicationId: "app-kakao-backend",
    companyName: "카카오",
    positionName: "백엔드",
    recruitmentYear: 2026,
    season: "수시",
    questionText: "실패했던 경험과 그로부터 배운 점을 작성해 주세요.",
    commonQuestionType: "도전실패",
    experienceTags: ["LOODI", "성적우수자"],
    competencyTags: ["책임감", "사용자 관점"],
    answerStatus: "개선본",
    version: 5,
    characterLimit: 1000,
    submittedAt: addDays(today, -12),
    updatedAt: addDays(today, -6),
  },
  {
    answerId: "answer-naver-1",
    questionId: "question-naver-1",
    applicationId: "app-naver-platform",
    companyName: "네이버",
    positionName: "플랫폼 엔지니어",
    recruitmentYear: 2026,
    season: "상반기",
    questionText: "성장 과정에서 본인에게 가장 큰 영향을 준 경험은 무엇입니까?",
    commonQuestionType: "성장과정",
    experienceTags: ["군 최우수상"],
    competencyTags: ["책임감", "협업"],
    answerStatus: "제출본",
    version: 2,
    characterLimit: 800,
    submittedAt: addDays(today, -40),
    updatedAt: addDays(today, -40),
  },
  {
    answerId: "answer-naver-2",
    questionId: "question-naver-2",
    applicationId: "app-naver-platform",
    companyName: "네이버",
    positionName: "플랫폼 엔지니어",
    recruitmentYear: 2026,
    season: "상반기",
    questionText: "입사 후 이루고 싶은 목표를 구체적으로 작성해 주세요.",
    commonQuestionType: "입사포부",
    experienceTags: ["LOODI"],
    competencyTags: ["사용자 관점"],
    answerStatus: "작성본",
    version: 1,
    characterLimit: null,
    submittedAt: null,
    updatedAt: addDays(today, -8),
  },
  {
    answerId: "answer-line-1",
    questionId: "question-line-1",
    applicationId: "app-line-server",
    companyName: "라인플러스",
    positionName: "서버 개발",
    recruitmentYear: 2026,
    season: "수시",
    questionText: "팀에서 본인의 역할을 설명하고 기여한 바를 기술해 주세요.",
    commonQuestionType: "협업갈등",
    experienceTags: ["LOODI", "기숙사 커뮤니티"],
    competencyTags: ["협업", "문제 해결"],
    answerStatus: "제출본",
    version: 3,
    characterLimit: 700,
    submittedAt: addDays(today, -20),
    updatedAt: addDays(today, -20),
  },
  {
    answerId: "answer-toss-1",
    questionId: "question-toss-1",
    applicationId: "app-toss-core",
    companyName: "토스",
    positionName: "Core Banking 개발",
    recruitmentYear: 2026,
    season: "수시",
    questionText: "본인이 생각하는 좋은 금융 서비스의 조건은 무엇입니까?",
    commonQuestionType: "직무역량",
    experienceTags: ["씨앤태크 ICT 인턴", "LOODI"],
    competencyTags: ["안정성", "사용자 관점"],
    answerStatus: "개선본",
    version: 6,
    characterLimit: 450,
    submittedAt: addDays(today, -15),
    updatedAt: addDays(today, -4),
  },
  {
    answerId: "answer-toss-2",
    questionId: "question-toss-2",
    applicationId: "app-toss-core",
    companyName: "토스",
    positionName: "Core Banking 개발",
    recruitmentYear: 2026,
    season: "수시",
    questionText: "원칙과 효율이 충돌했을 때 어떻게 판단하시겠습니까?",
    commonQuestionType: "윤리책임",
    experienceTags: ["씨앤태크 ICT 인턴"],
    competencyTags: ["책임감", "안정성"],
    answerStatus: "작성본",
    version: 1,
    characterLimit: 800,
    submittedAt: null,
    updatedAt: addDays(today, -9),
  },
  {
    answerId: "answer-hyundai-1",
    questionId: "question-hyundai-1",
    applicationId: "app-hyundai-data",
    companyName: "현대오토에버",
    positionName: "데이터 플랫폼",
    recruitmentYear: 2026,
    season: "하반기",
    questionText: "지원 직무에 필요한 역량을 어떻게 준비했는지 기술하시오.",
    commonQuestionType: "직무역량",
    experienceTags: ["성적우수자", "LOODI"],
    competencyTags: ["문제 해결"],
    answerStatus: "작성본",
    version: 2,
    characterLimit: 1000,
    submittedAt: null,
    updatedAt: addDays(today, -7),
  },
  {
    answerId: "answer-coupang-1",
    questionId: "question-coupang-1",
    applicationId: "app-coupang-infra",
    companyName: "쿠팡",
    positionName: "인프라 개발",
    recruitmentYear: 2026,
    season: "상반기",
    questionText: "새로운 기술을 학습해 실제 문제에 적용한 사례를 작성해 주세요.",
    commonQuestionType: "문제해결",
    experienceTags: ["LOODI"],
    competencyTags: ["문제 해결", "안정성"],
    answerStatus: "제출본",
    version: 2,
    characterLimit: 1000,
    submittedAt: addDays(today, -33),
    updatedAt: addDays(today, -33),
  },
  {
    answerId: "answer-woowa-1",
    questionId: "question-woowa-1",
    applicationId: "app-woowa-2025-server",
    companyName: "우아한형제들",
    positionName: "서버 개발",
    recruitmentYear: 2025,
    season: "하반기",
    questionText: "지원 동기와 본인이 회사에 기여할 수 있는 점을 작성해 주세요.",
    commonQuestionType: "지원동기",
    experienceTags: ["기숙사 커뮤니티"],
    competencyTags: ["협업", "사용자 관점"],
    answerStatus: "제출본",
    version: 1,
    characterLimit: 700,
    submittedAt: addDays(today, -300),
    updatedAt: addDays(today, -300),
  },
  {
    answerId: "answer-ncsoft-1",
    questionId: "question-ncsoft-1",
    applicationId: "app-ncsoft-2025-platform",
    companyName: "엔씨소프트",
    positionName: "플랫폼 개발",
    recruitmentYear: 2025,
    season: "상반기",
    questionText: "지금까지 가장 몰입했던 경험을 소개해 주세요.",
    commonQuestionType: "성장과정",
    experienceTags: ["군 최우수상", "성적우수자"],
    competencyTags: ["책임감"],
    answerStatus: "제출본",
    version: 1,
    characterLimit: 600,
    submittedAt: addDays(today, -420),
    updatedAt: addDays(today, -420),
  },
];

export const essayLibraryMockData: EssayLibraryItem[] = essayLibrarySeeds.map((seed) => {
  const content = ESSAY_ANSWER_CONTENT[seed.answerId] ?? "";

  return {
    ...seed,
    contentPreview: toPreview(content),
    characterCount: countCharacters(content),
  };
});
