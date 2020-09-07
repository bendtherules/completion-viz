import { Value } from '../value.mjs';

// 7.1.3.1.1 #sec-runtime-semantics-mv-s
//   StringNumericLiteral :::
//     [empty]
//     StrWhiteSpace
//     StrWhiteSpace_opt StrNumericLiteral StrWhiteSpace_opt
export function MV_StringNumericLiteral(StringNumericLiteral) {
  return new Value(Number(StringNumericLiteral));
}
