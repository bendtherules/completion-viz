import { Token } from "../types/prism-types";

interface TMappingELement {
  start: number;
  end: number;
  ref: { current: HTMLElement | null };
}

interface TSourceMapping {
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
      start: this.lastEnd,
      end: this.lastEnd + t.content.length,
      ref: { current: null },
    };
    this.mappingArray.push(obj);
    this.lastEnd = this.mappingArray[this.mappingArray.length - 1].end;

    console.log(obj, t);
    

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