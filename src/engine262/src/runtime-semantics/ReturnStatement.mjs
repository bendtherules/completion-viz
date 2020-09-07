import { Value } from '../value.mjs';
import {
  Await, Q,
  ReturnCompletion,
  X,
} from '../completion.mjs';
import {
  GetGeneratorKind,
  GetValue,
} from '../abstract-ops/all.mjs';
import { Evaluate } from '../evaluator.mjs';

// 13.10.1 #sec-return-statement-runtime-semantics-evaluation
export function* Evaluate_ReturnStatement({ argument: Expression }) {
  if (Expression === null) {
    // ReturnStatement : return `;`
    return new ReturnCompletion(Value.undefined);
  } else {
    // ReturnStatement : return Expression `;`
    const exprRef = yield* Evaluate(Expression);
    let exprValue = Q(GetValue(exprRef));
    if (X(GetGeneratorKind()) === 'async') {
      exprValue = Q(yield* Await(exprValue));
    }
    return new ReturnCompletion(exprValue);
  }
}
