import React from "react";

import { InlineResultViewer } from "../InlineResultViewer";

import { CompletionIcon } from "./CompletionIcon";
import { useCompletionCardContext } from "./CompletionCardContext";

export function CompletionCardSummary() {
  const { completionDetail } = useCompletionCardContext();

  return (
    <div className="flex items-center my-1">
      <div className="flex-initial flex-shrink-0">
        <CompletionIcon completionDetail={completionDetail} />
      </div>
      <div className="flex-initial min-w-0">
        <InlineResultViewer
          className="px-1 rounded"
          code={completionDetail.completionValueString || "// No value"}
        />
      </div>
    </div>
  );
}
