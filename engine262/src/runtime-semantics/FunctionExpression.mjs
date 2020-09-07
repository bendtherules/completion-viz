import { surroundingAgent } from '../engine.mjs';
import { Value } from '../value.mjs';
import {
  OrdinaryFunctionCreate,
  SetFunctionName,
  MakeConstructor,
  sourceTextMatchedBy,
} from '../abstract-ops/all.mjs';
import { StringValue } from '../static-semantics/all.mjs';
import { NewDeclarativeEnvironment } from '../environment.mjs';
import { NamedEvaluation } from './all.mjs';

// #sec-function-definitions-runtime-semantics-evaluation
//   FunctionExpression :
//     `function` `(` FormalParameters `)` `{` FunctionBody `}`
//     `function` BindingIdentifier `(` FormalParameters `)` `{` FunctionBody `}`
export function* Evaluate_FunctionExpression(FunctionExpression) {
  const { BindingIdentifier, FormalParameters, FunctionBody } = FunctionExpression;
  if (!BindingIdentifier) {
    return yield* NamedEvaluation(FunctionExpression, new Value(''));
  }
  // 1. Let scope be the running execution context's LexicalEnvironment.
  const scope = surroundingAgent.runningExecutionContext.LexicalEnvironment;
  // 2. Let funcEnv be NewDeclarativeEnvironment(scope).
  const funcEnv = NewDeclarativeEnvironment(scope);
  // 3. Let name be StringValue of BindingIdentifier.
  const name = StringValue(BindingIdentifier);
  // 4. Perform funcEnv.CreateImmutableBinding(name, false).
  funcEnv.CreateImmutableBinding(name, Value.false);
  // 5. Let sourceText be the source text matched by FunctionExpression.
  const sourceText = sourceTextMatchedBy(FunctionExpression);
  // 6. Let closure be OrdinaryFunctionCreate(%Function.prototype%, sourceText, FormalParameters, FunctionBody, non-lexical-this, funcEnv).
  const closure = OrdinaryFunctionCreate(surroundingAgent.intrinsic('%Function.prototype%'), sourceText, FormalParameters, FunctionBody, 'non-lexical-this', funcEnv);
  // 7. Perform SetFunctionName(closure, name).
  SetFunctionName(closure, name);
  // 8. Perform MakeConstructor(closure).
  MakeConstructor(closure);
  // 9. Perform funcEnv.InitializeBinding(name, closure).
  funcEnv.InitializeBinding(name, closure);
  // 10. Return closure.
  return closure;
}
