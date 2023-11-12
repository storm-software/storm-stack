import { getWebCrypto } from "./web-crypto";

export const sha256 = (value: string) =>
  getWebCrypto()
    .subtle.digest("SHA-256", new TextEncoder().encode(value))
    .then(h => {
      let hexes = [],
        view = new DataView(h);
      for (let i = 0; i < view.byteLength; i += 4)
        hexes.push(("00000000" + view.getUint32(i).toString(16)).slice(-8));
      return hexes.join("");
    });
