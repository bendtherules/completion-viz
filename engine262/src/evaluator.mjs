import { surroundingAgent } from './engine.mjs';
import { OutOfRange } from './helpers.mjs';
import {
  Evaluate_Script,
  Evaluate_ScriptBody,
  Evaluate_Module,
  Evaluate_ModuleBody,
  Evaluate_ImportDeclaration,
  Evaluate_ExportDeclaration,
  Evaluate_ClassDeclaration,
  Evaluate_LexicalDeclaration,
  Evaluate_FunctionDeclaration,
  Evaluate_HoistableDeclaration,
  Evaluate_Block,
  Evaluate_VariableStatement,
  Evaluate_ExpressionStatement,
  Evaluate_EmptyStatement,
  Evaluate_IfStatement,
  Evaluate_ReturnStatement,
  Evaluate_TryStatement,
  Evaluate_ThrowStatement,
  Evaluate_DebuggerStatement,
  Evaluate_BreakableStatement,
  Evaluate_LabelledStatement,
  Evaluate_ForBinding,
  Evaluate_CaseClause,
  Evaluate_BreakStatement,
  Evaluate_ContinueStatement,
  Evaluate_WithStatement,
  Evaluate_IdentifierReference,
  Evaluate_CommaOperator,
  Evaluate_This,
  Evaluate_Literal,
  Evaluate_ArrayLiteral,
  Evaluate_ObjectLiteral,
  Evaluate_TemplateLiteral,
  Evaluate_ClassExpression,
  Evaluate_FunctionExpression,
  Evaluate_GeneratorExpression,
  Evaluate_AsyncFunctionExpression,
  Evaluate_AsyncGeneratorExpression,
  Evaluate_AdditiveExpression,
  Evaluate_MultiplicativeExpression,
  Evaluate_ExponentiationExpression,
  Evaluate_UpdateExpression,
  Evaluate_ShiftExpression,
  Evaluate_LogicalORExpression,
  Evaluate_LogicalANDExpression,
  Evaluate_BinaryBitwiseExpression,
  Evaluate_RelationalExpression,
  Evaluate_CoalesceExpression,
  Evaluate_EqualityExpression,
  Evaluate_CallExpression,
  Evaluate_NewExpression,
  Evaluate_MemberExpression,
  Evaluate_OptionalExpression,
  Evaluate_TaggedTemplateExpression,
  Evaluate_SuperCall,
  Evaluate_SuperProperty,
  Evaluate_NewTarget,
  Evaluate_ImportMeta,
  Evaluate_ImportCall,
  Evaluate_AwaitExpression,
  Evaluate_YieldExpression,
  Evaluate_ParenthesizedExpression,
  Evaluate_AssignmentExpression,
  Evaluate_UnaryExpression,
  Evaluate_ArrowFunction,
  Evaluate_AsyncArrowFunction,
  Evaluate_ConditionalExpression,
  Evaluate_RegularExpressionLiteral,
  Evaluate_AnyFunctionBody,
  Evaluate_ExpressionBody,
} from './runtime-semantics/all.mjs';

export function* Evaluate(node) {
  surroundingAgent.runningExecutionContext.callSite.setLocation(node);

  if (surroundingAgent.hostDefinedOptions.onNodeEvaluation) {
    surroundingAgent.hostDefinedOptions.onNodeEvaluation(node, surroundingAgent.currentRealmRecord);
  }

  let result;
  switch (node.type) {
    // Language
    case 'Script':
      result = yield* Evaluate_Script(node);
      break;
    case 'ScriptBody':
      result = yield* Evaluate_ScriptBody(node);
      break;
    case 'Module':
      result = yield* Evaluate_Module(node);
      break;
    case 'ModuleBody':
      result = yield* Evaluate_ModuleBody(node);
      break;
    // Statements
    case 'Block':
      result = yield* Evaluate_Block(node);
      break;
    case 'VariableStatement':
      result = yield* Evaluate_VariableStatement(node);
      break;
    case 'EmptyStatement':
      result = Evaluate_EmptyStatement(node);
      break;
    case 'IfStatement':
      result = yield* Evaluate_IfStatement(node);
      break;
    case 'ExpressionStatement':
      result = yield* Evaluate_ExpressionStatement(node);
      break;
    case 'WhileStatement':
    case 'DoWhileStatement':
    case 'SwitchStatement':
    case 'ForStatement':
    case 'ForInStatement':
    case 'ForOfStatement':
    case 'ForAwaitStatement':
      result = yield* Evaluate_BreakableStatement(node);
      break;
    case 'ForBinding':
      result = Evaluate_ForBinding(node);
      break;
    case 'CaseClause':
    case 'DefaultClause':
      result = yield* Evaluate_CaseClause(node);
      break;
    case 'BreakStatement':
      result = Evaluate_BreakStatement(node);
      break;
    case 'ContinueStatement':
      result = Evaluate_ContinueStatement(node);
      break;
    case 'LabelledStatement':
      result = yield* Evaluate_LabelledStatement(node);
      break;
    case 'ReturnStatement':
      result = yield* Evaluate_ReturnStatement(node);
      break;
    case 'ThrowStatement':
      result = yield* Evaluate_ThrowStatement(node);
      break;
    case 'TryStatement':
      result = yield* Evaluate_TryStatement(node);
      break;
    case 'DebuggerStatement':
      result = Evaluate_DebuggerStatement(node);
      break;
    case 'WithStatement':
      result = yield* Evaluate_WithStatement(node);
      break;
    // Declarations
    case 'ImportDeclaration':
      result = Evaluate_ImportDeclaration(node);
      break;
    case 'ExportDeclaration':
      result = yield* Evaluate_ExportDeclaration(node);
      break;
    case 'ClassDeclaration':
      result = yield* Evaluate_ClassDeclaration(node);
      break;
    case 'LexicalDeclaration':
      result = yield* Evaluate_LexicalDeclaration(node);
      break;
    case 'FunctionDeclaration':
      result = Evaluate_FunctionDeclaration(node);
      break;
    case 'GeneratorDeclaration':
    case 'AsyncFunctionDeclaration':
    case 'AsyncGeneratorDeclaration':
      result = Evaluate_HoistableDeclaration(node);
      break;
    // Expressions
    case 'CommaOperator':
      result = yield* Evaluate_CommaOperator(node);
      break;
    case 'ThisExpression':
      result = Evaluate_This(node);
      break;
    case 'IdentifierReference':
      result = Evaluate_IdentifierReference(node);
      break;
    case 'NullLiteral':
    case 'BooleanLiteral':
    case 'NumericLiteral':
    case 'StringLiteral':
      result = Evaluate_Literal(node);
      break;
    case 'ArrayLiteral':
      result = yield* Evaluate_ArrayLiteral(node);
      break;
    case 'ObjectLiteral':
      result = yield* Evaluate_ObjectLiteral(node);
      break;
    case 'FunctionExpression':
      result = yield* Evaluate_FunctionExpression(node);
      break;
    case 'ClassExpression':
      result = yield* Evaluate_ClassExpression(node);
      break;
    case 'GeneratorExpression':
      result = yield* Evaluate_GeneratorExpression(node);
      break;
    case 'AsyncFunctionExpression':
      result = yield* Evaluate_AsyncFunctionExpression(node);
      break;
    case 'AsyncGeneratorExpression':
      result = yield* Evaluate_AsyncGeneratorExpression(node);
      break;
    case 'TemplateLiteral':
      result = yield* Evaluate_TemplateLiteral(node);
      break;
    case 'ParenthesizedExpression':
      result = yield* Evaluate_ParenthesizedExpression(node);
      break;
    case 'AdditiveExpression':
      result = yield* Evaluate_AdditiveExpression(node);
      break;
    case 'MultiplicativeExpression':
      result = yield* Evaluate_MultiplicativeExpression(node);
      break;
    case 'ExponentiationExpression':
      result = yield* Evaluate_ExponentiationExpression(node);
      break;
    case 'UpdateExpression':
      result = yield* Evaluate_UpdateExpression(node);
      break;
    case 'ShiftExpression':
      result = yield* Evaluate_ShiftExpression(node);
      break;
    case 'LogicalORExpression':
      result = yield* Evaluate_LogicalORExpression(node);
      break;
    case 'LogicalANDExpression':
      result = yield* Evaluate_LogicalANDExpression(node);
      break;
    case 'BitwiseANDExpression':
    case 'BitwiseXORExpression':
    case 'BitwiseORExpression':
      result = yield* Evaluate_BinaryBitwiseExpression(node);
      break;
    case 'RelationalExpression':
      result = yield* Evaluate_RelationalExpression(node);
      break;
    case 'CoalesceExpression':
      result = yield* Evaluate_CoalesceExpression(node);
      break;
    case 'EqualityExpression':
      result = yield* Evaluate_EqualityExpression(node);
      break;
    case 'CallExpression':
      result = yield* Evaluate_CallExpression(node);
      break;
    case 'NewExpression':
      result = yield* Evaluate_NewExpression(node);
      break;
    case 'MemberExpression':
      result = yield* Evaluate_MemberExpression(node);
      break;
    case 'OptionalExpression':
      result = yield* Evaluate_OptionalExpression(node);
      break;
    case 'TaggedTemplateExpression':
      result = yield* Evaluate_TaggedTemplateExpression(node);
      break;
    case 'SuperProperty':
      result = yield* Evaluate_SuperProperty(node);
      break;
    case 'SuperCall':
      result = yield* Evaluate_SuperCall(node);
      break;
    case 'NewTarget':
      result = Evaluate_NewTarget(node);
      break;
    case 'ImportMeta':
      result = Evaluate_ImportMeta(node);
      break;
    case 'ImportCall':
      result = yield* Evaluate_ImportCall(node);
      break;
    case 'AssignmentExpression':
      result = yield* Evaluate_AssignmentExpression(node);
      break;
    case 'YieldExpression':
      result = yield* Evaluate_YieldExpression(node);
      break;
    case 'AwaitExpression':
      result = yield* Evaluate_AwaitExpression(node);
      break;
    case 'UnaryExpression':
      result = yield* Evaluate_UnaryExpression(node);
      break;
    case 'ArrowFunction':
      result = yield* Evaluate_ArrowFunction(node);
      break;
    case 'AsyncArrowFunction':
      result = yield* Evaluate_AsyncArrowFunction(node);
      break;
    case 'ConditionalExpression':
      result = yield* Evaluate_ConditionalExpression(node);
      break;
    case 'RegularExpressionLiteral':
      result = Evaluate_RegularExpressionLiteral(node);
      break;
    case 'AsyncFunctionBody':
    case 'GeneratorBody':
    case 'AsyncGeneratorBody':
      result = yield* Evaluate_AnyFunctionBody(node);
      break;
    case 'ExpressionBody':
      result = yield* Evaluate_ExpressionBody(node);
      break;
    default:
      throw new OutOfRange('Evaluate', node);
  }

  if (surroundingAgent.hostDefinedOptions.onNodeEvaluationComplete) {
    surroundingAgent.hostDefinedOptions.onNodeEvaluationComplete(
      { node, result },
    );
  }

  return result;
}
