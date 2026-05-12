"use client";

import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

export default function PocClient() {
  const editor = useCreateBlockNote();
  return <BlockNoteView editor={editor} />;
}
