import React, { useState } from "react";

import { SourceViewer } from "./components/SourceViewer";
import { CompletionViewer } from "./components/CompletionViewer";

import { useCompletionMapping } from "./logic/completionMapping";
import { runEngine } from "./logic/runEngine";

import "./tailwind.output.css";
import "./App.css";

const sampleInputCode = `var test = \`asd
World!\`; abc()`;

function App() {
  const [inputCode, setInputCode] = useState<string>(sampleInputCode);
  const completionMapping = useCompletionMapping();

  // useLayoutEffect(() => {
  runEngine(inputCode);
  // }, [inputCode]);

  return (
    <div className="flex flex-col md:m-auto md:flex-row md:max-w-screen-lg">
      <div className="flex-1 md:max-w-half">
        <SourceViewer code={inputCode} onChangeCode={setInputCode} />
      </div>
      <div className="flex-1 md:max-w-half">
        {/* Separator */}
        {/* <div className="w-2 mx-1 bg-gray-800"></div> */}
        <CompletionViewer
          code={inputCode}
          completionDetails={completionMapping.completionDetails}
        />
      </div>
    </div>
  );
}

export default App;
