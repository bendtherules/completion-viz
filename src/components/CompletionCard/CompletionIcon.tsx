import React from "react";
import { ICompletionDetail } from "../../logic/completionMapping";
import { CompletionTypes } from "../../types/engine262-stubs";

export interface ICompletionIconProps {
  completionDetail: ICompletionDetail;
}

export const typeToLetterMapping: {
  [key in CompletionTypes]: string;
} = {
  [CompletionTypes.Normal]: "N",
  [CompletionTypes.Return]: "R",
  [CompletionTypes.Continue]: "C",
  [CompletionTypes.Break]: "B",
  [CompletionTypes.Throw]: "T",
};

export function CompletionIcon(props: ICompletionIconProps) {
  const { completionDetail } = props;

  const tmpLetter = typeToLetterMapping[completionDetail.completionType];
  return (
    // Icon container
    <div className="flex items-center justify-center w-8 h-8 mr-2 text-base font-semibold align-middle bg-white rounded-circle ">
      <div>{tmpLetter}</div>
    </div>
  );
}
