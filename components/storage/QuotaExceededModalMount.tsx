"use client";

import React, { useEffect, useState } from "react";
import { QuotaExceededModal } from "./QuotaExceededModal";

const QUOTA_EVENT = "storage-quota-exceeded";

/**
 * Layout-mounted listener — window 'storage-quota-exceeded' 이벤트 발생 시 모달 표시.
 * upload-handler.ts가 window.dispatchEvent(new CustomEvent('storage-quota-exceeded'))로 트리거.
 */
export function QuotaExceededModalMount() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handler() {
      setIsOpen(true);
    }
    window.addEventListener(QUOTA_EVENT, handler);
    return () => window.removeEventListener(QUOTA_EVENT, handler);
  }, []);

  return <QuotaExceededModal isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}
