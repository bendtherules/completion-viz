import React, { useState } from "react";

import { SourceViewer } from "./components/SourceViewer";
import { CompletionViewer } from "./components/CompletionViewer";

import { completionMapping } from "./logic/completionMapping";
import { sourceMapping } from "./logic/sourceMapping";
import { runEngine } from "./logic/runEngine";

import "./tailwind.output.css";
import "./App.css";

const sampleInputCode = `var test = \`asd
World!\`; abc()`;

function App() {
  const [inputCode, setInputCode] = useState<string>(sampleInputCode);

  // useLayoutEffect(() => {
  runEngine(inputCode);
  // }, [inputCode]);

  return (
    <div className="flex flex-col justify-between md:flex-row">
      <div className="flex-1 max-w-half">
        <SourceViewer code={inputCode} onChangeCode={setInputCode} />
      </div>
      <div className="flex-1 max-w-half">
        {/* Separator */}
        {/* <div className="w-2 mx-1 bg-gray-800"></div> */}
        <CompletionViewer
          code={inputCode}
          completionDetails={completionMapping.completionDetails}
          sourceMapping={sourceMapping}
        />
      </div>
    </div>
  );
}

export default App;
