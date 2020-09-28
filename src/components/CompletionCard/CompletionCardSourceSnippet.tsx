import React from "react";

import { InlineResultViewer } from "../InlineResultViewer";

import { useCompletionCardContext } from "./CompletionCardContext";
import { getCodeTextFromCompletion } from "./utils";

export function CompletionCardSourceSnippet() {
  const { completionDetail, code } = useCompletionCardContext();

  return (
    <div className="">
      <div className="my-1">
        From source&nbsp;
        <span role="img" aria-label="See below">
          ⤵️
        </span>
        &nbsp;
      </div>
      <InlineResultViewer
        className="px-1 py-1 my-1 rounded md:w-fit-content"
        code={getCodeTextFromCompletion(code, completionDetail)}
      />
    </div>
  );
}
