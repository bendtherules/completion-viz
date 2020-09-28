import { Node } from "acorn";
import {
  Agent,
  Realm,
  Abstract,
  Value,
  inspect,
  Completion,
} from "../engine262/dist/engine262";

import { CompletionRecord } from "../types/engine262-stubs";
import { completionMapping } from "./completionMapping";

export function runEngine(code: string) {
  completionMapping.reset();

  const agent = new Agent({
    onNodeEvaluationComplete({
      Production: node,
      Result: result,
    }: {
      Production: Node;
      Result: CompletionRecord;
    }) {
      if (result instanceof Completion) {
        console.log({ node, result });
        completionMapping.addCompletion({ node, result });
      }
    },
    // onDebugger() {},
    // ensureCanCompileStrings() {},
    // hasSourceTextAvailable() {},
    // onNodeEvaluation() {},
    // features: [],
  });
  agent.enter();

  const realm = new Realm({});

  // Add print function from host
  const print = new Value(realm, (args: any[]) => {
    console.log(...args.map((tmp) => inspect(tmp)));
    return (Value as any).undefined;
  });
  Abstract.CreateDataProperty(realm.global, new Value(realm, "print"), print);

  /* Actual code here */
  realm.evaluateScript(code);
}
