export const stringToUint8Array = (text: string): Uint8Array =>
  Uint8Array.from(
    [...encodeURIComponent(text)].map(letter => letter.codePointAt(0)!)
  );
