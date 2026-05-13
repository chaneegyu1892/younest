"use client";

import { SearchModal } from "./SearchModal";
import { useSearchModal } from "./SearchModalProvider";

/**
 * Provider 컨텍스트와 SearchModal을 묶는 어댑터.
 * Provider 안쪽에서만 useSearchModal()이 가능하므로 별도 컴포넌트로 분리.
 */
export function SearchModalMount() {
  const { isOpen, close } = useSearchModal();
  return <SearchModal isOpen={isOpen} onClose={close} />;
}
