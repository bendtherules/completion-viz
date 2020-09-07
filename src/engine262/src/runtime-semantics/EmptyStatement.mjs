import { NormalCompletion } from '../completion.mjs';

// 13.4.1 #sec-empty-statement-runtime-semantics-evaluation
//   EmptyStatement : `;`
export function Evaluate_EmptyStatement(/* EmptyStatement */) {
  return new NormalCompletion(undefined);
}
