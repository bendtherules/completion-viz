import React from "react";
import Highlight, { defaultProps } from "prism-react-renderer";

import { sourceMapping } from "../../logic/sourceMapping";

import "./SourceViewer.css";

interface ISourceViewerProps {
  code: string;
  onChangeCode(newCode: string): void;
}

export function SourceViewer(props: ISourceViewerProps) {
  const { code } = props;
  return (
    <Highlight {...defaultProps} code={code} language="jsx">
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        // eslint-disable-next-line no-sequences
        sourceMapping.reset(),
        (
          <pre className={className} style={style}>
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
  );
}
