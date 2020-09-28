import React from "react";
import { ICompletionDetail } from "../../logic/completionMapping";
import { TSourceMapping } from "../../logic/sourceMapping";
import { CompletionTypes } from "../../types/engine262-stubs";

import { InlineResultViewer } from "../InlineResultViewer";
import { CompletionIcon } from "./CompletionIcon";

function getCompletionClassname(inputCompletion: ICompletionDetail) {
  const typeToClassnameMapping: { [key in CompletionTypes]: string } = {
    [CompletionTypes.Normal]: "bg-gray-300",
    [CompletionTypes.Return]: "bg-green-200",
    [CompletionTypes.Continue]: "bg-yellow-100",
    [CompletionTypes.Break]: "bg-yellow-300",
    [CompletionTypes.Throw]: "bg-red-300",
  };

  return typeToClassnameMapping[inputCompletion.completionType];
}

function getCodeTextFromCompletion(
  code: string,
  completion: ICompletionDetail
) {
  return code.substring(completion.start, completion.end);
}

export interface ICompletionCardProps {
  completionDetail: ICompletionDetail;
  code: string;
}

export function CompletionCard(props: ICompletionCardProps) {
  const { completionDetail, code } = props;

  // TODO: have diff version to be shown as tooltip over source code
  return (
    <div
      className={`px-4 py-1 my-1 rounded-md ${getCompletionClassname(
        completionDetail
      )}`}
    >
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
      <div className="">
        <div className="my-1">From source ⤵️ </div>
        <InlineResultViewer
          className="px-1 py-1 my-1 rounded md:w-fit-content"
          code={getCodeTextFromCompletion(code, completionDetail)}
        />
      </div>
      <div className="">
        <div className="my-1">Full completion record ⤵️ </div>
        <table className="border border-gray-800">
          <tr className="border-b border-gray-800">
            <td className="p-1 border-r border-gray-800">[[Type]]</td>
            <td className="px-2 py-1">{completionDetail.completionType}</td>
          </tr>
          <tr className="border-b border-gray-800">
            <td className="p-1 border-r border-gray-800">[[Value]]</td>
            <td className="px-2 py-1">
              {completionDetail.completionValueString}
            </td>
          </tr>
          <tr className="border-b border-gray-800">
            <td className="p-1 border-r border-gray-800">[[Target]]</td>
            <td className="px-2 py-1">
              {completionDetail.completionTargetString}
            </td>
          </tr>
        </table>
      </div>
    </div>
  );
}
