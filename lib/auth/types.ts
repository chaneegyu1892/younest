export type UserStatus = "pending" | "approved" | "rejected" | "banned";

export interface SessionUser {
  id: string;
  kakaoId: string;
  nickname: string;
  status: UserStatus;
  isAdmin: boolean;
}
