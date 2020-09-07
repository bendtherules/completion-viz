import { Evaluate } from '../evaluator.mjs';
import {
  GetValue,
  ToBoolean,
} from '../abstract-ops/all.mjs';
import {
  Completion,
  EnsureCompletion,
  NormalCompletion,
  Q,
  UpdateEmpty,
} from '../completion.mjs';
import { Value } from '../value.mjs';

// 13.6.7 #sec-if-statement-runtime-semantics-evaluation
//   IfStatement :
//     `if` `(` Expression `)` Statement `else` Statement
//     `if` `(` Expression `)` Statement
export function* Evaluate_IfStatement({
  test: Expression,
  consequent: Statement,
  alternate: AlternateStatement,
}) {
  const exprRef = yield* Evaluate(Expression);
  const exprValue = ToBoolean(Q(GetValue(exprRef)));

  if (AlternateStatement !== null) {
    let stmtCompletion;
    if (exprValue === Value.true) {
      stmtCompletion = EnsureCompletion(yield* Evaluate(Statement));
    } else {
      stmtCompletion = EnsureCompletion(yield* Evaluate(AlternateStatement));
    }
    return Completion(UpdateEmpty(stmtCompletion, Value.undefined));
  } else {
    if (exprValue === Value.false) {
      return new NormalCompletion(Value.undefined);
    } else {
      const stmtCompletion = EnsureCompletion(yield* Evaluate(Statement));
      return Completion(UpdateEmpty(stmtCompletion, Value.undefined));
    }
  }
}
