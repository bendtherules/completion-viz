import { Value } from '../value.mjs';
import { BreakCompletion } from '../completion.mjs';

// 13.9.3 #sec-break-statement-runtime-semantics-evaluation
// BreakStatement :
//   `break` `;`
//   `break` LabelIdentifier `;`
export function Evaluate_BreakStatement({ label: LabelIdentifier }) {
  if (LabelIdentifier) {
    const label = new Value(LabelIdentifier.name);
    return new BreakCompletion(label);
  } else {
    return new BreakCompletion();
  }
}
