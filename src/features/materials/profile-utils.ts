import type { ProfileField, UserProfile } from "@/features/materials/types";

export function createUserProfileFromAuthUser(user: {
  name: string;
  email: string;
}): UserProfile {
  return {
    name: user.name,
    email: user.email,
    phone: "",
    address: "",
    school: "",
    major: "",
    doubleMajor: "",
    gpa: "",
    militaryService: "",
    careerSummary: "",
  };
}

export function toProfileFields(profile: UserProfile): ProfileField[] {
  return [
    { key: "name", label: "이름", value: profile.name, sensitive: false, copyable: true },
    { key: "email", label: "이메일", value: profile.email, sensitive: false, copyable: true },
    { key: "phone", label: "전화번호", value: profile.phone, sensitive: true, copyable: true },
    { key: "address", label: "주소", value: profile.address, sensitive: true, copyable: true },
    { key: "school", label: "학교", value: profile.school, sensitive: false, copyable: true },
    { key: "major", label: "주전공", value: profile.major, sensitive: false, copyable: true },
    {
      key: "doubleMajor",
      label: "복수전공",
      value: profile.doubleMajor,
      sensitive: false,
      copyable: true,
    },
    { key: "gpa", label: "학점", value: profile.gpa, sensitive: false, copyable: true },
    {
      key: "militaryService",
      label: "병역사항",
      value: profile.militaryService,
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
