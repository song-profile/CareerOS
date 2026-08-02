export interface CurrentUserDto {
  id: number;
  email: string;
  name: string;
  profileImageUrl: string | null;
  provider: "GOOGLE";
}

export interface CurrentUserViewModel {
  id: string;
  email: string;
  name: string;
  profileImageUrl: string | null;
  provider: "Google";
}
