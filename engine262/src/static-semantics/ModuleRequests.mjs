import { StringValue } from './all.mjs';

export function ModuleRequests(node) {
  switch (node.type) {
    case 'Module':
      if (node.ModuleBody) {
        return ModuleRequests(node.ModuleBody);
      }
      return [];
    case 'ModuleBody': {
      const moduleNames = [];
      for (const item of node.ModuleItemList) {
        moduleNames.push(...ModuleRequests(item));
      }
      return moduleNames;
    }
    case 'ImportDeclaration':
      if (node.FromClause) {
        return ModuleRequests(node.FromClause);
      }
      return [StringValue(node.ModuleSpecifier)];
    case 'ExportDeclaration':
      if (node.FromClause) {
        return ModuleRequests(node.FromClause);
      }
      return [];
    case 'StringLiteral':
      return [StringValue(node)];
    default:
      return [];
  }
}
