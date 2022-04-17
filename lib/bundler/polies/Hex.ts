export function encodeToHex(what: Uint8Array, addPrefix = true) {
  const unPrefixedHexEncoding = [...what]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");

  return addPrefix ? `0x${unPrefixedHexEncoding}` : unPrefixedHexEncoding;
}
