import {
  Completion,
  EnsureCompletion,
  NormalCompletion,
  ReturnIfAbrupt,
  UpdateEmpty,
} from './completion.mjs';
import {
  isActualAdditiveExpression,
  isActualAssignmentExpression,
  isActualBitwiseANDExpression,
  isActualBitwiseORExpression,
  isActualBitwiseXORExpression,
  isActualCallExpression,
  isActualCoalesceExpression,
  isActualConditionalExpression,
  isActualEqualityExpression,
  isActualExponentiationExpression,
  isActualLogicalANDExpression,
  isActualLogicalORExpression,
  isActualMemberExpression,
  isActualMultiplicativeExpression,
  isActualNewExpression,
  isActualRelationalExpression,
  isActualShiftExpression,
  isActualUnaryExpression,
  isActualUpdateExpression,
  isArrayLiteral,
  isArrowFunction,
  isAsyncArrowFunction,
  isAsyncFunctionExpression,
  isAsyncGeneratorExpression,
  isAwaitExpression,
  isBlockStatement,
  isBreakStatement,
  isBreakableStatement,
  isClassDeclaration,
  isClassExpression,
  isContinueStatement,
  isDebuggerStatement,
  isDeclaration,
  isEmptyStatement,
  isExportDeclaration,
  isExpression,
  isExpressionStatement,
  isExpressionWithComma,
  isFunctionExpression,
  isImportCall,
  isGeneratorExpression,
  isHoistableDeclaration,
  isIdentifierReference,
  isIfStatement,
  isImportDeclaration,
  isLabelledStatement,
  isLexicalDeclaration,
  isLiteral,
  isMetaProperty,
  isObjectLiteral,
  isOptionalExpression,
  isParenthesizedExpression,
  isRegularExpressionLiteral,
  isReturnStatement,
  isStatement,
  isSuperCall,
  isSuperProperty,
  isTaggedTemplate,
  isTemplateLiteral,
  isThis,
  isThrowStatement,
  isTryStatement,
  isVariableStatement,
  isWithStatement,
  isYieldExpression,
} from './ast.mjs';
import {
  EvaluateBinopValues_AdditiveExpression_Minus,
  EvaluateBinopValues_AdditiveExpression_Plus,
  EvaluateBinopValues_BitwiseANDExpression,
  EvaluateBinopValues_BitwiseORExpression,
  EvaluateBinopValues_BitwiseXORExpression,
  EvaluateBinopValues_ExponentiationExpression,
  EvaluateBinopValues_MultiplicativeExpression,
  EvaluateBinopValues_ShiftExpression,
  Evaluate_AdditiveExpression,
  Evaluate_ArrayLiteral,
  Evaluate_ArrowFunction,
  Evaluate_AssignmentExpression,
  Evaluate_AsyncArrowFunction,
  Evaluate_AsyncFunctionExpression,
  Evaluate_AsyncGeneratorExpression,
  Evaluate_AwaitExpression,
  Evaluate_BinaryBitwiseExpression,
  Evaluate_BlockStatement,
  Evaluate_BreakStatement,
  Evaluate_BreakableStatement,
  Evaluate_CallExpression,
  Evaluate_ClassDeclaration,
  Evaluate_ClassExpression,
  Evaluate_CoalesceExpression,
  Evaluate_ConditionalExpression,
  Evaluate_ContinueStatement,
  Evaluate_DebuggerStatement,
  Evaluate_EmptyStatement,
  Evaluate_EqualityExpression,
  Evaluate_ExponentiationExpression,
  Evaluate_ExpressionWithComma,
  Evaluate_ExportDeclaration,
  Evaluate_FunctionExpression,
  Evaluate_GeneratorExpression,
  Evaluate_HoistableDeclaration,
  Evaluate_Identifier,
  Evaluate_IfStatement,
  Evaluate_ImportCall,
  Evaluate_LabelledStatement,
  Evaluate_LexicalDeclaration,
  Evaluate_Literal,
  Evaluate_LogicalANDExpression,
  Evaluate_LogicalORExpression,
  Evaluate_MemberExpression,
  Evaluate_MetaProperty,
  Evaluate_MultiplicativeExpression,
  Evaluate_NewExpression,
  Evaluate_ObjectLiteral,
  Evaluate_OptionalExpression,
  Evaluate_RegularExpressionLiteral,
  Evaluate_RelationalExpression,
  Evaluate_ReturnStatement,
  Evaluate_ShiftExpression,
  Evaluate_SuperCall,
  Evaluate_SuperProperty,
  Evaluate_TaggedTemplate,
  Evaluate_TemplateLiteral,
  Evaluate_ThisExpression,
  Evaluate_ThrowStatement,
  Evaluate_TryStatement,
  Evaluate_UnaryExpression,
  Evaluate_UpdateExpression,
  Evaluate_VariableStatement,
  Evaluate_WithStatement,
  Evaluate_YieldExpression,
} from './runtime-semantics/all.mjs';
import { Value } from './value.mjs';
import { GetValue } from './abstract-ops/all.mjs';
import { surroundingAgent } from './engine.mjs';
import { unwind, OutOfRange } from './helpers.mjs';

// 13.2.13 #sec-block-runtime-semantics-evaluation
//   StatementList : StatementList StatementListItem
//
// (implicit)
//   StatementList : StatementListItem
export function* Evaluate_StatementList(StatementList) {
  if (StatementList.length === 0) {
    return new NormalCompletion(undefined);
  }

  let sl = yield* Evaluate(StatementList[0]);
  if (StatementList.length === 1) {
    return sl;
  }

  for (const StatementListItem of StatementList.slice(1)) {
    ReturnIfAbrupt(sl);
    let s = yield* Evaluate(StatementListItem);
    // We don't always return a Completion value, but here we actually need it
    // to be a Completion.
    s = EnsureCompletion(s);
    sl = UpdateEmpty(s, sl);
  }

  return sl;
}

// 15.2.1.23 #sec-module-semantics-runtime-semantics-evaluation
//   ModuleItemList :
//     ModuleItem
//     ModuleItemList ModuleItem
export function* Evaluate_ModuleItemList(ModuleItemList) {
  let sl = yield* Evaluate(ModuleItemList[0]);
  if (ModuleItemList.length === 1) {
    return sl;
  }

  for (const ModuleItemListItem of ModuleItemList.slice(1)) {
    ReturnIfAbrupt(sl);
    let s = yield* Evaluate(ModuleItemListItem);
    // We don't always return a Completion value, but here we actually need it
    // to be a Completion.
    s = EnsureCompletion(s);
    sl = UpdateEmpty(s, sl);
  }

  return sl;
}

// (implicit)
//   StatementListItem :
//     Statement
//     Declaration
//
//   Statement :
//     BlockStatement
//     ExpressionStatement
//     VariableStatement
//     EmptyStatement
//     ExpressionStatement
//     IfStatement
//     BreakableStatement
//     ContinueStatement
//     BreakStatement
//     ReturnStatement
//     WithStatement
//     LabelledStatement
//     ThrowStatement
//     TryStatement
//     DebuggerStatement
//
//   Declaration :
//     HoistableDeclaration
//     ClassDeclaration
//     LexicalDeclaration
function* Evaluate_StatementListItem(StatementListItem) {
  switch (true) {
    case isBlockStatement(StatementListItem):
      return yield* Evaluate_BlockStatement(StatementListItem);

    case isVariableStatement(StatementListItem):
      return yield* Evaluate_VariableStatement(StatementListItem);

    case isEmptyStatement(StatementListItem):
      return Evaluate_EmptyStatement(StatementListItem);

    case isExpressionStatement(StatementListItem):
      return yield* Evaluate_ExpressionStatement(StatementListItem);

    case isIfStatement(StatementListItem):
      return yield* Evaluate_IfStatement(StatementListItem);

    case isBreakableStatement(StatementListItem):
      return yield* Evaluate_BreakableStatement(StatementListItem);

    case isContinueStatement(StatementListItem):
      return Evaluate_ContinueStatement(StatementListItem);

    case isBreakStatement(StatementListItem):
      return Evaluate_BreakStatement(StatementListItem);

    case isReturnStatement(StatementListItem):
      return yield* Evaluate_ReturnStatement(StatementListItem);

    case isWithStatement(StatementListItem):
      return yield* Evaluate_WithStatement(StatementListItem);

    case isLabelledStatement(StatementListItem):
      return yield* Evaluate_LabelledStatement(StatementListItem);

    case isThrowStatement(StatementListItem):
      return yield* Evaluate_ThrowStatement(StatementListItem.argument);

    case isTryStatement(StatementListItem):
      return yield* Evaluate_TryStatement(StatementListItem);

    case isDebuggerStatement(StatementListItem):
      return Evaluate_DebuggerStatement(StatementListItem);

    case isHoistableDeclaration(StatementListItem):
      return Evaluate_HoistableDeclaration(StatementListItem);

    case isClassDeclaration(StatementListItem):
      return yield* Evaluate_ClassDeclaration(StatementListItem);

    case isLexicalDeclaration(StatementListItem):
      return yield* Evaluate_LexicalDeclaration(StatementListItem);

    default:
      throw new OutOfRange('Evaluate_StatementListItem', StatementListItem);
  }
}

export const Evaluate_Statement = Evaluate_StatementListItem;

// 13.5.1 #sec-expression-statement-runtime-semantics-evaluation
//   ExpressionStatement : Expression `;`
function* Evaluate_ExpressionStatement(ExpressionStatement) {
  const exprRef = yield* Evaluate(ExpressionStatement.expression);
  return GetValue(exprRef);
}

export function EvaluateBinopValues(operator, lval, rval) {
  switch (operator) {
    case '*':
    case '/':
    case '%':
      return EvaluateBinopValues_MultiplicativeExpression(operator, lval, rval);

    case '+':
      return EvaluateBinopValues_AdditiveExpression_Plus(lval, rval);

    case '-':
      return EvaluateBinopValues_AdditiveExpression_Minus(lval, rval);

    case '<<':
    case '>>':
    case '>>>':
      return EvaluateBinopValues_ShiftExpression(operator, lval, rval);

    case '&':
      return EvaluateBinopValues_BitwiseANDExpression(lval, rval);
    case '^':
      return EvaluateBinopValues_BitwiseXORExpression(lval, rval);
    case '|':
      return EvaluateBinopValues_BitwiseORExpression(lval, rval);

    case '**':
      return EvaluateBinopValues_ExponentiationExpression(lval, rval);

    default:
      throw new OutOfRange('EvaluateBinopValues', operator);
  }
}

export function* Evaluate_Expression(Expression) {
  return EnsureCompletion(yield* Inner_Evaluate_Expression(Expression));
}

// (implicit)
function* Inner_Evaluate_Expression(Expression) {
  switch (true) {
    case isThis(Expression):
      return Evaluate_ThisExpression(Expression);

    case isIdentifierReference(Expression):
      return Evaluate_Identifier(Expression);

    case isLiteral(Expression):
      return Evaluate_Literal(Expression);

    case isArrayLiteral(Expression):
      return yield* Evaluate_ArrayLiteral(Expression);

    case isObjectLiteral(Expression):
      return yield* Evaluate_ObjectLiteral(Expression);

    case isFunctionExpression(Expression):
      return Evaluate_FunctionExpression(Expression);

    case isClassExpression(Expression):
      return yield* Evaluate_ClassExpression(Expression);

    case isGeneratorExpression(Expression):
      return Evaluate_GeneratorExpression(Expression);

    case isAsyncFunctionExpression(Expression):
      return Evaluate_AsyncFunctionExpression(Expression);

    case isAsyncGeneratorExpression(Expression):
      return Evaluate_AsyncGeneratorExpression(Expression);

    case isRegularExpressionLiteral(Expression):
      return Evaluate_RegularExpressionLiteral(Expression);

    case isTemplateLiteral(Expression):
      return yield* Evaluate_TemplateLiteral(Expression);

    case isActualMemberExpression(Expression):
      return yield* Evaluate_MemberExpression(Expression);

    case isOptionalExpression(Expression):
      return yield* Evaluate_OptionalExpression(Expression);

    case isSuperProperty(Expression):
      return yield* Evaluate_SuperProperty(Expression);

    case isSuperCall(Expression):
      return yield* Evaluate_SuperCall(Expression);

    case isImportCall(Expression):
      return yield* Evaluate_ImportCall(Expression);

    case isTaggedTemplate(Expression):
      return yield* Evaluate_TaggedTemplate(Expression);

    case isMetaProperty(Expression):
      return yield* Evaluate_MetaProperty(Expression);

    case isActualNewExpression(Expression):
      return yield* Evaluate_NewExpression(Expression);

    case isActualCallExpression(Expression):
      return yield* Evaluate_CallExpression(Expression);

    case isActualUpdateExpression(Expression):
      return yield* Evaluate_UpdateExpression(Expression);

    case isActualUnaryExpression(Expression):
      return yield* Evaluate_UnaryExpression(Expression);

    case isAwaitExpression(Expression):
      return yield* Evaluate_AwaitExpression(Expression);

    case isActualExponentiationExpression(Expression):
      return yield* Evaluate_ExponentiationExpression(Expression);

    case isActualMultiplicativeExpression(Expression):
      return yield* Evaluate_MultiplicativeExpression(Expression);

    case isActualAdditiveExpression(Expression):
      return yield* Evaluate_AdditiveExpression(Expression);

    case isActualShiftExpression(Expression):
      return yield* Evaluate_ShiftExpression(Expression);

    case isActualRelationalExpression(Expression):
      return yield* Evaluate_RelationalExpression(Expression);

    case isActualEqualityExpression(Expression):
      return yield* Evaluate_EqualityExpression(Expression);

    case isActualBitwiseANDExpression(Expression):
    case isActualBitwiseXORExpression(Expression):
    case isActualBitwiseORExpression(Expression):
      return yield* Evaluate_BinaryBitwiseExpression(Expression);

    case isActualLogicalANDExpression(Expression):
      return yield* Evaluate_LogicalANDExpression(Expression);

    case isActualLogicalORExpression(Expression):
      return yield* Evaluate_LogicalORExpression(Expression);

    case isActualCoalesceExpression(Expression):
      return yield* Evaluate_CoalesceExpression(Expression);

    case isActualConditionalExpression(Expression):
      return yield* Evaluate_ConditionalExpression(Expression);

    case isYieldExpression(Expression):
      return yield* Evaluate_YieldExpression(Expression);

    case isArrowFunction(Expression):
      return Evaluate_ArrowFunction(Expression);

    case isAsyncArrowFunction(Expression):
      return Evaluate_AsyncArrowFunction(Expression);

    case isActualAssignmentExpression(Expression):
      return yield* Evaluate_AssignmentExpression(Expression);

    case isExpressionWithComma(Expression):
      return yield* Evaluate_ExpressionWithComma(Expression);

    // 12.2.10.5 #sec-grouping-operator-runtime-semantics-evaluation
    case isParenthesizedExpression(Expression):
      return yield* Evaluate(Expression.expression);

    default:
      throw new OutOfRange('Evaluate_Expression', Expression);
  }
}

// 15.1.7 #sec-script-semantics-runtime-semantics-evaluation
//   Script : [empty]
//
// (implicit)
//   Script : ScriptBody
//   ScriptBody : StatementList
export function Evaluate_Script(Script) {
  if (Script.length === 0) {
    return new NormalCompletion(Value.undefined);
  }
  return unwind(Evaluate_StatementList(Script));
}

// 15.2.1.23 #sec-module-semantics-runtime-semantics-evaluation
//   ModuleBody : ModuleItemList
export function* Evaluate_ModuleBody(ModuleBody) {
  const ModuleItemList = ModuleBody;
  const result = EnsureCompletion(yield* Evaluate_ModuleItemList(ModuleItemList));
  if (result.Type === 'normal' && result.Value === undefined) {
    return new NormalCompletion(Value.undefined);
  }
  return Completion(result);
}

// 15.2.1.23 #sec-module-semantics-runtime-semantics-evaluation
//   Module : [empty]
//
// (implicit)
//   Module : ModuleBody
export function Evaluate_Module(Module) {
  if (Module.length === 0) {
    return new NormalCompletion(Value.undefined);
  }
  return unwind(Evaluate_ModuleBody(Module));
}

export function* Evaluate(Production) {
  surroundingAgent.runningExecutionContext.callSite.setLocation(Production);

  if (surroundingAgent.hostDefinedOptions.onNodeEvaluation) {
    surroundingAgent.hostDefinedOptions.onNodeEvaluation(Production, surroundingAgent.currentRealmRecord);
  }

  let result;
  switch (true) {
    case isImportDeclaration(Production):
      result = new NormalCompletion(undefined);
      break;
    case isExportDeclaration(Production):
      result = yield* Evaluate_ExportDeclaration(Production);
      break;
    case isStatement(Production):
    case isDeclaration(Production):
      result = yield* Evaluate_Statement(Production);
      break;
    case isExpression(Production):
      result = yield* Evaluate_Expression(Production);
      break;
    default:
      throw new OutOfRange('Evaluate', Production);
  }

  if (surroundingAgent.hostDefinedOptions.onNodeEvaluationComplete) {
    surroundingAgent.hostDefinedOptions.onNodeEvaluationComplete(
      { Production, Result: result },
    );
  }

  return result;
}
