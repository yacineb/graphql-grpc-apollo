const ENDODING = "utf8";

export function serialize(msg: any) {
  return Buffer.from(JSON.stringify(msg), ENDODING);
}

export function deserialize(msg: Buffer) {
  if (msg) {
    return JSON.parse(msg.toString(ENDODING));
  }
}
