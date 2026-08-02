import type { CurrentUserDto, CurrentUserViewModel } from "@/features/auth/api/dto";

export function toCurrentUserViewModel(dto: CurrentUserDto): CurrentUserViewModel {
  return {
    id: String(dto.id),
    email: dto.email,
    name: dto.name,
    profileImageUrl: dto.profileImageUrl,
    provider: "Google",
  };
}
