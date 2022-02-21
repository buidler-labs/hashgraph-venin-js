export function encodeToHex(what: Uint8Array, addPrefix = true) {
  const unPrefixedHexEncoding = Buffer.from(what).toString("hex");

  return addPrefix ? `0x${unPrefixedHexEncoding}` : unPrefixedHexEncoding;
}
