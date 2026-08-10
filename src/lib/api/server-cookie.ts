import { cookies } from "next/headers";

// 백엔드로 넘길 쿠키는 Spring Security 세션 쿠키 하나뿐이다.
// localhost 쿠키는 포트를 구분하지 않아서, 브라우저에 있는 모든 쿠키를 그대로
// 전달하면 다른 로컬 프로젝트가 심어둔 쿠키까지 딸려간다. 그 합이 Tomcat
// 헤더 한도(기본 8KB)를 넘으면 백엔드가 400을 돌려주고, 프론트는 이것을
// 401이 아닌 실패로 읽어 "로그인 상태를 확인할 수 없습니다"로 처리한다.
const SESSION_COOKIE_NAME = "JSESSIONID";

export async function createServerCookieHeader(): Promise<string> {
  const session = (await cookies()).get(SESSION_COOKIE_NAME);

  return session ? `${session.name}=${session.value}` : "";
}
