import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileForm } from "@/features/materials/components/profile-form";
import { saveUserProfile } from "@/features/materials/materials-service";
import type { UserProfile } from "@/features/materials/types";

vi.mock("@/features/materials/materials-service", () => ({
  saveUserProfile: vi.fn(),
}));

const baseProfile: UserProfile = {
  name: "권예준",
  email: "yejun@example.com",
  phone: "",
  address: "",
  schoolName: "",
  major: "",
  doubleMajor: "",
  minor: "",
  graduationStatus: "",
  graduationDate: "",
  gpa: "",
  gpaScale: "",
  militaryStatus: "",
  militaryBranch: "",
  militaryRank: "",
  militaryDischargeDate: "",
  careerSummary: "",
  updatedAt: null,
};

describe("ProfileForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty profile state and editable fields", () => {
    render(<ProfileForm profile={baseProfile} />);

    expect(screen.getByText("아직 저장된 기본정보가 없습니다. 필요한 항목부터 채워주세요."))
      .toBeInTheDocument();
    expect(screen.getByLabelText("전화번호")).toBeEnabled();
    expect(screen.getByLabelText("학교")).toBeEnabled();
    expect(screen.getByLabelText("이름")).toBeDisabled();
    expect(screen.getByLabelText("이메일")).toBeDisabled();
  });

  it("blocks invalid phone and GPA before API call", async () => {
    const user = userEvent.setup();
    render(<ProfileForm profile={baseProfile} />);

    await user.type(screen.getByLabelText("전화번호"), "010-ABCD");
    await user.type(screen.getByLabelText("학점"), "4.8");
    await user.type(screen.getByLabelText("학점 만점"), "4.5");
    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(await screen.findByText("전화번호 형식을 확인해 주세요.")).toBeInTheDocument();
    expect(screen.getByText("학점은 학점 만점보다 클 수 없습니다.")).toBeInTheDocument();
    expect(saveUserProfile).not.toHaveBeenCalled();
  });

  it("saves profile and updates summary", async () => {
    const user = userEvent.setup();
    vi.mocked(saveUserProfile).mockResolvedValue({
      ok: true,
      value: {
        ...baseProfile,
        phone: "010-1234-5678",
        schoolName: "아주대학교",
        major: "소프트웨어학과",
      },
    });

    render(<ProfileForm profile={baseProfile} />);

    await user.type(screen.getByLabelText("전화번호"), "010-1234-5678");
    await user.type(screen.getByLabelText("학교"), "아주대학교");
    await user.type(screen.getByLabelText("주전공"), "소프트웨어학과");
    await user.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() => {
      expect(saveUserProfile).toHaveBeenCalledWith(
        { name: "권예준", email: "yejun@example.com" },
        expect.objectContaining({
          phone: "010-1234-5678",
          schoolName: "아주대학교",
          major: "소프트웨어학과",
        }),
      );
    });
    expect(await screen.findByText("기본정보를 저장했습니다.")).toBeInTheDocument();
    expect(screen.getAllByText("아주대학교").length).toBeGreaterThan(0);
  });

  it("shows API failure message", async () => {
    const user = userEvent.setup();
    vi.mocked(saveUserProfile).mockResolvedValue({
      ok: false,
      message: "기본정보를 저장할 수 없습니다.",
      status: 500,
    });

    render(<ProfileForm profile={baseProfile} />);

    await user.type(screen.getByLabelText("학교"), "아주대학교");
    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(await screen.findByText("기본정보를 저장할 수 없습니다.")).toBeInTheDocument();
  });
});
