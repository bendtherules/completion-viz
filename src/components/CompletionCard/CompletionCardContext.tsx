import { createContext, useContext } from "react";
import { ICompletionDetail } from "../../logic/completionMapping";

export interface ICompletionCardContext {
  completionDetail?: ICompletionDetail;
  code?: string;
}

const initialValue: ICompletionCardContext = {};

export const CompletionCardContext = createContext<ICompletionCardContext>(
  initialValue
);

export class CompletionCardContextEmptyError extends TypeError {}

export function useCompletionCardContext() {
  const contextValue = useContext(CompletionCardContext);
  const { completionDetail, code } = contextValue;
  if (completionDetail === undefined || code === undefined) {
    throw new CompletionCardContextEmptyError(
      `CompletionCard Context value is not available in consumer. Provider might be missing.\n Value is ${JSON.stringify(
        contextValue,
        null,
        2
      )}`
    );
  }

  return { completionDetail, code };
}
