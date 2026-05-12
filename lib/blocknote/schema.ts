import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { ToggleBlock } from "./custom-blocks/toggle";
import { CalloutBlock } from "./custom-blocks/callout";
import { PageLinkBlock } from "./custom-blocks/page-link";

export const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    toggle: ToggleBlock(),
    callout: CalloutBlock(),
    pageLink: PageLinkBlock(),
  },
});

export type YounestEditor = typeof schema.BlockNoteEditor;
