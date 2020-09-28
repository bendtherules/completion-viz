import { ICompletionDetail } from "../../logic/completionMapping";
import { CompletionTypes } from "../../types/engine262-stubs";

export function getCompletionClassname(inputCompletion: ICompletionDetail) {
  const typeToClassnameMapping: { [key in CompletionTypes]: string } = {
    [CompletionTypes.Normal]: "bg-gray-300",
    [CompletionTypes.Return]: "bg-green-200",
    [CompletionTypes.Continue]: "bg-yellow-100",
    [CompletionTypes.Break]: "bg-yellow-300",
    [CompletionTypes.Throw]: "bg-red-300",
  };

  return typeToClassnameMapping[inputCompletion.completionType];
}

export function getCodeTextFromCompletion(
  code: string,
  completion: ICompletionDetail
) {
  return code.substring(completion.start, completion.end);
}
