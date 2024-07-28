export const uint8ArrayToString = (arr: Uint8Array): string =>
  decodeURIComponent(Buffer.from(arr).toString("utf8"));
