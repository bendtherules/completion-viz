import { wellKnownSymbols } from '../value.mjs';
import { BootstrapPrototype } from './Bootstrap.mjs';

// 25.1.2.1 sec-%iteratorprototype%-@@iterator
function IteratorPrototype_iterator(args, { thisValue }) {
  return thisValue;
}

export function BootstrapIteratorPrototype(realmRec) {
  const proto = BootstrapPrototype(realmRec, [
    [wellKnownSymbols.iterator, IteratorPrototype_iterator, 0],
  ], realmRec.Intrinsics['%Object.prototype%']);

  realmRec.Intrinsics['%IteratorPrototype%'] = proto;
}
