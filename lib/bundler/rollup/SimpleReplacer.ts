// Code heavily inspired and slimed down from the the @rollup/plugin-replace repo

import MagicString from "magic-string";
import { SourceMap } from "rollup";

export class SimpleReplacer {
  private readonly functionValues: any;
  private readonly pattern: RegExp;

  constructor(
    readonly values: { [k: string]: string },
    private readonly sourceMap: boolean = false
  ) {
    this.functionValues = mapToFunctions(values);
    const keys = Object.keys(this.functionValues).sort(longest).map(escape);
    this.pattern = new RegExp(
      `\\b(${keys.join("|")})\\b(?!\\.)(?!\\s*=[^=])`,
      "g"
    );
  }

  public tryReplacing(code, id) {
    const magicString = new MagicString(code);
    if (!this.codeHasReplacements(code, id, magicString)) {
      return null;
    }

    const result: { code: string; map?: SourceMap } = {
      code: magicString.toString(),
    };
    if (this.sourceMap) {
      result.map = magicString.generateMap({ hires: true });
    }
    return result;
  }

  private codeHasReplacements(code, id, magicString) {
    let result = false;
    let match;

    // eslint-disable-next-line no-cond-assign
    while ((match = this.pattern.exec(code))) {
      result = true;

      const start = match.index;
      const end = start + match[0].length;
      const replacement = String(this.functionValues[match[1]](id));
      magicString.overwrite(start, end, replacement);
    }
    return result;
  }
}

function escape(str) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
}

function ensureFunction(functionOrValue) {
  if (typeof functionOrValue === "function") return functionOrValue;
  return () => functionOrValue;
}

function longest(a, b) {
  return b.length - a.length;
}

function mapToFunctions(object) {
  return Object.keys(object).reduce((fns, key) => {
    const functions = Object.assign({}, fns);
    functions[key] = ensureFunction(object[key]);
    return functions;
  }, {});
}
