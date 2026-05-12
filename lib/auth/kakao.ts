// M1에서 구현 예정. 현재는 인터페이스 스텁만.

export interface KakaoTokens {
  access_token: string;
  refresh_token: string;
}

export interface KakaoProfile {
  id: string;
  nickname: string;
}

export async function exchangeCodeForTokens(_code: string): Promise<KakaoTokens> {
  throw new Error("M1에서 구현 예정");
}

export async function fetchKakaoProfile(_accessToken: string): Promise<KakaoProfile> {
  throw new Error("M1에서 구현 예정");
}
