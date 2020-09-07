import { surroundingAgent } from '../engine.mjs';
import {
  Assert,
  Call,
  CreateBuiltinFunction,
  Get,
  Invoke,
  IsCallable,
  IsConstructor,
  IsPromise,
  NewPromiseCapability,
  PerformPromiseThen,
  PromiseResolve,
  SetFunctionLength,
  SetFunctionName,
  SpeciesConstructor,
} from '../abstract-ops/all.mjs';
import { Type, Value } from '../value.mjs';
import { Q, ThrowCompletion, X } from '../completion.mjs';
import { BootstrapPrototype } from './Bootstrap.mjs';


function PromiseProto_catch([onRejected = Value.undefined], { thisValue }) {
  const promise = thisValue;
  return Q(Invoke(promise, new Value('then'), [Value.undefined, onRejected]));
}

function ThenFinallyFunctions([value = Value.undefined]) {
  const F = surroundingAgent.activeFunctionObject;
  const onFinally = F.OnFinally;
  Assert(IsCallable(onFinally) === Value.true);
  const result = Q(Call(onFinally, Value.undefined));
  const C = F.Constructor;
  Assert(IsConstructor(C) === Value.true);
  const promise = Q(PromiseResolve(C, result));
  const valueThunk = CreateBuiltinFunction(() => value, []);
  SetFunctionLength(valueThunk, new Value(0));
  SetFunctionName(valueThunk, new Value(''));
  return Q(Invoke(promise, new Value('then'), [valueThunk]));
}

function CatchFinallyFunctions([reason = Value.undefined]) {
  const F = surroundingAgent.activeFunctionObject;
  const onFinally = F.OnFinally;
  Assert(IsCallable(onFinally) === Value.true);
  const result = Q(Call(onFinally, Value.undefined));
  const C = F.Constructor;
  Assert(IsConstructor(C) === Value.true);
  const promise = Q(PromiseResolve(C, result));
  const thrower = CreateBuiltinFunction(() => new ThrowCompletion(reason), []);
  SetFunctionLength(thrower, new Value(0));
  SetFunctionName(thrower, new Value(''));
  return Q(Invoke(promise, new Value('then'), [thrower]));
}

function PromiseProto_finally([onFinally = Value.undefined], { thisValue }) {
  const promise = thisValue;
  if (Type(promise) !== 'Object') {
    return surroundingAgent.Throw('TypeError', 'NotATypeObject', 'Promise', promise);
  }
  const C = SpeciesConstructor(promise, surroundingAgent.intrinsic('%Promise%'));
  Assert(IsConstructor(C) === Value.true);
  let thenFinally;
  let catchFinally;
  if (IsCallable(onFinally) === Value.false) {
    thenFinally = onFinally;
    catchFinally = onFinally;
  } else {
    const stepsThenFinally = ThenFinallyFunctions;
    thenFinally = X(CreateBuiltinFunction(stepsThenFinally, ['Constructor', 'OnFinally']));
    SetFunctionLength(thenFinally, new Value(1));
    SetFunctionName(thenFinally, new Value(''));
    thenFinally.Constructor = C;
    thenFinally.OnFinally = onFinally;
    const stepsCatchFinally = CatchFinallyFunctions;
    catchFinally = X(CreateBuiltinFunction(stepsCatchFinally, ['Constructor', 'OnFinally']));
    SetFunctionLength(catchFinally, new Value(1));
    SetFunctionName(catchFinally, new Value(''));
    catchFinally.Constructor = C;
    catchFinally.OnFinally = onFinally;
  }
  return Q(Invoke(promise, new Value('then'), [thenFinally, catchFinally]));
}

function PromiseProto_then([onFulfilled = Value.undefined, onRejected = Value.undefined], { thisValue }) {
  const promise = thisValue;
  if (IsPromise(promise) === Value.false) {
    return surroundingAgent.Throw('TypeError', 'NotATypeObject', 'Promise', promise);
  }
  const C = Q(SpeciesConstructor(promise, surroundingAgent.intrinsic('%Promise%')));
  const resultCapability = Q(NewPromiseCapability(C));
  return PerformPromiseThen(promise, onFulfilled, onRejected, resultCapability);
}

export function BootstrapPromisePrototype(realmRec) {
  const proto = BootstrapPrototype(realmRec, [
    ['catch', PromiseProto_catch, 1],
    ['finally', PromiseProto_finally, 1],
    ['then', PromiseProto_then, 2],
  ], realmRec.Intrinsics['%Object.prototype%'], 'Promise');

  realmRec.Intrinsics['%Promise.prototype.then%'] = X(Get(proto, new Value('then')));

  realmRec.Intrinsics['%Promise.prototype%'] = proto;
}
