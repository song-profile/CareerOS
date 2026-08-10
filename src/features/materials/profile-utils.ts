import type { ProfileField, UserProfile } from "@/features/materials/types";

export function createUserProfileFromAuthUser(user: {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  schoolName?: string;
  major?: string;
  doubleMajor?: string;
  minor?: string;
  graduationStatus?: UserProfile["graduationStatus"];
  graduationDate?: string;
  gpa?: string;
  gpaScale?: string;
  militaryStatus?: UserProfile["militaryStatus"];
  militaryBranch?: string;
  militaryRank?: string;
  militaryDischargeDate?: string;
  careerSummary?: string;
  updatedAt?: Date | null;
}): UserProfile {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    address: user.address ?? "",
    schoolName: user.schoolName ?? "",
    major: user.major ?? "",
    doubleMajor: user.doubleMajor ?? "",
    minor: user.minor ?? "",
    graduationStatus: user.graduationStatus ?? "",
    graduationDate: user.graduationDate ?? "",
    gpa: user.gpa ?? "",
    gpaScale: user.gpaScale ?? "",
    militaryStatus: user.militaryStatus ?? "",
    militaryBranch: user.militaryBranch ?? "",
    militaryRank: user.militaryRank ?? "",
    militaryDischargeDate: user.militaryDischargeDate ?? "",
    careerSummary: user.careerSummary ?? "",
    updatedAt: user.updatedAt ?? null,
  };
}

export function toProfileFields(profile: UserProfile): ProfileField[] {
  return [
    { key: "name", label: "이름", value: profile.name, sensitive: false, copyable: true },
    { key: "email", label: "이메일", value: profile.email, sensitive: false, copyable: true },
    { key: "phone", label: "전화번호", value: profile.phone, sensitive: true, copyable: true },
    { key: "address", label: "주소", value: profile.address, sensitive: true, copyable: true },
    { key: "schoolName", label: "학교", value: profile.schoolName, sensitive: false, copyable: true },
    { key: "major", label: "주전공", value: profile.major, sensitive: false, copyable: true },
    {
      key: "doubleMajor",
      label: "복수전공",
      value: profile.doubleMajor,
      sensitive: false,
      copyable: true,
    },
    {
      key: "minor",
      label: "부전공",
      value: profile.minor,
      sensitive: false,
      copyable: true,
    },
    {
      key: "graduationStatus",
      label: "졸업상태",
      value: profile.graduationStatus,
      sensitive: false,
      copyable: true,
    },
    {
      key: "graduationDate",
      label: "졸업일",
      value: profile.graduationDate,
      sensitive: false,
      copyable: true,
    },
    { key: "gpa", label: "학점", value: formatGpa(profile), sensitive: false, copyable: true },
    {
      key: "militaryStatus",
      label: "병역사항",
      value: formatMilitary(profile),
      sensitive: false,
      copyable: true,
    },
    {
      key: "careerSummary",
      label: "경력·인턴",
      value: profile.careerSummary,
      sensitive: false,
      copyable: true,
    },
  ];
}

function formatGpa(profile: UserProfile): string {
  if (!profile.gpa) {
    return "";
  }
  return profile.gpaScale ? `${profile.gpa} / ${profile.gpaScale}` : profile.gpa;
}

function formatMilitary(profile: UserProfile): string {
  const parts = [
    profile.militaryStatus,
    profile.militaryBranch,
    profile.militaryRank,
    profile.militaryDischargeDate,
  ].filter(Boolean);
  return parts.join(" · ");
}
