import { GetValue } from '../abstract-ops/all.mjs';
import { Evaluate } from '../evaluator.mjs';
import { Await, Q } from '../completion.mjs';

// #prod-AwaitExpression
// AwaitExpression : `await` UnaryExpression
export function* Evaluate_AwaitExpression({ argument: UnaryExpression }) {
  const exprRef = yield* Evaluate(UnaryExpression);
  const value = Q(GetValue(exprRef));
  return Q(yield* Await(value));
}
