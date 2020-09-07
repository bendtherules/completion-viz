import { surroundingAgent } from '../engine.mjs';
import { Value } from '../value.mjs';
import {
  IsCallable,
  OrdinaryCreateFromConstructor,
  Call,
  Get,
  GetIterator,
  IteratorStep,
  IteratorValue,
  IteratorClose,
} from '../abstract-ops/all.mjs';
import { Q, AbruptCompletion } from '../completion.mjs';
import { BootstrapConstructor } from './Bootstrap.mjs';

// #sec-weakset-iterable
function WeakSetConstructor([iterable = Value.undefined], { NewTarget }) {
  // 1. If NewTarget is undefined, throw a TypeError exception.
  if (NewTarget === Value.undefined) {
    return surroundingAgent.Throw('TypeError', 'ConstructorNonCallable', this);
  }
  // 2. Let set be ? OrdinaryCreateFromConstructor(NewTarget, "%WeakSet.prototype%", « [[WeakSetData]] »).
  const set = Q(OrdinaryCreateFromConstructor(NewTarget, '%WeakSet.prototype%', ['WeakSetData']));
  // 3. Set set.[[WeakSetData]] to a new empty List.
  set.WeakSetData = [];
  // 4. If iterable is either undefined or null, return set.
  if (iterable === Value.undefined || iterable === Value.null) {
    return set;
  }
  // 5. Let adder be ? Get(set, "add").
  const adder = Q(Get(set, new Value('add')));
  // 6. If IsCallable(adder) is false, throw a TypeError exception.
  if (IsCallable(adder) === Value.false) {
    return surroundingAgent.Throw('TypeError', 'NotAFunction', adder);
  }
  // 7. Let iteratorRecord be ? GetIterator(iterable).
  const iteratorRecord = Q(GetIterator(iterable));
  // 8. Repeat,
  while (true) {
    // a. Let next be ? IteratorStep(iteratorRecord).
    const next = Q(IteratorStep(iteratorRecord));
    // b. If next is false, return set.
    if (next === Value.false) {
      return set;
    }
    // c. Let nextValue be ? IteratorValue(next).
    const nextValue = Q(IteratorValue(next));
    // d. Let status be Call(adder, set, « nextValue »).
    const status = Call(adder, set, [nextValue]);
    // e. If status is an abrupt completion, return ? IteratorClose(iteratorRecord, status).
    if (status instanceof AbruptCompletion) {
      return Q(IteratorClose(iteratorRecord, status));
    }
  }
}

export function BootstrapWeakSet(realmRec) {
  const c = BootstrapConstructor(realmRec, WeakSetConstructor, 'WeakSet', 0, realmRec.Intrinsics['%WeakSet.prototype%'], []);
  realmRec.Intrinsics['%WeakSet%'] = c;
}
