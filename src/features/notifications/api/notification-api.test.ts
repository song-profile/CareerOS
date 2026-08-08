import { describe, expect, it } from "vitest";
import { toNotificationItem } from "@/features/notifications/api/mapper";

describe("notification mapper", () => {
  it("maps backend notification dto to view model", () => {
    const item = toNotificationItem({
      createdAt: "2026-08-08T00:00:00Z",
      id: 12,
      linkUrl: "/applications/3",
      message: "KB국민은행 IT 개발 지원 마감이 D-7입니다.",
      read: false,
      readAt: null,
      relatedResourceId: 3,
      relatedResourceType: "APPLICATION",
      title: "지원 마감 D-7",
      type: "APPLICATION_DEADLINE",
    });

    expect(item.id).toBe("12");
    expect(item.relatedResourceId).toBe("3");
    expect(item.createdAt).toBeInstanceOf(Date);
    expect(item.readAt).toBeNull();
  });
});
