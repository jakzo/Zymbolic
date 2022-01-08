/* eslint-disable @typescript-eslint/ban-ts-comment */
import fs from "fs";
import path from "path";

import nearley from "nearley";
// @ts-expect-error
import compile from "nearley/lib/compile";
// @ts-expect-error
import generate from "nearley/lib/generate";
// @ts-expect-error
import nearleyGrammar from "nearley/lib/nearley-language-bootstrapped";

export const compileGrammar = (
  grammarSource: string
): nearley.CompiledRules => {
  const grammarParser = new nearley.Parser(nearleyGrammar);
  grammarParser.feed(grammarSource);

  const module = { exports: {} };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  eval(generate(compile(grammarParser.results[0], {}), "grammar"));

  return module.exports as nearley.CompiledRules;
};

export const grammar = compileGrammar(
  fs.readFileSync(path.join(__dirname, "grammar.ne"), "utf8")
);

export const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
