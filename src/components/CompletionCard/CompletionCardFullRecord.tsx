import React from "react";
import { useCompletionCardContext } from "./CompletionCardContext";

export function CompletionCardFullRecord() {
  const { completionDetail } = useCompletionCardContext();

  return (
    <div className="">
      <div className="my-1">
        Full completion record&nbsp;
        <span role="img" aria-label="See below">
          ⤵️
        </span>
        &nbsp;
      </div>
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
  );
}
