import React from "react";

import { InlineResultViewer } from "../InlineResultViewer";

import { useCompletionCardContext } from "./CompletionCardContext";
import { getCodeTextFromCompletion } from "./utils";

export function CompletionCardSourceSnippet() {
  const { completionDetail, code } = useCompletionCardContext();

  const relatedCode = getCodeTextFromCompletion(code, completionDetail);

  const hasNewline = relatedCode.includes("\n");

  const directionEmojiJSX = hasNewline ? (
    <span role="img" aria-label="See below">
      ⤵️
    </span>
  ) : (
    <span role="img" aria-label="See to the right" className="pr-1">
      👉
    </span>
  );

  const parentClassname = hasNewline ? "" : "flex flex-row items-center";
  const inlineCodeExtraClassName = hasNewline
    ? "py-2 lg:pl-3 lg:pr-8 lg:py-3"
    : "";

  return (
    <div className={parentClassname}>
      <div className="my-1">From source&nbsp;{directionEmojiJSX}&nbsp;</div>
      <InlineResultViewer
        className={`px-1 my-1 rounded ${inlineCodeExtraClassName}`}
        code={relatedCode}
      />
    </div>
  );
}
