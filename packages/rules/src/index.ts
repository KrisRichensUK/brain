export type LogicNode =
  | { op: "AND" | "OR"; children: LogicNode[] }
  | { source: string; field: string; equals: string | boolean | number };

export type CompositePolicy = {
  name: string;
  mode: "check" | "composite";
  logicTree: LogicNode;
  token: { expiresInSeconds: number; format: "qr" | "nfc" };
};
