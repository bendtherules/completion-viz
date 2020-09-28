import React from "react";
import Highlight, { defaultProps } from "prism-react-renderer";

import { sourceMapping } from "../../logic/sourceMapping";

interface ISourceViewerProps {
  code: string;
  onChangeCode(newCode: string): void;
}

export function SourceViewer(props: ISourceViewerProps) {
  const { code } = props;
  return (
    <div>
      {/* Title of code section */}
      <div className="px-4 py-1 bg-gray-200 ">Code</div>
      {/* Code viewer */}
      <Highlight {...defaultProps} code={code} language="jsx">
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          // eslint-disable-next-line no-sequences
          sourceMapping.reset(),
          (
            <pre className={`${className} px-4 py-2 overflow-auto`} style={style}>
              {tokens.map((line, i) => (
                <div {...getLineProps({ line, key: i })}>
                  {line.map(function (token, key) {
                    const refFn = sourceMapping.registerToken(token);
                    return (
                      <span ref={refFn} {...getTokenProps({ token, key })} />
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
