import {
  surroundingAgent,
} from '../engine.mjs';
import {
  isTryStatementWithCatch,
  isTryStatementWithFinally,
} from '../ast.mjs';
import {
  BoundNames_CatchParameter,
} from '../static-semantics/all.mjs';
import {
  Value,
} from '../value.mjs';
import {
  AbruptCompletion,
  Completion,
  EnsureCompletion,
  UpdateEmpty,
  X,
} from '../completion.mjs';
import {
  NewDeclarativeEnvironment,
} from '../environment.mjs';
import { OutOfRange } from '../helpers.mjs';
import {
  BindingInitialization_CatchParameter,
  Evaluate_Block,
} from './all.mjs';

// 13.15.7 #sec-runtime-semantics-catchclauseevaluation
//    With parameter thrownValue.
//    Catch :
//      `catch` `(` CatchParameter `)` Block
//      `catch` Block
function* CatchClauseEvaluation({ param: CatchParameter, body: Block }, thrownValue) {
  if (!CatchParameter) {
    //  Catch : `catch` Block
    return yield* Evaluate_Block(Block);
  }

  const oldEnv = surroundingAgent.runningExecutionContext.LexicalEnvironment;
  const catchEnv = NewDeclarativeEnvironment(oldEnv);
  const catchEnvRec = catchEnv.EnvironmentRecord;
  for (const argName of BoundNames_CatchParameter(CatchParameter)) {
    X(catchEnvRec.CreateMutableBinding(new Value(argName), false));
  }
  surroundingAgent.runningExecutionContext.LexicalEnvironment = catchEnv;
  const status = yield* BindingInitialization_CatchParameter(CatchParameter, thrownValue, catchEnv);
  if (status instanceof AbruptCompletion) {
    surroundingAgent.runningExecutionContext.LexicalEnvironment = oldEnv;
    return status;
  }
  const B = yield* Evaluate_Block(Block);
  surroundingAgent.runningExecutionContext.LexicalEnvironment = oldEnv;
  return B;
}

// (implicit)
//   Finally : `finally` Block
const Evaluate_Finally = Evaluate_Block;

// 13.15.8 #sec-try-statement-runtime-semantics-evaluation
//   TryStatement : `try` Block Catch
function* Evaluate_TryStatement_Catch(Block, Catch) {
  const B = EnsureCompletion(yield* Evaluate_Block(Block));
  let C;
  if (B.Type === 'throw') {
    C = EnsureCompletion(yield* CatchClauseEvaluation(Catch, B.Value));
  } else {
    C = B;
  }
  return Completion(UpdateEmpty(C, Value.undefined));
}

// 13.15.8 #sec-try-statement-runtime-semantics-evaluation
//   TryStatement : `try` Block Finally
function* Evaluate_TryStatement_Finally(Block, Finally) {
  const B = EnsureCompletion(yield* Evaluate_Block(Block));
  let F = EnsureCompletion(yield* Evaluate_Finally(Finally));
  if (F.Type === 'normal') {
    F = B;
  }
  return Completion(UpdateEmpty(F, Value.undefined));
}

// 13.15.8 #sec-try-statement-runtime-semantics-evaluation
//   TryStatement : `try` Block Catch Finally
function* Evaluate_TryStatement_CatchFinally(Block, Catch, Finally) {
  const B = EnsureCompletion(yield* Evaluate_Block(Block));
  let C;
  if (B.Type === 'throw') {
    C = EnsureCompletion(yield* CatchClauseEvaluation(Catch, B.Value));
  } else {
    C = B;
  }
  let F = EnsureCompletion(yield* Evaluate_Finally(Finally));
  if (F.Type === 'normal') {
    F = C;
  }
  return Completion(UpdateEmpty(F, Value.undefined));
}

// 13.15.8 #sec-try-statement-runtime-semantics-evaluation
export function* Evaluate_TryStatement(Expression) {
  switch (true) {
    case isTryStatementWithCatch(Expression) && isTryStatementWithFinally(Expression):
      return yield* Evaluate_TryStatement_CatchFinally(
        Expression.block, Expression.handler, Expression.finalizer,
      );
    case isTryStatementWithCatch(Expression):
      return yield* Evaluate_TryStatement_Catch(Expression.block, Expression.handler);
    case isTryStatementWithFinally(Expression):
      return yield* Evaluate_TryStatement_Finally(Expression.block, Expression.finalizer);

    default:
      throw new OutOfRange('Evaluate_TryStatement', Expression);
  }
}
