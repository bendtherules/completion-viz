import { Node } from "acorn";
import {
  Agent,
  setSurroundingAgent,
  ManagedRealm,
  Value,
  CreateDataProperty,
  inspect,
} from "../../engine262/dist/engine262";

import { CompletionRecord } from "../types/engine262-stubs";
import { completionMapping } from "./completionMapping";

export function runEngine(code: string) {
  completionMapping.reset();

  const agent = new Agent({
    onNodeEvaluationComplete({
      node,
      result,
    }: {
      node: Node;
      result: CompletionRecord;
    }) {
      console.log({ node, result });
      completionMapping.addCompletion({ node, result });
    },
    // onDebugger() {},
    // ensureCanCompileStrings() {},
    // hasSourceTextAvailable() {},
    // onNodeEvaluation() {},
    // features: [],
  });
  setSurroundingAgent(agent);

  const realm = new ManagedRealm({
    // promiseRejectionTracker() {},
    // resolveImportedModule() {},
    // getImportMetaProperties() {},
    // finalizeImportMeta() {},
    // randomSeed() {},
  });

  realm.scope(() => {
    // Add print function from host

    // @ts-ignore: new Value has type any
    const print = new Value((args) => {
      console.log(...args.map((tmp: any) => inspect(tmp)));
      return (Value as any).undefined;
    });

    // @ts-ignore: new Value has type any
    CreateDataProperty(realm.GlobalObject, new Value("print"), print);
  });

  realm.evaluateScript(code);
}
