/**
 * API 오류 문구 정책의 회귀 방지용 자체 점검.
 *
 * 실행: npm run check:messages
 * (프론트에 테스트 러너가 없어 Node 내장 assert만 쓴다. 러너를 들이면 그때 옮긴다.)
 */
import assert from "node:assert/strict";
import {
  createHttpError,
  createNetworkError,
  getApiErrorMessage,
} from "../src/lib/api/errors.ts";

const ACTION = "지원 건을 삭제";

// 상태 코드별로 문장 구조가 하나씩만 나온다.
assert.equal(
  getApiErrorMessage(createHttpError(401, {}), ACTION),
  "로그인이 만료되었습니다. 다시 로그인한 뒤 지원 건을 삭제해 주세요.",
);
assert.equal(
  getApiErrorMessage(createHttpError(403, {}), ACTION),
  "권한이 없어 지원 건을 삭제할 수 없습니다.",
);
assert.equal(
  getApiErrorMessage(createHttpError(404, {}), ACTION),
  "대상을 찾을 수 없어 지원 건을 삭제할 수 없습니다.",
);
assert.equal(
  getApiErrorMessage(createHttpError(409, {}), ACTION),
  "이미 변경된 정보입니다. 새로고침한 뒤 다시 지원 건을 삭제해 주세요.",
);
assert.equal(
  getApiErrorMessage(createHttpError(500, {}), ACTION),
  "서버 오류로 지원 건을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.",
);
assert.equal(
  getApiErrorMessage(createNetworkError("fetch failed"), ACTION),
  "네트워크에 연결할 수 없어 지원 건을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.",
);

// ApiClientError가 아닌 값도 같은 정책을 탄다 (문구가 새어나가면 안 된다).
assert.equal(
  getApiErrorMessage(new Error("boom"), ACTION),
  "네트워크에 연결할 수 없어 지원 건을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.",
);

// validation은 어느 필드가 왜 틀렸는지를 서버만 알기에 fieldErrors가 이긴다.
assert.equal(
  getApiErrorMessage(
    createHttpError(400, { code: "VALIDATION_ERROR", fieldErrors: { deadline: "마감일이 시작일보다 빠릅니다." } }),
    ACTION,
  ),
  "마감일이 시작일보다 빠릅니다.",
);
assert.equal(
  getApiErrorMessage(createHttpError(422, {}), ACTION),
  "입력값을 확인해 주세요.",
);

// 도메인 코드는 서버 문구가 이긴다. 일반 문구로 덮으면 원인이 사라진다.
const googleMessage = "Google Calendar 연결이 만료되었습니다. 다시 연결해주세요.";
assert.equal(
  getApiErrorMessage(
    createHttpError(409, { code: "GOOGLE_TOKEN_EXPIRED", message: googleMessage }),
    "일정을 동기화",
  ),
  googleMessage,
);

// HTTP 상태를 그대로 옮긴 코드는 서버 문구가 있어도 화면 문맥이 있는 쪽이 이긴다.
assert.equal(
  getApiErrorMessage(
    createHttpError(403, { code: "FORBIDDEN", message: "접근 권한이 없습니다." }),
    ACTION,
  ),
  "권한이 없어 지원 건을 삭제할 수 없습니다.",
);

console.log("API 오류 문구 정책 점검 통과");
