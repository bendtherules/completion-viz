import React from "react";
import Highlight, { defaultProps } from "prism-react-renderer";

import {
  TgetLineProps,
  TgetTokenProps,
  StyleObj,
  Token,
} from "../../types/prism-types";

import { sourceMapping } from "../../logic/sourceMapping";
import {
  completionMapping,
  ICompletionDetail,
} from "../../logic/completionMapping";

function getCompletionFromSourceToken(
  matcheeToken: Token
): ICompletionDetail | null {
  const matchingSourceDetails = sourceMapping.mappingArray.find(
    ({ token: tmpToken }) => matcheeToken === tmpToken
  );
  if (matchingSourceDetails === undefined) {
    return null;
  }

  const { start: sourceStart, end: sourceEnd } = matchingSourceDetails;

  let closestCompletion: ICompletionDetail | null = null;
  let closestMatchScore = -Infinity;

  completionMapping.completionDetails.forEach((tmpCompletionDetails) => {
    const { start: compStart, end: compEnd } = tmpCompletionDetails;
    const sourceLen = sourceEnd - sourceStart;
    const compLen = compEnd - compStart;

    // If not intersecting at all, ignore
    if (compEnd < sourceStart || compStart > sourceEnd) {
      return;
    }

    const intersectionStart = Math.max(sourceStart, compStart);
    const intersectionEnd = Math.min(sourceEnd, compEnd);

    const intersectionDistance = intersectionEnd - intersectionStart;
    // Exclusion =  Total Len - (2 * intersection)
    const exclusionDistance = sourceLen + compLen - intersectionDistance;

    const score = intersectionDistance - exclusionDistance;
    if (score >= closestMatchScore) {
      closestCompletion = tmpCompletionDetails;
      closestMatchScore = score;
    }
  });

  return closestCompletion;
}

interface IPreRendererProps {
  className: string;
  style: StyleObj;
  tokens: Token[][];
  getLineProps: TgetLineProps;
  getTokenProps: TgetTokenProps;
}
function PreRenderer({
  className,
  style,
  tokens,
  getLineProps,
  getTokenProps,
}: IPreRendererProps) {
  sourceMapping.reset();
  return (
    <pre className={`${className} px-4 py-2 overflow-auto`} style={style}>
      {tokens.map((line, i) => (
        <LineRenderer
          key={i}
          line={line}
          getLineProps={getLineProps}
          getTokenProps={getTokenProps}
        />
      ))}
    </pre>
  );
}

interface ILineRendererProps {
  line: Token[];
  getLineProps: TgetLineProps;
  getTokenProps: TgetTokenProps;
}
function LineRenderer({
  line,
  getLineProps,
  getTokenProps,
}: ILineRendererProps) {
  return (
    <div {...getLineProps({ line })}>
      {/* Refactor into TokenRenderer */}
      {line.map((token, i) => (
        <TokenRenderer
          key={i}
          token={token}
          isLastTokenInLine={i === line.length - 1}
          getTokenProps={getTokenProps}
        />
      ))}
    </div>
  );
}

interface ITokenRendererProps {
  token: Token;
  isLastTokenInLine: boolean;
  getTokenProps: TgetTokenProps;
}
function TokenRenderer({
  token,
  isLastTokenInLine,
  getTokenProps,
}: ITokenRendererProps) {
  const refFn = sourceMapping.registerToken(token);
  if (isLastTokenInLine) {
    sourceMapping.registerLineEnd();
  }

  const onClickToken = (tmpToken: Token) => {
    const matchingCompletion = getCompletionFromSourceToken(tmpToken);
    if (matchingCompletion !== null) {
      console.log(
        `Clicked: ${tmpToken.content} => Completion (${matchingCompletion.completionType},${matchingCompletion.completionValueString})`
      );
    }
  };

  return (
    <span
      ref={refFn}
      {...getTokenProps({ token })}
      onClick={() => onClickToken(token)}
    />
  );
}

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
          <PreRenderer
            {...{ className, style, tokens, getLineProps, getTokenProps }}
          />
        )}
      </Highlight>
    </div>
  );
}
