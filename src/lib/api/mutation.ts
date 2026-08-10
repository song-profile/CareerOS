import type { useRouter } from "next/navigation";

type AppRouter = ReturnType<typeof useRouter>;

/**
 * 등록·수정·삭제가 성공한 직후에 부르는 단 하나의 자리.
 *
 * refresh를 먼저 부르고 이동한다. router.refresh()가 지우는 것은 "현재 라우트"의
 * 클라이언트 캐시라, 이동한 다음에 부르면 방금 떠나온 목록 화면의 캐시는 그대로 남는다.
 * 목록으로 돌아왔을 때 수동 새로고침을 눌러야 반영되던 것이 이 순서 차이다.
 *
 * 서버 캐시는 건드리지 않는다. 지금은 모든 조회가 cache:"no-store"라 필요 없고,
 * 캐시를 켜는 순간 이 자리에 revalidatePath/revalidateTag가 들어가면 된다.
 */
export function reloadAfterMutation(
  router: AppRouter,
  href?: string,
  navigation: "push" | "replace" = "push",
) {
  router.refresh();

  if (!href) {
    return;
  }

  if (navigation === "replace") {
    router.replace(href);
    return;
  }

  router.push(href);
}
