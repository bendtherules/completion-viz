import { Value } from '../value.mjs';
import { ResolveBinding } from '../abstract-ops/all.mjs';
import { Q } from '../completion.mjs';

// 12.1.6 #sec-identifiers-runtime-semantics-evaluation
// IdentifierReference :
//   Identifier
//   yield
//   await
export function Evaluate_Identifier(Identifier) {
  return Q(ResolveBinding(new Value(Identifier.name), undefined, Identifier.strict));
}
