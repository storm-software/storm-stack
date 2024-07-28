// Based on https://github.com/brix/crypto-js 4.1.1 (MIT)

// Based on https://github.com/brix/crypto-js 4.1.1 (MIT)

export class WordArray {
  words: number[];
  sigBytes: number;

  constructor(words?: number[], sigBytes?: number) {
    words = this.words = words || [];

    this.sigBytes = sigBytes === undefined ? words.length * 4 : sigBytes;
  }

  toString(encoder?: typeof Hex): string {
    return (encoder || Hex).stringify(this);
  }

  concat(wordArray: WordArray) {
    // Clamp excess bits
    this.clamp();

    // Concat
    if (this.sigBytes % 4) {
      // Copy one byte at a time
      for (let i = 0; i < wordArray.sigBytes; i++) {
        const thatByte =
          (wordArray.words[i >>> 2]! >>> (24 - (i % 4) * 8)) & 0xff;
        this.words[(this.sigBytes + i) >>> 2]! |=
          thatByte << (24 - ((this.sigBytes + i) % 4) * 8);
      }
    } else {
      // Copy one word at a time
      for (let j = 0; j < wordArray.sigBytes; j += 4) {
        this.words[(this.sigBytes + j) >>> 2] = wordArray.words[j >>> 2]!;
      }
    }
    this.sigBytes += wordArray.sigBytes;

    // Chainable
    return this;
  }

  clamp() {
    // Clamp
    this.words[this.sigBytes >>> 2]! &=
      0xff_ff_ff_ff << (32 - (this.sigBytes % 4) * 8);
    this.words.length = Math.ceil(this.sigBytes / 4);
  }

  clone() {
    return new WordArray([...this.words]);
  }
}

export const Hex = {
  stringify(wordArray: WordArray) {
    // Convert
    const hexChars: string[] = [];
    for (let i = 0; i < wordArray.sigBytes; i++) {
      const bite = (wordArray.words[i >>> 2]! >>> (24 - (i % 4) * 8)) & 0xff;
      hexChars.push((bite >>> 4).toString(16), (bite & 0x0f).toString(16));
    }

    return hexChars.join("");
  }
};

export const Base64 = {
  stringify(wordArray: WordArray) {
    const keyStr =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const base64Chars: string[] = [];
    for (let i = 0; i < wordArray.sigBytes; i += 3) {
      const byte1 = (wordArray.words[i >>> 2]! >>> (24 - (i % 4) * 8)) & 0xff;
      const byte2 =
        (wordArray.words[(i + 1) >>> 2]! >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
      const byte3 =
        (wordArray.words[(i + 2) >>> 2]! >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

      const triplet = (byte1 << 16) | (byte2 << 8) | byte3;
      for (let j = 0; j < 4 && i * 8 + j * 6 < wordArray.sigBytes * 8; j++) {
        base64Chars.push(keyStr.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
      }
    }
    return base64Chars.join("");
  }
};

export const Latin1 = {
  parse(latin1Str: string) {
    // Shortcut
    const latin1StrLength = latin1Str.length;

    // Convert
    const words: number[] = [];
    for (let i = 0; i < latin1StrLength; i++) {
      if (latin1Str.codePointAt(i)) {
        words[i >>> 2]! |=
          (latin1Str.codePointAt(i)! & 0xff) << (24 - (i % 4) * 8);
      }
    }

    return new WordArray(words, latin1StrLength);
  }
};

export const Utf8 = {
  parse(utf8Str: string) {
    return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
  }
};

export class BufferedBlockAlgorithm {
  _data = new WordArray();
  _nDataBytes = 0;
  _minBufferSize = 0;
  blockSize = 512 / 32;

  reset() {
    this._data = new WordArray();
    this._nDataBytes = 0;
  }

  _append(data: string | WordArray) {
    // Convert string to WordArray, else assume WordArray already
    if (typeof data === "string") {
      data = Utf8.parse(data);
    }

    // Append
    // eslint-disable-next-line unicorn/prefer-spread
    this._data.concat(data);
    this._nDataBytes += data.sigBytes;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _doProcessBlock(_dataWords: any, _offset: any) {}

  _process(doFlush?: boolean) {
    let processedWords;

    // Count blocks ready
    let nBlocksReady = this._data.sigBytes / (this.blockSize * 4); /* bytes */
    doFlush
      ? (nBlocksReady = Math.ceil(nBlocksReady))
      : (nBlocksReady = Math.max(
          Math.trunc(nBlocksReady) - this._minBufferSize,
          0
        ));

    // Count words ready
    const nWordsReady = nBlocksReady * this.blockSize;

    // Count bytes ready
    const nBytesReady = Math.min(nWordsReady * 4, this._data.sigBytes);

    // Process blocks
    if (nWordsReady) {
      for (let offset = 0; offset < nWordsReady; offset += this.blockSize) {
        // Perform concrete-algorithm logic
        this._doProcessBlock(this._data.words, offset);
      }

      // Remove processed words
      processedWords = this._data.words.splice(0, nWordsReady);
      this._data.sigBytes -= nBytesReady;
    }

    // Return processed words
    return new WordArray(processedWords, nBytesReady);
  }
}

export class Hasher extends BufferedBlockAlgorithm {
  update(messageUpdate: string) {
    // Append
    this._append(messageUpdate);

    // Update the hash
    this._process();

    // Chainable
    return this;
  }

  finalize(messageUpdate: string) {
    // Final message update
    if (messageUpdate) {
      this._append(messageUpdate);
    }
  }
}

// Initialization and round constants tables
const H = [
  1_779_033_703, -1_150_833_019, 1_013_904_242, -1_521_486_534, 1_359_893_119,
  -1_694_144_372, 528_734_635, 1_541_459_225
];
const K = [
  1_116_352_408, 1_899_447_441, -1_245_643_825, -373_957_723, 961_987_163,
  1_508_970_993, -1_841_331_548, -1_424_204_075, -670_586_216, 310_598_401,
  607_225_278, 1_426_881_987, 1_925_078_388, -2_132_889_090, -1_680_079_193,
  -1_046_744_716, -459_576_895, -272_742_522, 264_347_078, 604_807_628,
  770_255_983, 1_249_150_122, 1_555_081_692, 1_996_064_986, -1_740_746_414,
  -1_473_132_947, -1_341_970_488, -1_084_653_625, -958_395_405, -710_438_585,
  113_926_993, 338_241_895, 666_307_205, 773_529_912, 1_294_757_372,
  1_396_182_291, 1_695_183_700, 1_986_661_051, -2_117_940_946, -1_838_011_259,
  -1_564_481_375, -1_474_664_885, -1_035_236_496, -949_202_525, -778_901_479,
  -694_614_492, -200_395_387, 275_423_344, 430_227_734, 506_948_616,
  659_060_556, 883_997_877, 958_139_571, 1_322_822_218, 1_537_002_063,
  1_747_873_779, 1_955_562_222, 2_024_104_815, -2_067_236_844, -1_933_114_872,
  -1_866_530_822, -1_538_233_109, -1_090_935_817, -965_641_998
];

// Reusable object
const W: number[] = [];

/**
 * SHA-256 hash algorithm.
 */
export class SHA256 extends Hasher {
  _hash = new WordArray([...H]);

  override reset() {
    super.reset();
    this._hash = new WordArray([...H]);
  }

  override _doProcessBlock(M: number[], offset: number) {
    // Shortcut
    const H = this._hash.words;

    // Working variables
    let a = H[0];
    let b = H[1];
    let c = H[2];
    let d = H[3];
    let e = H[4];
    let f = H[5];
    let g = H[6];
    let h = H[7];

    // Computation
    for (let i = 0; i < 64; i++) {
      if (i < 16) {
        W[i] = Math.trunc(M[offset + i]!);
      } else {
        const gamma0x = W[i - 15];
        const gamma0 =
          ((gamma0x! << 25) | (gamma0x! >>> 7)) ^
          ((gamma0x! << 14) | (gamma0x! >>> 18)) ^
          (gamma0x! >>> 3);

        const gamma1x = W[i - 2];
        const gamma1 =
          ((gamma1x! << 15) | (gamma1x! >>> 17)) ^
          ((gamma1x! << 13) | (gamma1x! >>> 19)) ^
          (gamma1x! >>> 10);

        W[i] = gamma0 + W[i - 7]! + gamma1 + W[i - 16]!;
      }

      const ch = (e! & f!) ^ (~e! & g!);
      const maj = (a! & b!) ^ (a! & c!) ^ (b! & c!);

      const sigma0 =
        ((a! << 30) | (a! >>> 2)) ^
        ((a! << 19) | (a! >>> 13)) ^
        ((a! << 10) | (a! >>> 22));
      const sigma1 =
        ((e! << 26) | (e! >>> 6)) ^
        ((e! << 21) | (e! >>> 11)) ^
        ((e! << 7) | (e! >>> 25));

      const t1 = h! + sigma1 + ch + K[i]! + W[i]!;
      const t2 = sigma0 + maj;

      h = g;
      g = f;
      f = e;
      e = Math.trunc(d! + t1);
      d = c;
      c = b;
      b = a;
      a = Math.trunc(t1 + t2);
    }

    // Intermediate hash value
    H[0] = Math.trunc(H[0]! + a!);
    H[1] = Math.trunc(H[1]! + b!);
    H[2] = Math.trunc(H[2]! + c!);
    H[3] = Math.trunc(H[3]! + d!);
    H[4] = Math.trunc(H[4]! + e!);
    H[5] = Math.trunc(H[5]! + f!);
    H[6] = Math.trunc(H[6]! + g!);
    H[7] = Math.trunc(H[7]! + h!);
  }

  override finalize(messageUpdate: string): WordArray {
    super.finalize(messageUpdate);

    const nBitsTotal = this._nDataBytes * 8;
    const nBitsLeft = this._data.sigBytes * 8;

    // Add padding
    this._data.words[nBitsLeft >>> 5]! |= 0x80 << (24 - (nBitsLeft % 32));
    this._data.words[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(
      nBitsTotal / 0x1_00_00_00_00
    );
    this._data.words[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
    this._data.sigBytes = this._data.words.length * 4;

    // Hash final blocks
    this._process();

    // Return final computed hash
    return this._hash;
  }
}

export function sha256(message: string) {
  return new SHA256().finalize(message).toString();
}

export function sha256base64(message: string) {
  return new SHA256().finalize(message).toString(Base64);
}
