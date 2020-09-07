import { surroundingAgent } from '../engine.mjs';
import { NormalCompletion, EnsureCompletion } from '../completion.mjs';

// #sec-debugger-statement-runtime-semantics-evaluation
// DebuggerStatement : `debugger` `;`
export function Evaluate_DebuggerStatement() {
  let result;
  // 1. If an implementation-defined debugging facility is available and enabled, then
  if (surroundingAgent.hostDefinedOptions.onDebugger) {
    // a. Perform an implementation-defined debugging action.
    // b. Let result be an implementation-defined Completion value.
    result = EnsureCompletion(surroundingAgent.hostDefinedOptions.onDebugger());
  } else {
    // a. Let result be NormalCompletion(empty).
    result = NormalCompletion(undefined);
  }
  // 2. Return result.
  return result;
}
