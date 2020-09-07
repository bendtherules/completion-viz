import { Evaluate_StatementList } from '../evaluator.mjs';

// 14.1.22 #sec-function-definitions-runtime-semantics-evaluation
//   FunctionStatementList : [empty]
//
// (implicit)
//   FunctionStatementList : StatementList
export const Evaluate_FunctionStatementList = Evaluate_StatementList;

// (implicit)
//   FunctionBody : FunctionStatementList
export const Evaluate_FunctionBody = Evaluate_FunctionStatementList;
