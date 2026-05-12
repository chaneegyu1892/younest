"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitSignup } from "./actions";

interface SignupFormProps {
  /** 승인된 어드민이면 제출 후 /dashboard로, 아니면 /pending으로 */
  redirectTarget: "/dashboard" | "/pending";
}

export function SignupForm({ redirectTarget }: SignupFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await submitSignup(formData);
      if (!result.ok) {
        setError(result.error ?? "알 수 없는 오류");
        return;
      }
      router.push(redirectTarget);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="nickname" className="text-body font-medium text-text-primary">
          닉네임
        </label>
        <Input
          id="nickname"
          name="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="앱에서 사용할 이름"
          maxLength={20}
          required
          autoFocus
          disabled={pending}
        />
        <p className="text-caption text-text-tertiary">
          1-20자. 나중에 설정에서 바꿀 수 있어요.
        </p>
      </div>

      {error && (
        <p className="rounded-md bg-error/10 px-3 py-2 text-caption text-error" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending || nickname.trim().length === 0} className="w-full">
        {pending ? "신청 중..." : "가입 신청"}
      </Button>
    </form>
  );
}
