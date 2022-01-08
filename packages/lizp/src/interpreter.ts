import { BodyNode, ExpressionNode, Node } from "./parser";

interface NullValue {
  type: "null";
}
interface IdentifierValue {
  type: "id";
  id: string;
}
interface NumberValue {
  type: "num";
  value: number;
}
interface ListValue {
  type: "list";
  items: Value[];
}
interface FunctionValue {
  type: "func";
  body: ExpressionNode | InternalFunction;
}
type Value =
  | NullValue
  | IdentifierValue
  | NumberValue
  | ListValue
  | FunctionValue;

interface InternalFunction {
  (args: Value[]): Value;
}

interface CallStackFrame {
  args: Value[];
}

const coerceInt = (num: number): number => num & 0xffff;

const NULL_VALUE: NullValue = { type: "null" };

const ARITHMETIC_BUILTIN = (
  id: string,
  name: string,
  operation: (a: number, b: number) => number
): [string, FunctionValue] => [
  id,
  {
    type: "func",
    body: (args) => ({
      type: "num",
      value: args.reduce((a, b, i) => {
        if (b.type !== "num")
          throw new Error(`${id} can only ${name} numbers but got: ${b.type}`);
        if (i === 0) return b.value;
        return coerceInt(operation(a, b.value));
      }, 0),
    }),
  },
];

export const evaluate = (program: BodyNode, args: number[] = []): ListValue => {
  const callStack: CallStackFrame[] = [
    { args: args.map((value) => ({ type: "num", value })) },
  ];
  const globalVars = new Map<string, Value>([
    [
      "arg",
      {
        type: "func",
        body: ([arg]) => {
          if (arg.type !== "num")
            throw new Error(
              `Arguments must only be referenced by index but got: ${arg.type}`
            );
          const frame = callStack[callStack.length - 1];
          return frame.args[arg.value] ?? NULL_VALUE;
        },
      },
    ],
    ARITHMETIC_BUILTIN("+", "add", (a, b) => a + b),
    ARITHMETIC_BUILTIN("-", "subtract", (a, b) => a - b),
    ARITHMETIC_BUILTIN("*", "multiply", (a, b) => a * b),
    ARITHMETIC_BUILTIN("/", "divide", (a, b) => a / b),
    ARITHMETIC_BUILTIN("%", "modulo", (a, b) => a % b),
    ...program.funcs.map<[string, FunctionValue]>((node) => [
      node.name,
      { type: "func", body: node.body },
    ]),
  ]);

  const lookupVar = (name: string): Value => globalVars.get(name) ?? NULL_VALUE;
  const exec = (node: Node): Value => {
    if (node.type === "body")
      return { type: "list", items: node.args.map(exec) };
    if (node.type === "call") {
      const func = exec(node.func);
      if (func.type !== "func")
        throw new Error(`Tried to call value of type: ${func.type}`);
      const args = node.args.map(exec);
      if (typeof func.body === "function") return func.body(args);
      callStack.push({ args });
      return exec(func.body);
    }
    if (node.type === "id") return lookupVar(node.id);
    if (node.type === "num")
      return { type: "num", value: coerceInt(node.value) };
    if (node.type === "list")
      return { type: "list", items: node.args.map(exec) };
    throw new Error("Unknown node type");
  };
  return exec(program) as ListValue;
};
