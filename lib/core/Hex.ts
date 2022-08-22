export function encodeToHex(what: Uint8Array, addPrefix = true) {
  const unPrefixedHexEncoding = Buffer.from(what).toString("hex");

  return addPrefix ? `0x${unPrefixedHexEncoding}` : unPrefixedHexEncoding;
}

export function decodeFromHex(text: string) {
  const str = text.startsWith("0x") ? text.substring(2) : text;
  return Buffer.from(str, "hex");
}
