import {
  Assert,
  GetIterator,
  IteratorClose,
  PutValue,
  RequireObjectCoercible,
  ResolveBinding,
} from '../abstract-ops/all.mjs';
import {
  isArrayBindingPattern,
  isBindingIdentifier,
  isBindingPattern,
  isBindingRestProperty,
  isObjectBindingPattern,
} from '../ast.mjs';
import {
  Type,
  Value,
} from '../value.mjs';
import {
  NormalCompletion,
  Q,
} from '../completion.mjs';
import { OutOfRange } from '../helpers.mjs';
import {
  IteratorBindingInitialization_ArrayBindingPattern,
  PropertyBindingInitialization_BindingPropertyList,
  RestBindingInitialization_BindingRestProperty,
} from './all.mjs';

// 12.1.5.1 #sec-initializeboundname
export function InitializeBoundName(name, value, environment) {
  Assert(Type(name) === 'String');
  if (Type(environment) !== 'Undefined') {
    const env = environment.EnvironmentRecord;
    env.InitializeBinding(name, value);
    return new NormalCompletion(Value.undefined);
  } else {
    const lhs = ResolveBinding(name, undefined, false);
    return Q(PutValue(lhs, value));
  }
}

// 12.1.5 #sec-identifiers-runtime-semantics-bindinginitialization
//   BindingIdentifier :
//     Identifier
//     `yield`
//     `await`
export function BindingInitialization_BindingIdentifier(BindingIdentifier, value, environment) {
  const name = new Value(BindingIdentifier.name);
  return Q(InitializeBoundName(name, value, environment));
}

// 13.3.3.5 #sec-destructuring-binding-patterns-runtime-semantics-bindinginitialization
//   BindingPattern :
//     ObjectBindingPattern
//     ArrayBindingPattern
export function* BindingInitialization_BindingPattern(BindingPattern, value, environment) {
  switch (true) {
    case isObjectBindingPattern(BindingPattern):
      Q(RequireObjectCoercible(value));
      return yield* BindingInitialization_ObjectBindingPattern(BindingPattern, value, environment);

    case isArrayBindingPattern(BindingPattern): {
      const iteratorRecord = Q(GetIterator(value));
      const result = yield* IteratorBindingInitialization_ArrayBindingPattern(
        BindingPattern, iteratorRecord, environment,
      );
      if (iteratorRecord.Done === Value.false) {
        return Q(IteratorClose(iteratorRecord, result));
      }
      return result;
    }

    default:
      throw new OutOfRange('BindingInitialization_BindingPattern', BindingPattern);
  }
}

// (implicit)
//   ForBinding :
//     BindingIdentifier
//     BindingPattern
export function* BindingInitialization_ForBinding(ForBinding, value, environment) {
  switch (true) {
    case isBindingIdentifier(ForBinding):
      return BindingInitialization_BindingIdentifier(ForBinding, value, environment);

    case isBindingPattern(ForBinding):
      return yield* BindingInitialization_BindingPattern(ForBinding, value, environment);

    default:
      throw new OutOfRange('BindingInitialization_ForBinding', ForBinding);
  }
}

// 13.3.3.5 #sec-destructuring-binding-patterns-runtime-semantics-bindinginitialization
//   ObjectBindingPattern :
//     `{` `}`
//     `{` BindingPropertyList `}`
//     `{` BindingPropertyList `,` `}`
//     `{` BindingRestProperty `}`
//     `{` BindingPropertyList `,` BindingRestProperty `}`
function* BindingInitialization_ObjectBindingPattern(ObjectBindingPattern, value, environment) {
  if (ObjectBindingPattern.properties.length === 0) {
    return new NormalCompletion(undefined);
  }

  let BindingRestProperty;
  let BindingPropertyList = ObjectBindingPattern.properties;
  const last = ObjectBindingPattern.properties[ObjectBindingPattern.properties.length - 1];
  if (isBindingRestProperty(last)) {
    BindingRestProperty = last;
    BindingPropertyList = BindingPropertyList.slice(0, -1);
  }

  const excludedNames = Q(yield* PropertyBindingInitialization_BindingPropertyList(
    BindingPropertyList, value, environment,
  ));
  if (BindingRestProperty === undefined) {
    return new NormalCompletion(undefined);
  }

  return RestBindingInitialization_BindingRestProperty(
    BindingRestProperty, value, environment, excludedNames,
  );
}

export function* BindingInitialization_CatchParameter(CatchParameter, value, environment) {
  switch (true) {
    case isBindingIdentifier(CatchParameter):
      return BindingInitialization_BindingIdentifier(CatchParameter, value, environment);

    case isBindingPattern(CatchParameter):
      return yield* BindingInitialization_BindingPattern(CatchParameter, value, environment);

    default:
      throw new OutOfRange('BindingInitialization_CatchParameter', CatchParameter);
  }
}

// 13.7.5.9 #sec-for-in-and-for-of-statements-runtime-semantics-bindinginitialization
//   ForDeclaration : LetOrConst ForBinding
export function* BindingInitialization_ForDeclaration(ForDeclaration, value, environment) {
  return yield* BindingInitialization_ForBinding(ForDeclaration.declarations[0].id, value, environment);
}
