import { surroundingAgent } from '../engine.mjs';
import { OrdinaryFunctionCreate, MakeMethod, sourceTextMatchedBy } from '../abstract-ops/all.mjs';
import { ReturnIfAbrupt } from '../completion.mjs';
import { OutOfRange } from '../helpers.mjs';
import { Evaluate_PropertyName } from './all.mjs';

// #sec-runtime-semantics-definemethod
function* DefineMethod_MethodDefinition(MethodDefinition, object, functionPrototype) {
  const { PropertyName, UniqueFormalParameters, FunctionBody } = MethodDefinition;
  // 1. Let propKey be the result of evaluating PropertyName.
  const propKey = yield* Evaluate_PropertyName(PropertyName);
  // 2. ReturnIfAbrupt(propKey).
  ReturnIfAbrupt(propKey);
  // 3. Let scope be the running execution context's LexicalEnvironment.
  const scope = surroundingAgent.runningExecutionContext.LexicalEnvironment;
  let prototype;
  // 4. If functionPrototype is present as a parameter, then
  if (functionPrototype !== undefined) {
    // a. Let prototype be functionPrototype.
    prototype = functionPrototype;
  } else { // 5. Else,
    // a. Let prototype be %Function.prototype%.
    prototype = surroundingAgent.intrinsic('%Function.prototype%');
  }
  // 6. Let sourceText be the source text matched by MethodDefinition.
  const sourceText = sourceTextMatchedBy(MethodDefinition);
  // 7. Let closure be OrdinaryFunctionCreate(prototype, sourceText, UniqueFormalParameters, FunctionBody, non-lexical-this, scope).
  const closure = OrdinaryFunctionCreate(prototype, sourceText, UniqueFormalParameters, FunctionBody, 'non-lexical-this', scope);
  // 8. Perform MakeMethod(closure, object).
  MakeMethod(closure, object);
  // 9. Return the Record { [[Key]]: propKey, [[Closure]]: closure }.
  return { Key: propKey, Closure: closure };
}

export function DefineMethod(node, object, functionPrototype) {
  switch (node.type) {
    case 'MethodDefinition':
      return DefineMethod_MethodDefinition(node, object, functionPrototype);
    case 'ClassElement':
      return DefineMethod(node.MethodDefinition, object, functionPrototype);
    default:
      throw new OutOfRange('DefineMethod', node);
  }
}
