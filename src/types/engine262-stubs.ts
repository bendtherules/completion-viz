export enum CompletionTypes {
  Normal = "normal",
  Return = "return",
  Break = "break",
  Continue = "continue",
  Throw = "throw",
}

export interface CompletionRecord {
  Type: CompletionTypes;
  Value: any;
  // Target: Actually undefined or StringValue
  Target: any;
}
