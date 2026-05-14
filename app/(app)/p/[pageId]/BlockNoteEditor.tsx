"use client";

import { useCallback, useMemo, useState } from "react";
import {
  useCreateBlockNote,
  SuggestionMenuController,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

import { schema } from "@/lib/blocknote/schema";
import { useAutosave, type SaveFn } from "@/lib/blocknote/useAutosave";
import { serializeContent, deserializeContent } from "@/lib/blocknote/content-codec";
import { SaveStatusBadge } from "@/components/editor/SaveStatusBadge";
import { PageLinkPickerModal, type PickerPage } from "@/components/editor/PageLinkPickerModal";
import { getSlashMenuItems } from "@/components/editor/slash-menu";
import { updatePageContent } from "@/lib/actions/pages-content";
import { createUploadFileHandler } from "@/lib/images/upload-handler";
import type { Json } from "@/lib/database.types";

interface Props {
  pageId: string;
  initialContent: unknown[] | null;
  /** PageLink 모달용 — 현재 사용자의 페이지 메타데이터 */
  availablePages: PickerPage[];
}

export function BlockNoteEditor({ pageId, initialContent, availablePages }: Props) {
  const initial = useMemo(() => {
    const doc = deserializeContent({ plain: initialContent, encrypted: null });
    return doc ?? undefined; // undefined → BlockNote가 빈 paragraph 1개로 시작
  }, [initialContent]);

  const editor = useCreateBlockNote({
    schema,
    initialContent: initial as never,
    uploadFile: createUploadFileHandler(pageId) as never,
  });

  const save: SaveFn = useCallback(
    async (content) => {
      const ser = serializeContent(content);
      const res = await updatePageContent({ pageId, content: ser.plain as Json });
      if (res.ok) return { ok: true, updatedAt: res.data.updatedAt };
      return { ok: false, error: res.error };
    },
    [pageId],
  );

  const { status, lastSavedAt, schedule, retry } = useAutosave(pageId, save);

  const [pickerBlockId, setPickerBlockId] = useState<string | null>(null);

  const handleChange = useCallback(() => {
    schedule(editor.document as never as unknown[]);
  }, [editor, schedule]);

  return (
    <div className="relative">
      <div className="mb-2 flex h-5 justify-end">
        <SaveStatusBadge status={status} lastSavedAt={lastSavedAt} onRetry={retry} />
      </div>

      <div
        onClickCapture={(e) => {
          const el = (e.target as HTMLElement).closest("[data-page-link-empty]");
          if (el) {
            const blockId = el.getAttribute("data-block-id");
            if (blockId) setPickerBlockId(blockId);
          }
        }}
      >
        <BlockNoteView
          editor={editor as never}
          onChange={handleChange}
          slashMenu={false}
          theme="light"
        >
          <SuggestionMenuController
            triggerCharacter="/"
            getItems={async (query) =>
              getSlashMenuItems(editor as never).filter((item) =>
                item.title.toLowerCase().includes(query.toLowerCase()),
              )
            }
          />
        </BlockNoteView>
      </div>

      <PageLinkPickerModal
        open={pickerBlockId !== null}
        pages={availablePages}
        onChoose={(pid, title) => {
          if (!pickerBlockId) return;
          (editor as unknown as {
            updateBlock: (id: string, update: unknown) => void;
          }).updateBlock(pickerBlockId, {
            props: { pageId: pid, title },
          });
          setPickerBlockId(null);
        }}
        onClose={() => setPickerBlockId(null)}
      />
    </div>
  );
}
