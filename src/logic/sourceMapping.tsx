import { createContext, useContext } from "react";
import { Token } from "../types/prism-types";

export interface TMappingELement {
  token: Token;
  start: number;
  end: number;
  ref: { current: HTMLElement | null };
}

export interface TSourceMapping {
  mappingArray: Array<TMappingELement>;
  lastEnd: number;
  registerToken(t: Token): (ele: HTMLElement | null) => void;
  registerLineEnd: () => void;
  reset: () => void;
  getElementsInRange(start: number, end: number): HTMLElement[];
}

export const sourceMapping: TSourceMapping = {
  mappingArray: [],
  lastEnd: 0,
  registerToken(t: Token) {
    const obj: TMappingELement = {
      token: t,
      start: this.lastEnd,
      end: this.lastEnd + t.content.length,
      ref: { current: null },
    };
    this.mappingArray.push(obj);
    this.lastEnd = this.mappingArray[this.mappingArray.length - 1].end;

    return function updateHTMLElement(ele) {
      obj.ref.current = ele;
    };
  },
  registerLineEnd() {
    this.lastEnd += 1;
    if (this.mappingArray.length > 0) {
      this.mappingArray[this.mappingArray.length - 1].end = this.lastEnd;
    }
  },
  reset() {
    this.mappingArray = [];
    this.lastEnd = 0;
  },
  getElementsInRange(start, end) {
    return [];
  },
};

export const SourceMappingContext = createContext(sourceMapping);

// Context consumer
export const useSourceMapping = () => {
  const value = useContext(SourceMappingContext);

  return value;
};
