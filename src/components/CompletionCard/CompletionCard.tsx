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
  showSourceInitial: boolean;
  showFullRecordInitial: boolean;
}

// TODO: have diff version to be shown as tooltip over source code

export function CompletionCardFull(props: ICompletionCardProps) {
  const {
    completionDetail,
    code,
    showSourceInitial,
    showFullRecordInitial,
  } = props;

  function renderSnippetAndFullRecord() {
    if (showSourceInitial && !showFullRecordInitial) {
      return <CompletionCardSourceSnippet />;
    } else if (showFullRecordInitial && !showSourceInitial) {
      return <CompletionCardFullRecord />;
    } else if (showFullRecordInitial && showSourceInitial) {
      return (
        <div className="flex flex-row gap-x-4">
          <div className="flex-1 max-w-half">
            <CompletionCardSourceSnippet />
          </div>
          <div className="flex-1 max-w-half">
            <CompletionCardFullRecord />
          </div>
        </div>
      );
    }

    return null;
  }

  return (
    <CompletionCardContext.Provider value={{ completionDetail, code }}>
      <div
        className={`px-4 py-2 my-1 rounded-md ${getCompletionClassname(
          completionDetail
        )}`}
      >
        <CompletionCardSummary />
        {renderSnippetAndFullRecord()}
      </div>
    </CompletionCardContext.Provider>
  );
}

CompletionCardFull.defaultProps = {
  showSourceInitial: true,
  showFullRecordInitial: false,
};
