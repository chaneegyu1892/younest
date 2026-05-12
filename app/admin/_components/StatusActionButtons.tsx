"use client";

import { useState, useTransition } from "react";
import { setUserStatus, type AdminAction } from "../actions";

interface ActionButton {
  action: AdminAction;
  label: string;
  variant: "primary" | "danger" | "neutral";
}

interface StatusActionButtonsProps {
  userId: string;
  buttons: ActionButton[];
}

const variantClass: Record<ActionButton["variant"], string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover",
  danger: "bg-error text-white hover:opacity-90",
  neutral:
    "border border-border bg-surface text-text-primary hover:bg-background",
};

export function StatusActionButtons({
  userId,
  buttons,
}: StatusActionButtonsProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handle(action: AdminAction) {
    setError(null);
    startTransition(async () => {
      const result = await setUserStatus(userId, action);
      if (!result.ok) {
        setError(result.error ?? "실패");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap gap-2">
        {buttons.map((b) => (
          <button
            key={b.action}
            type="button"
            disabled={pending}
            onClick={() => handle(b.action)}
            className={`rounded-md px-3 py-1 text-caption font-medium disabled:opacity-50 ${variantClass[b.variant]}`}
          >
            {pending ? "..." : b.label}
          </button>
        ))}
      </div>
      {error && (
        <p className="text-caption text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
