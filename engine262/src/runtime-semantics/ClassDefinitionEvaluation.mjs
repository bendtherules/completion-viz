import { surroundingAgent } from '../engine.mjs';
import { Value, Type } from '../value.mjs';
import { Evaluate } from '../evaluator.mjs';
import {
  Get,
  GetValue,
  IsConstructor,
  MakeConstructor,
  MakeClassConstructor,
  SetFunctionName,
  CreateMethodProperty,
  OrdinaryObjectCreate,
} from '../abstract-ops/all.mjs';
import {
  IsStatic,
  ConstructorMethod,
  NonConstructorMethodDefinitions,
} from '../static-semantics/all.mjs';
import { Parser } from '../parser/Parser.mjs';
import { NewDeclarativeEnvironment } from '../environment.mjs';
import {
  Q, X,
  AbruptCompletion,
  Completion,
} from '../completion.mjs';
import {
  DefineMethod,
  PropertyDefinitionEvaluation,
} from './all.mjs';

function parseMethodDefinition(sourceText) {
  const parser = new Parser({ source: sourceText });
  return parser.scope.with({ superCall: true }, () => parser.parseMethodDefinition());
}

// ClassTail : ClassHeritage? `{` ClassBody? `}`
export function* ClassDefinitionEvaluation(ClassTail, classBinding, className) {
  const { ClassHeritage, ClassBody } = ClassTail;
  // 1. Let env be the LexicalEnvironment of the running execution context.
  const env = surroundingAgent.runningExecutionContext.LexicalEnvironment;
  // 2. Let classScope be NewDeclarativeEnvironment(env).
  const classScope = NewDeclarativeEnvironment(env);
  // 3. If classBinding is not undefined, then
  if (classBinding !== Value.undefined) {
    // a. Perform classScopeEnv.CreateImmutableBinding(classBinding, true).
    classScope.CreateImmutableBinding(classBinding, Value.true);
  }
  let protoParent;
  let constructorParent;
  // 4. If ClassHeritage is not present, then
  if (!ClassHeritage) {
    // a. Let protoParent be %Object.prototype%.
    protoParent = surroundingAgent.intrinsic('%Object.prototype%');
    // b. Let constructorParent be %Function.prototype%.
    constructorParent = surroundingAgent.intrinsic('%Function.prototype%');
  } else { // 5. Else,
    // a. Set the running execution context's LexicalEnvironment to classScope.
    surroundingAgent.runningExecutionContext.LexicalEnvironment = classScope;
    // b. Let superclassRef be the result of evaluating ClassHeritage.
    const superclassRef = yield* Evaluate(ClassHeritage);
    // c. Set the running execution context's LexicalEnvironment to env.
    surroundingAgent.runningExecutionContext.LexicalEnvironment = env;
    // d. Let superclass be ? GetValue(superclassRef).
    const superclass = Q(GetValue(superclassRef));
    // e. If superclass is null, then
    if (superclass === Value.null) {
      // i. Let protoParent be null.
      protoParent = Value.null;
      // ii. Let constructorParent be %Function.prototype%.
      constructorParent = surroundingAgent.intrinsic('%Function.prototype%');
    } else if (IsConstructor(superclass) === Value.false) {
      // f. Else if IsConstructor(superclass) is false, throw a TypeError exception.
      return surroundingAgent.Throw('TypeError', 'NotAConstructor', superclass);
    } else { // g. Else,
      // i. Let protoParent be ? Get(superclass, "prototype").
      protoParent = Q(Get(superclass, new Value('prototype')));
      // ii. If Type(protoParent) is neither Object nor Null, throw a TypeError exception.
      if (Type(protoParent) !== 'Object' && Type(protoParent) !== 'Null') {
        return surroundingAgent.Throw('TypeError', 'ObjectPrototypeType');
      }
      // iii. Let constructorParent be superclass.
      constructorParent = superclass;
    }
  }
  // 6. Let proto be OrdinaryObjectCreate(protoParent).
  const proto = OrdinaryObjectCreate(protoParent);
  let constructor;
  // 7. If ClassBody is not present, let constructor be empty.
  if (!ClassBody) {
    constructor = undefined;
  } else { // 8. Else, let constructor be ConstructorMethod of ClassBody.
    constructor = ConstructorMethod(ClassBody);
  }
  // 9. If constructor is empty, then
  if (constructor === undefined) {
    // a. If ClassHeritage is present, then
    if (ClassHeritage) {
      // i. Set constructor to the result of parsing the source text
      //    `constructor(...args) { super(...args); } using the syntactic grammar with the goal
      //    symbol MethodDefinition[~Yield, ~Await].
      constructor = parseMethodDefinition('constructor(...args) { super(...args); }');
    } else { // b. Else,
      // i. Set constructor to the result of parsing the source text `constructor() {}` using the
      //    syntactic grammar with the goal symbol MethodDefinition[~Yield, ~Await].
      constructor = parseMethodDefinition('constructor() {}');
    }
  }
  // 10. Set the running execution context's LexicalEnvironment to classScope.
  surroundingAgent.runningExecutionContext.LexicalEnvironment = classScope;
  // 11. Let constructorInfo be ! DefineMethod of constructor with arguments proto and constructorParent.
  const constructorInfo = X(yield* DefineMethod(constructor, proto, constructorParent));
  // 12. Let F be constructorInfo.[[Closure]].
  const F = constructorInfo.Closure;
  // 13. Perform SetFunctionName(F, className).
  SetFunctionName(F, className);
  // 14. Perform MakeConstructor(F, false, proto).
  MakeConstructor(F, Value.false, proto);
  // 15. If ClassHeritage is present, set F.[[ConstructorKind]] to derived.
  if (ClassHeritage) {
    F.ConstructorKind = 'derived';
  }
  // 16. Perform MakeClassConstructor(F).
  MakeClassConstructor(F);
  // 17. Perform CreateMethodProperty(proto, "constructor", F).
  X(CreateMethodProperty(proto, new Value('constructor'), F));
  // 18. If ClassBody is not present, let methods be a new empty List.
  let methods;
  if (!ClassBody) {
    methods = [];
  } else { // 19. Else, let methods be NonConstructorMethodDefinitions of ClassBody.
    methods = NonConstructorMethodDefinitions(ClassBody);
  }
  // 20. For each ClassElement m in order from methods, do
  for (const m of methods) {
    let status;
    // a. If IsStatic of m is false, then
    if (IsStatic(m) === false) {
      // i. Let status be PropertyDefinitionEvaluation of m with arguments proto and false.
      status = yield* PropertyDefinitionEvaluation(m, proto, Value.false);
    } else { // b. Else,
      // i. Let status be PropertyDefinitionEvaluation of m with arguments F and false.
      status = yield* PropertyDefinitionEvaluation(m, F, Value.false);
    }
    // c. If status is an abrupt completion, then
    if (status instanceof AbruptCompletion) {
      // i. Set the running execution context's LexicalEnvironment to env.
      surroundingAgent.runningExecutionContext.LexicalEnvironment = env;
      // ii. Return Completion(status).
      return Completion(status);
    }
  }
  // 21. Set the running execution context's LexicalEnvironment to env.
  surroundingAgent.runningExecutionContext.LexicalEnvironment = env;
  // 22. If classBinding is not undefined, then
  if (classBinding !== Value.undefined) {
    // a. Perform classScope.InitializeBinding(classBinding, F).
    classScope.InitializeBinding(classBinding, F);
  }
  // 23. Return F.
  return F;
}
