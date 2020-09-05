import React from "react";
import Highlight, { defaultProps } from "prism-react-renderer";

import { sourceMapping } from "./sourceMapping";

import "./tailwind.output.css";

import "./App.css";

const exampleCode = `var test = \`asd
World!\`; abc()`;

function App() {
  return (
    <div>
      <Highlight {...defaultProps} code={exampleCode} language="jsx">
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          sourceMapping.reset(),
          (
            <pre className={className} style={style}>
              {tokens.map((line, i) => (
                <div
                  data-line={JSON.stringify(line)}
                  {...getLineProps({ line, key: i })}
                >
                  {line.map(function (token, key) {
                    const refFn = sourceMapping.registerToken(token);
                    return (
                      <span
                        ref={refFn}
                        data-token={JSON.stringify(token)}
                        {...getTokenProps({ token, key })}
                      />
                    );
                  })}
                  {(sourceMapping.registerLineEnd(), null)}
                </div>
              ))}
            </pre>
          )
        )}
      </Highlight>
    </div>
  );
}

export default App;
