import {
  Type,
  Value,
} from '../value.mjs';
import {
  surroundingAgent,
} from '../engine.mjs';
import { Assert } from '../abstract-ops/all.mjs';
import { Q } from '../completion.mjs';
import { BootstrapPrototype } from './Bootstrap.mjs';


function thisBooleanValue(value) {
  if (Type(value) === 'Boolean') {
    return value;
  }

  if (Type(value) === 'Object' && 'BooleanData' in value) {
    const b = value.BooleanData;
    Assert(Type(b) === 'Boolean');
    return b;
  }

  return surroundingAgent.Throw('TypeError', 'NotATypeObject', 'Boolean', value);
}

function BooleanProto_toString(argList, { thisValue }) {
  const b = Q(thisBooleanValue(thisValue));
  if (b === Value.true) {
    return new Value('true');
  }
  return new Value('false');
}

function BooleanProto_valueOf(argList, { thisValue }) {
  return Q(thisBooleanValue(thisValue));
}

export function BootstrapBooleanPrototype(realmRec) {
  const proto = BootstrapPrototype(realmRec, [
    ['toString', BooleanProto_toString, 0],
    ['valueOf', BooleanProto_valueOf, 0],
  ], realmRec.Intrinsics['%Object.prototype%']);

  proto.BooleanData = Value.false;

  realmRec.Intrinsics['%Boolean.prototype%'] = proto;
}
