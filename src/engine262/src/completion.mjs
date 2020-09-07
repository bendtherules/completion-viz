import { surroundingAgent } from './engine.mjs';
import {
  Assert,
  CreateBuiltinFunction,
  PerformPromiseThen,
  PromiseResolve,
  SetFunctionLength,
} from './abstract-ops/all.mjs';
import { Reference, Value } from './value.mjs';
import { resume } from './helpers.mjs';

// 6.2.3 #sec-completion-record-specification-type
export function Completion(type, value, target) {
  if (new.target === Completion) {
    if (typeof type !== 'string') {
      throw new TypeError('Completion type is not a string');
    }
    this.Type = type;
    this.Value = value;
    this.Target = target;
  }
  return type;
}

// NON-SPEC
Completion.prototype.mark = function mark(m) {
  m(this.Value);
};

// #sec-normalcompletion
export function NormalCompletion(value) {
  return new Completion('normal', value);
}

Object.defineProperty(NormalCompletion, Symbol.hasInstance, {
  value: function hasInstance(v) {
    return v instanceof Completion && v.Type === 'normal';
  },
  writable: true,
  enumerable: false,
  configurable: true,
});

export class AbruptCompletion {
  static [Symbol.hasInstance](v) {
    return v instanceof Completion && v.Type !== 'normal';
  }
}

export class BreakCompletion {
  constructor(target) {
    return new Completion('break', undefined, target);
  }

  static [Symbol.hasInstance](v) {
    return v instanceof Completion && v.Type === 'break';
  }
}

export class ContinueCompletion {
  constructor(target) {
    return new Completion('continue', undefined, target);
  }

  static [Symbol.hasInstance](v) {
    return v instanceof Completion && v.Type === 'continue';
  }
}

// 6.2.3.2 #sec-normalcompletion
export class ReturnCompletion {
  constructor(value) {
    return new Completion('return', value);
  }

  static [Symbol.hasInstance](v) {
    return v instanceof Completion && v.Type === 'return';
  }
}

// 6.2.3.3 #sec-throwcompletion
export function ThrowCompletion(value) {
  return new Completion('throw', value);
}

Object.defineProperty(ThrowCompletion, Symbol.hasInstance, {
  value: function hasInstance(v) {
    return v instanceof Completion && v.Type === 'throw';
  },
  writable: true,
  enumerable: false,
  configurable: true,
});

// 6.2.3.4 #sec-updateempty
export function UpdateEmpty(completionRecord, value) {
  Assert(completionRecord instanceof Completion);
  if (completionRecord.Type === 'return' || completionRecord.Type === 'throw') {
    Assert(completionRecord.Value !== undefined);
  }
  if (completionRecord.Value !== undefined) {
    return completionRecord;
  }
  return new Completion(completionRecord.Type, value, completionRecord.Target);
}

// 5.2.3.3 #sec-returnifabrupt
export function ReturnIfAbrupt() {
  throw new TypeError('ReturnIfAbrupt requires build');
}

// #sec-returnifabrupt-shorthands ? OperationName()
export const Q = ReturnIfAbrupt;

// #sec-returnifabrupt-shorthands ! OperationName()
export function X(val) {
  Assert(!(val instanceof AbruptCompletion));
  if (val instanceof Completion) {
    return val.Value;
  }
  return val;
}

// 25.6.1.1.1 #sec-ifabruptrejectpromise
export function IfAbruptRejectPromise() {
  throw new TypeError('IfAbruptRejectPromise requires build');
}

export function EnsureCompletion(val) {
  if (val instanceof Completion) {
    return val;
  }
  if (val instanceof Reference) {
    return val;
  }
  return new NormalCompletion(val);
}

export function AwaitFulfilledFunctions([value]) {
  const F = surroundingAgent.activeFunctionObject;
  const asyncContext = F.AsyncContext;
  const prevContext = surroundingAgent.runningExecutionContext;
  // Suspend prevContext
  surroundingAgent.executionContextStack.push(asyncContext);
  resume(asyncContext, new NormalCompletion(value));
  Assert(surroundingAgent.runningExecutionContext === prevContext);
  return Value.undefined;
}

function AwaitRejectedFunctions([reason]) {
  const F = surroundingAgent.activeFunctionObject;
  const asyncContext = F.AsyncContext;
  const prevContext = surroundingAgent.runningExecutionContext;
  // Suspend prevContext
  surroundingAgent.executionContextStack.push(asyncContext);
  resume(asyncContext, new ThrowCompletion(reason));
  Assert(surroundingAgent.runningExecutionContext === prevContext);
  return Value.undefined;
}

export function* Await(value) {
  const asyncContext = surroundingAgent.runningExecutionContext;
  const promise = Q(PromiseResolve(surroundingAgent.intrinsic('%Promise%'), value));
  const stepsFulfilled = AwaitFulfilledFunctions;
  const onFulfilled = X(CreateBuiltinFunction(stepsFulfilled, ['AsyncContext']));
  X(SetFunctionLength(onFulfilled, new Value(1)));
  onFulfilled.AsyncContext = asyncContext;
  const stepsRejected = AwaitRejectedFunctions;
  const onRejected = X(CreateBuiltinFunction(stepsRejected, ['AsyncContext']));
  X(SetFunctionLength(onRejected, new Value(1)));
  onRejected.AsyncContext = asyncContext;
  X(PerformPromiseThen(promise, onFulfilled, onRejected));
  surroundingAgent.executionContextStack.pop(asyncContext);
  const completion = yield Value.undefined;
  return completion;
}
