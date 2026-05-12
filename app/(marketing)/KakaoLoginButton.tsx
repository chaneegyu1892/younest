/**
 * "카카오로 시작하기" 버튼.
 * 실제 OAuth 흐름은 서버 라우트 /api/auth/kakao/start에서 state/nonce 발급 후 카카오로 리다이렉트.
 */
export function KakaoLoginButton() {
  return (
    <a
      href="/api/auth/kakao/start"
      className="block w-full rounded-md bg-[#FEE500] px-4 py-3 text-center text-body font-medium text-[#191919] hover:opacity-90"
    >
      카카오로 시작하기
    </a>
  );
}
