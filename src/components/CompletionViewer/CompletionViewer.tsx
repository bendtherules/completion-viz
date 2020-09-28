import React from "react";
import { ICompletionDetail } from "../../logic/completionMapping";
import { TSourceMapping } from "../../logic/sourceMapping";

import { CompletionCard } from "../CompletionCard";

export function CompletionViewer(props: {
  code: string;
  completionDetails: ICompletionDetail[];
  sourceMapping: TSourceMapping;
}) {
  const { code, completionDetails } = props;

  // function renderCompletionResult(inputCompletion: ICompletionDetail) {}

  return (
    <div className="">
      {/* Title for completion section */}
      <div className="px-4 py-1 bg-gray-200 ">Completion Records</div>
      {/* Completion list */}
      <div className="ml-1 mr-1">
        {completionDetails.map((tmpCompletion) => (
          // Card for each completion record
          <CompletionCard
            completionDetail={tmpCompletion}
            code={code}
          ></CompletionCard>
        ))}
      </div>
    </div>
  );
}
