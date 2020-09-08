import { Node } from "acorn";
import { inspect } from "../engine262/dist/engine262";

import { CompletionRecord, CompletionTypes } from "../types/engine262-stubs";

export interface ICompletionDetail {
  start: number;
  end: number;
  completionType: CompletionTypes;
  completionValueString: string | undefined;
  completionTargetString: string | undefined;
  completionValue: any;
}

export const completionMapping: {
  completionDetails: ICompletionDetail[];
  addCompletion(_: { node: Node; result: CompletionRecord }): void;
  reset(): void;
} = {
  completionDetails: [],
  addCompletion({ node, result }) {
    const { start, end } = node;
    const {
      Type: completionType,
      Value: completionValue,
      Target: completionTarget,
    } = result;

    const completionValueString: string | undefined =
      completionValue !== undefined ? inspect(completionValue) : undefined;
    const completionTargetString: string | undefined =
      completionTarget !== undefined
        ? inspect(completionTarget)
        : completionTarget;

    const obj = {
      start,
      end,
      completionType,
      completionValueString,
      completionTargetString,
      completionValue,
    };

    this.completionDetails.push(obj);
  },
  reset() {
    this.completionDetails = [];
  },
};
