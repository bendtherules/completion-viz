import React from "react";
import Highlight, { defaultProps } from "prism-react-renderer";

interface IInlineResultViewerProps {
  code: string;
  className: string;
}

export function InlineResultViewer(props: IInlineResultViewerProps) {
  const { code, className: classNameFromProps } = props;
  return (
    <Highlight {...defaultProps} code={code} language="javascript">
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${className} ${classNameFromProps} overflow-auto`}
          style={style}
        >
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}
