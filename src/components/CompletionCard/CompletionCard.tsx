import React from "react";
import { ICompletionDetail } from "../../logic/completionMapping";
import { getCompletionClassname } from "./utils";

import { CompletionCardContext } from "./CompletionCardContext";

import { CompletionCardFullRecord } from "./CompletionCardFullRecord";
import { CompletionCardSourceSnippet } from "./CompletionCardSourceSnippet";
import { CompletionCardSummary } from "./CompletionCardSummary";

export interface ICompletionCardProps {
  completionDetail: ICompletionDetail;
  code: string;
}

// TODO: have diff version to be shown as tooltip over source code

export function CompletionCardFull(props: ICompletionCardProps) {
  const { completionDetail, code } = props;

  return (
    <CompletionCardContext.Provider value={{ completionDetail, code }}>
      <div
        className={`px-4 py-2 my-1 rounded-md ${getCompletionClassname(
          completionDetail
        )}`}
      >
        <CompletionCardSummary />
        <CompletionCardSourceSnippet />
        <CompletionCardFullRecord />
      </div>
    </CompletionCardContext.Provider>
  );
}
