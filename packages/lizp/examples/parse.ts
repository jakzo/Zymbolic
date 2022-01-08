import fs from "fs";
import path from "path";
import util from "util";

import { evaluate, parse } from "../src";

const source = fs.readFileSync(path.join(__dirname, "example.fz"), "utf8");
const ast = parse(source);
console.log(util.inspect(ast, undefined, Infinity, true));
const output = evaluate(ast, [8]);
console.log(output);
