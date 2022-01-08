export interface BodyNode {
  type: "body";
  args: ExpressionNode[];
  funcs: FunctionNode[];
}
export interface FunctionNode {
  type: "func";
  name: string;
  body: ExpressionNode;
}
export interface CallNode {
  type: "call";
  func: ExpressionNode;
  args: ExpressionNode[];
}
export interface IdentifierNode {
  type: "id";
  id: string;
}
export interface NumberNode {
  type: "num";
  value: number;
}
export interface ListNode {
  type: "list";
  args: ExpressionNode[];
}
type NestableNode = BodyNode | CallNode | ListNode | FunctionNode;
export type ExpressionNode = CallNode | IdentifierNode | NumberNode | ListNode;
export type Node = BodyNode | FunctionNode | ExpressionNode;

export const parse = (source: string): BodyNode => {
  let srcIdx = 0;
  const take = (regex: RegExp): string | undefined => {
    const match = new RegExp(`^${regex.source}`, "gi").exec(
      source.slice(srcIdx)
    );
    if (match) srcIdx += match[0].length;
    return match ? match[0] : undefined;
  };

  const funcs: FunctionNode[] = [];
  const ast: BodyNode = {
    type: "body",
    args: [],
    funcs,
  };
  const stack: NestableNode[] = [ast];
  const addArg = (value: ExpressionNode): void => {
    const node = stack[stack.length - 1];
    if (node.type === "func") {
      if (node.name === undefined) {
        if (value.type !== "id")
          throw new Error("Function name must be an identifier");
        node.name = value.id;
      } else if (node.body === undefined) {
        node.body = value;
      } else {
        throw new Error("Unexpected node after function body");
      }
    } else if (node.type === "call" && node.func === undefined) {
      node.func = value;
    } else {
      node.args.push(value);
    }
  };

  while (srcIdx < source.length) {
    let token: string | undefined;
    if ((token = take(/\(/))) {
      const node: CallNode = {
        type: "call",
        func: undefined as unknown as ExpressionNode,
        args: [],
      };
      addArg(node);
      stack.push(node);
    } else if ((token = take(/\)/))) {
      const node = stack[stack.length - 1];
      if (node.type !== "call")
        throw new Error("Unexpected function call close");
      if (node.func === undefined)
        throw new Error("Function calls cannot be empty");
      stack.pop();
    } else if ((token = take(/\d+/))) {
      addArg({ type: "num", value: +token });
    } else if ((token = take(/"(?:\\.|.)*"/))) {
      addArg({
        type: "list",
        args: [...token.slice(1, -1).replace(/\\(.)/g, "$1")].map((ch) => ({
          type: "num",
          value: ch.codePointAt(0)!,
        })),
      });
    } else if ((token = take(/\[/))) {
      const node: ListNode = {
        type: "list",
        args: [],
      };
      addArg(node);
      stack.push(node);
    } else if ((token = take(/\]/))) {
      const node = stack[stack.length - 1];
      if (node.type !== "list") throw new Error("Unexpected list close");
      stack.pop();
    } else if ((token = take(/\{/))) {
      if (stack.length > 1)
        throw new Error("Function declarations must be at the top level");
      const node: FunctionNode = {
        type: "func",
        name: undefined as unknown as string,
        body: undefined as unknown as ExpressionNode,
      };
      stack.push(node);
    } else if ((token = take(/\}/))) {
      const node = stack[stack.length - 1];
      if (
        node.type !== "func" ||
        node.name === undefined ||
        node.body === undefined
      )
        throw new Error("Unexpected function declaration close");
      funcs.push(node);
      stack.pop();
    } else if (take(/#[^\n]*/)) {
    } else if ((token = take(/[^0-9\s][^()[\]"\s]*/))) {
      addArg({ type: "id", id: token });
    } else {
      srcIdx++;
    }
  }
  if (stack.length > 1) throw new Error("Unexpected end of source");
  return ast;
};
