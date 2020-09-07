import {
  isArrayBindingPattern,
  isBindingElement,
  isBindingIdentifier,
  isBindingIdentifierAndInitializer,
  isBindingPattern,
  isBindingPatternAndInitializer,
  isBindingProperty,
  isBindingPropertyWithColon,
  isBindingPropertyWithSingleNameBinding,
  isBindingRestElement,
  isBindingRestProperty,
  isClassDeclaration,
  isDeclaration,
  isExportDeclaration,
  isExportDeclarationWithDeclaration,
  isExportDeclarationWithDefaultAndClass,
  isExportDeclarationWithDefaultAndExpression,
  isExportDeclarationWithDefaultAndHoistable,
  isExportDeclarationWithExport,
  isExportDeclarationWithExportAndFrom,
  isExportDeclarationWithStar,
  isExportDeclarationWithVariable,
  isFormalParameter,
  isFunctionRestParameter,
  isHoistableDeclaration,
  isImportDeclaration,
  isImportDeclarationWithClause,
  isImportDeclarationWithSpecifierOnly,
  isLexicalDeclaration,
  isObjectBindingPattern,
  isSingleNameBinding,
} from '../ast.mjs';
import { OutOfRange } from '../helpers.mjs';

// 12.1.2 #sec-identifiers-static-semantics-boundnames
//   BindingIdentifier :
//     Identifier
//     `yield`
//     `await`
export function BoundNames_BindingIdentifier(BindingIdentifier) {
  return [BindingIdentifier.name];
}

// 13.3.1.2 #sec-let-and-const-declarations-static-semantics-boundnames
//   LexicalDeclaration : LetOrConst BindingList `;`
//   BindingList : BindingList `,` LexicalBinding
//   LexicalBinding :
//     BindingIdentifier Initializer
//     BindingPattern Initializer
//
// (implicit)
//   BindingList : LexicalBinding
export function BoundNames_LexicalDeclaration(LexicalDeclaration) {
  const names = [];
  for (const declarator of LexicalDeclaration.declarations) {
    switch (true) {
      case isBindingIdentifier(declarator.id):
        names.push(...BoundNames_BindingIdentifier(declarator.id));
        break;
      case isBindingPattern(declarator.id):
        names.push(...BoundNames_BindingPattern(declarator.id));
        break;
      default:
        throw new OutOfRange('BoundNames_LexicalDeclaration', LexicalDeclaration);
    }
  }
  return names;
}

// 13.3.2.1 #sec-variable-statement-static-semantics-boundnames
//   VariableDeclarationList : VariableDeclarationList `,` VariableDeclaration
//
// (implicit)
//   VariableDeclarationList : VariableDeclaration
export function BoundNames_VariableDeclarationList(VariableDeclarationList) {
  const names = [];
  for (const VariableDeclaration of VariableDeclarationList) {
    names.push(...BoundNames_VariableDeclaration(VariableDeclaration));
  }
  return names;
}

// 13.3.2.1 #sec-variable-statement-static-semantics-boundnames
//   VariableDeclaration :
//     BindingIdentifier Initializer
//     BindingPattern Initializer
export function BoundNames_VariableDeclaration(VariableDeclaration) {
  switch (true) {
    // FIXME: This condition is a hack, formalize it
    case VariableDeclaration.id === undefined:
      return [VariableDeclaration.name];
    case isBindingIdentifier(VariableDeclaration.id):
      return BoundNames_BindingIdentifier(VariableDeclaration.id);
    case isBindingPattern(VariableDeclaration.id):
      return BoundNames_BindingPattern(VariableDeclaration.id);
    default:
      throw new OutOfRange('BoundNames_VariableDeclaration', VariableDeclaration);
  }
}

// (implicit)
//   VariableStatement : `var` VariableDeclarationList `;`
export function BoundNames_VariableStatement(VariableStatement) {
  return BoundNames_VariableDeclarationList(VariableStatement.declarations);
}

// 13.3.3.1 #sec-destructuring-binding-patterns-static-semantics-boundnames
//   SingleNameBinding : BindingIdentifier Initializer
//
// (implicit)
//   SingleNameBinding : BindingIdentifier
export function BoundNames_SingleNameBinding(SingleNameBinding) {
  switch (true) {
    case isBindingIdentifier(SingleNameBinding):
      return BoundNames_BindingIdentifier(SingleNameBinding);
    case isBindingIdentifierAndInitializer(SingleNameBinding):
      return BoundNames_BindingIdentifier(SingleNameBinding.left);
    default:
      throw new OutOfRange('BoundNames_SingleNameBinding', SingleNameBinding);
  }
}

// 13.3.3.1 #sec-destructuring-binding-patterns-static-semantics-boundnames
//   BindingElement : BindingPattern Initializer
//
// (implicit)
//   BindingElement :
//     SingleNameBinding
//     BindingPattern
export function BoundNames_BindingElement(BindingElement) {
  switch (true) {
    case isSingleNameBinding(BindingElement):
      return BoundNames_SingleNameBinding(BindingElement);
    case isBindingPattern(BindingElement):
      return BoundNames_BindingPattern(BindingElement);
    case isBindingPatternAndInitializer(BindingElement):
      return BoundNames_BindingPattern(BindingElement.left);
    default:
      throw new OutOfRange('BoundNames_BindingElement', BindingElement);
  }
}

// (implicit)
//   BindingRestElement :
//     `...` BindingIdentifier
//     `...` BindingPattern
export function BoundNames_BindingRestElement(BindingRestElement) {
  switch (true) {
    case isBindingIdentifier(BindingRestElement.argument):
      return BoundNames_BindingIdentifier(BindingRestElement.argument);
    case isBindingPattern(BindingRestElement.argument):
      return BoundNames_BindingPattern(BindingRestElement.argument);
    default:
      throw new OutOfRange('BoundNames_BindingRestElement argument', BindingRestElement.argument);
  }
}

// 13.3.3.1 #sec-destructuring-binding-patterns-static-semantics-boundnames
//   ArrayBindingPattern :
//     `[` Elision `]`
//     `[` Elision BindingRestElement `]`
//     `[` BindingElementList `,` Elision `]`
//     `[` BindingElementList `,` Elision BindingRestElement `]`
//   BindingElementList : BindingElementList `,` BindingElisionElement
//   BindingElisionElement : Elision BindingElement
export function BoundNames_ArrayBindingPattern(ArrayBindingPattern) {
  const names = [];
  for (const BindingElisionElementOrBindingRestElement of ArrayBindingPattern.elements) {
    switch (true) {
      case BindingElisionElementOrBindingRestElement === null:
        // This is an elision.
        break;

      case isBindingElement(BindingElisionElementOrBindingRestElement): {
        const BindingElement = BindingElisionElementOrBindingRestElement;
        names.push(...BoundNames_BindingElement(BindingElement));
        break;
      }
      case isBindingRestElement(BindingElisionElementOrBindingRestElement): {
        const BindingRestElement = BindingElisionElementOrBindingRestElement;
        names.push(...BoundNames_BindingRestElement(BindingRestElement));
        break;
      }
      default:
        throw new OutOfRange('BoundNames_ArrayBindingPattern element', BindingElisionElementOrBindingRestElement);
    }
  }
  return names;
}

// 13.3.3.1 #sec-destructuring-binding-patterns-static-semantics-boundnames
//   BindingProperty : PropertyName `:` BindingElement
//
// (implicit)
//   BindingProperty : SingleNameBinding
export function BoundNames_BindingProperty(BindingProperty) {
  switch (true) {
    case isBindingPropertyWithSingleNameBinding(BindingProperty):
      return BoundNames_SingleNameBinding(BindingProperty.value);
    case isBindingPropertyWithColon(BindingProperty):
      return BoundNames_BindingElement(BindingProperty.value);
    default:
      throw new OutOfRange('BoundNames_BindingProperty', BindingProperty);
  }
}

// (implicit)
//   BindingRestProperty : `...` BindingIdentifier
export function BoundNames_BindingRestProperty(BindingRestProperty) {
  if (!isBindingIdentifier(BindingRestProperty.argument)) {
    throw new OutOfRange('BoundNames_BindingRestProperty argument', BindingRestProperty.argument);
  }
  return BoundNames_BindingIdentifier(BindingRestProperty.argument);
}

// 13.3.3.1 #sec-destructuring-binding-patterns-static-semantics-boundnames
//   ObjectBindingPattern :
//     `{` `}`
//     `{` BindingRestProperty `}`
//   BindingPropertyList : BindingPropertyList `,` BindingProperty
//
// (implicit)
//   ObjectBindingPattern :
//     `{` BindingPropertyList `}`
//     `{` BindingPropertyList `,` `}`
//     `{` BindingPropertyList `,` BindingRestProperty `}`
function BoundNames_ObjectBindingPattern(ObjectBindingPattern) {
  const names = [];
  for (const BindingPropertyOrBindingRestProperty of ObjectBindingPattern.properties) {
    switch (true) {
      case isBindingProperty(BindingPropertyOrBindingRestProperty): {
        const BindingProperty = BindingPropertyOrBindingRestProperty;
        names.push(...BoundNames_BindingProperty(BindingProperty));
        break;
      }
      case isBindingRestProperty(BindingPropertyOrBindingRestProperty): {
        const BindingRestProperty = BindingPropertyOrBindingRestProperty;
        names.push(...BoundNames_BindingRestProperty(BindingRestProperty));
        break;
      }
      default:
        throw new OutOfRange('BoundNames_ObjectBindingPattern property', BindingPropertyOrBindingRestProperty);
    }
  }
  return names;
}

// (implicit)
//   BindingPattern :
//     ObjectBindingPattern
//     ArrayBindingPattern
function BoundNames_BindingPattern(BindingPattern) {
  switch (true) {
    case isObjectBindingPattern(BindingPattern):
      return BoundNames_ObjectBindingPattern(BindingPattern);
    case isArrayBindingPattern(BindingPattern):
      return BoundNames_ArrayBindingPattern(BindingPattern);
    default:
      throw new OutOfRange('BoundNames_BindingPattern', BindingPattern);
  }
}

// 13.7.5.2 #sec-for-in-and-for-of-statements-static-semantics-boundnames
//   ForDeclaration : LetOrConst ForBinding
export function BoundNames_ForDeclaration(ForDeclaration) {
  const ForBinding = ForDeclaration.declarations[0].id;
  return BoundNames_ForBinding(ForBinding);
}

function BoundNames_BindingIdentifierOrBindingPattern(
  targetTypeForErrorMessage,
  BindingIdentifierOrBindingPattern,
) {
  switch (true) {
    case isBindingIdentifier(BindingIdentifierOrBindingPattern):
      return BoundNames_BindingIdentifier(BindingIdentifierOrBindingPattern);
    case isBindingPattern(BindingIdentifierOrBindingPattern):
      return BoundNames_BindingPattern(BindingIdentifierOrBindingPattern);
    default:
      throw new OutOfRange(`BoundNames_BindingIdentifierOrBindingPattern ${targetTypeForErrorMessage}`, BindingIdentifierOrBindingPattern);
  }
}

// (implicit)
//   ForBinding :
//     BindingIdentifier
//     BindingPattern
export function BoundNames_ForBinding(node) {
  return BoundNames_BindingIdentifierOrBindingPattern('ForBinding', node);
}

// (implicit)
//   CatchParameter :
//     BindingIdentifier
//     BindingPattern
export function BoundNames_CatchParameter(node) {
  return BoundNames_BindingIdentifierOrBindingPattern('CatchParameter', node);
}

// (implicit)
//   FormalParameter : BindingElement
export const BoundNames_FormalParameter = BoundNames_BindingElement;

// (implicit)
//   FunctionRestParameter : BindingRestElement
export const BoundNames_FunctionRestParameter = BoundNames_BindingRestElement;

// 14.1.3 #sec-function-definitions-static-semantics-boundnames
//   FormalParameters :
//     [empty]
//     FormalParameterList `,` FunctionRestParameter
//
//   FormalParameterList :
//     FormalParameterList `,` FormalParameter
//
// (implicit)
//   FormalParameters :
//     FunctionRestParameter
//     FormalParameterList
//     FormalParameterList `,`
//
//   FormalParameterList : FormalParameter
export function BoundNames_FormalParameters(FormalParameters) {
  const names = [];
  for (const FormalParameterOrFunctionRestParameter of FormalParameters) {
    switch (true) {
      case isFormalParameter(FormalParameterOrFunctionRestParameter):
        names.push(...BoundNames_FormalParameter(FormalParameterOrFunctionRestParameter));
        break;

      case isFunctionRestParameter(FormalParameterOrFunctionRestParameter):
        names.push(...BoundNames_FunctionRestParameter(FormalParameterOrFunctionRestParameter));
        break;

      default:
        throw new OutOfRange('BoundNames_FormalParameters element', FormalParameterOrFunctionRestParameter);
    }
  }
  return names;
}

// 14.1.3 #sec-function-definitions-static-semantics-boundnames
//   FunctionDeclaration :
//     `function` BindingIdentifier `(` FormalParameters `)` `{` FunctionBody `}`
//     `function` `(` FormalParameters `)` `{` FunctionBody `}`
//
// 14.4.2 #sec-generator-function-definitions-static-semantics-boundnames
//   GeneratorDeclaration :
//     `function` `*` BindingIdentifier `(` FormalParameters `)` `{` GeneratorBody `}`
//     `function` `*` `(` FormalParameters `)` `{` GeneratorBody `}`
//
// 14.5.2 #sec-async-generator-function-definitions-static-semantics-boundnames
//   AsyncGeneratorDeclaration :
//     `async` `function` `*` BindingIdentifier `(` FormalParameters `)` `{` AsyncGeneratorBody `}`
//     `async` `function` `*` `(` FormalParameters `)` `{` AsyncGeneratorBody `}`
//
// 14.7.2 #sec-async-function-definitions-static-semantics-BoundNames
//   AsyncFunctionDeclaration :
//     `async` [no LineTerminator here] `function` BindingIdentifier `(` FormalParameters `)`
//       `{` AsyncFunctionBody `}`
//     `async` [no LineTerminator here] `function` `(` FormalParameters `)`
//       `{` AsyncFunctionBody `}`
//
// (implicit)
//   HoistableDeclaration :
//     FunctionDeclaration
//     GeneratorDeclaration
//     AsyncFunctionDeclaration
//     AsyncGeneratorDeclaration
export function BoundNames_HoistableDeclaration(HoistableDeclaration) {
  if (HoistableDeclaration.id === null) {
    return ['*default*'];
  }
  return BoundNames_BindingIdentifier(HoistableDeclaration.id);
}

export const BoundNames_FunctionDeclaration = BoundNames_HoistableDeclaration;
export const BoundNames_GeneratorDeclaration = BoundNames_HoistableDeclaration;
export const BoundNames_AsyncFunctionDeclaration = BoundNames_HoistableDeclaration;
export const BoundNames_AsyncGeneratorDeclaration = BoundNames_HoistableDeclaration;

// 14.6.2 #sec-class-definitions-static-semantics-boundnames
//   ClassDeclaration :
//     `class` BindingIdentifier ClassTail
//     `class` ClassTail
export function BoundNames_ClassDeclaration(ClassDeclaration) {
  if (ClassDeclaration.id === null) {
    return ['*default*'];
  }
  return BoundNames_BindingIdentifier(ClassDeclaration.id);
}

// (implicit)
//   Declaration :
//     HoistableDeclaration
//     ClassDeclaration
//     LexicalDeclaration
export function BoundNames_Declaration(Declaration) {
  switch (true) {
    case isHoistableDeclaration(Declaration):
      return BoundNames_HoistableDeclaration(Declaration);
    case isClassDeclaration(Declaration):
      return BoundNames_ClassDeclaration(Declaration);
    case isLexicalDeclaration(Declaration):
      return BoundNames_LexicalDeclaration(Declaration);
    default:
      throw new OutOfRange('BoundNames_Declaration', Declaration);
  }
}

// (implict)
//   ImportedBinding : BindingIdentifier
export const BoundNames_ImportedBinding = BoundNames_BindingIdentifier;

// 15.2.2.2 #sec-imports-static-semantics-boundnames
//   ImportDeclaration :
//     `import` ImportClause FromClause `;`
//     `import` ModuleSpecifier `;`
export function BoundNames_ImportDeclaration(ImportDeclaration) {
  switch (true) {
    case isImportDeclarationWithClause(ImportDeclaration):
      // return BoundNames_ImportClause(ImportDeclaration.specifiers);
      return ImportDeclaration.specfiers.map((s) => s.local);

    case isImportDeclarationWithSpecifierOnly(ImportDeclaration):
      return [];

    default:
      throw new OutOfRange('BoundNames_ImportDeclaration', ImportDeclaration);
  }
}

// 15.2.3.2 #sec-exports-static-semantics-boundnames
//   ExportDeclaration :
//     `export` `*` FromClause `;`
//     `export` ExportClause FromClause `;`
//     `export` ExportClause `;`
//     `export` VariableStatement
//     `export` Declaration
//     `export` `default` HoistableDeclaration
//     `export` `default` ClassDeclaration
//     `export` `default` AssignmentExpression `;`
export function BoundNames_ExportDeclaration(ExportDeclaration) {
  switch (true) {
    case isExportDeclarationWithStar(ExportDeclaration):
    case isExportDeclarationWithExportAndFrom(ExportDeclaration):
    case isExportDeclarationWithExport(ExportDeclaration):
      return [];
    case isExportDeclarationWithVariable(ExportDeclaration):
      return BoundNames_VariableStatement(ExportDeclaration.declaration);
    case isExportDeclarationWithDeclaration(ExportDeclaration):
      return BoundNames_Declaration(ExportDeclaration.declaration);
    case isExportDeclarationWithDefaultAndHoistable(ExportDeclaration): {
      const declarationNames = BoundNames_HoistableDeclaration(ExportDeclaration.declaration);
      if (!declarationNames.includes('*default*')) {
        declarationNames.push('*default*');
      }
      return declarationNames;
    }
    case isExportDeclarationWithDefaultAndClass(ExportDeclaration): {
      const declarationNames = BoundNames_ClassDeclaration(ExportDeclaration.declaration);
      if (!declarationNames.includes('*default*')) {
        declarationNames.push('*default*');
      }
      return declarationNames;
    }
    case isExportDeclarationWithDefaultAndExpression(ExportDeclaration):
      return ['*default*'];
    default:
      throw new OutOfRange('BoundNames_ExportDeclaration', ExportDeclaration);
  }
}

// (implicit)
//   ModuleItem :
//     ImportDeclaration
//     ExportDeclaration
//     StatementListItem
//
//   StatementListItem : Declaration
export function BoundNames_ModuleItem(ModuleItem) {
  switch (true) {
    case isImportDeclaration(ModuleItem):
      return BoundNames_ImportDeclaration(ModuleItem);

    case isExportDeclaration(ModuleItem):
      return BoundNames_ExportDeclaration(ModuleItem);

    case isDeclaration(ModuleItem):
      return BoundNames_Declaration(ModuleItem);

    default:
      throw new OutOfRange('BoundNames_ModuleItem', ModuleItem);
  }
}
