import React, { useState, useLayoutEffect } from "react";

import { SourceViewer } from "./components/SourceViewer";
import { CompletionViewer } from "./components/CompletionViewer";
import { completionMapping } from "./logic/completionMapping";
import { runEngine } from "./logic/runEngine";

import "./tailwind.output.css";
import "./App.css";

const sampleInputCode = `var test = \`asd
World!\`; abc()`;

function App() {
  const [inputCode, setInputCode] = useState<string>(sampleInputCode);

  useLayoutEffect(() => {
    runEngine(inputCode);
  }, [inputCode]);

  return (
    <div>
      <SourceViewer code={inputCode} onChangeCode={setInputCode} />
    </div>
  );
}

export default App;
