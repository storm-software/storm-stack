import { isString } from "@storm-stack/types";

// Adapted from Chris Veness' SHA1 code at http://www.movable-type.co.uk/scripts/sha1.html
function f(s: number, x: number, y: number, z: number): number {
  switch (s) {
    case 0: {
      return (x & y) ^ (~x & z);
    }
    case 1: {
      return x ^ y ^ z;
    }
    case 2: {
      return (x & y) ^ (x & z) ^ (y & z);
    }
    default: {
      return x ^ y ^ z;
    }
  }
}

function ROTL(x: number, n: number) {
  return (x << n) | (x >>> (32 - n));
}

export function sha1(
  bytes: string | number | boolean | Uint8Array | any[]
): Uint8Array {
  const K = [0x5a_82_79_99, 0x6e_d9_eb_a1, 0x8f_1b_bc_dc, 0xca_62_c1_d6];
  const H = [
    0x67_45_23_01, 0xef_cd_ab_89, 0x98_ba_dc_fe, 0x10_32_54_76, 0xc3_d2_e1_f0
  ];

  let _bytes: any[] = [];
  if (isString(bytes)) {
    const msg = unescape(encodeURIComponent(bytes));
    for (let i = 0; i < msg.length; ++i) {
      _bytes.push(msg.codePointAt(i));
    }
  } else if (!Array.isArray(_bytes)) {
    _bytes = Array.prototype.slice.call(_bytes);
  }

  _bytes.push(0x80);

  const l = _bytes.length / 4 + 2;
  const N = Math.ceil(l / 16);
  const M = Array.from({ length: N }) as any[];

  for (let i = 0; i < N; ++i) {
    const arr = new Uint32Array(16);
    for (let j = 0; j < 16; ++j) {
      arr[j] =
        (_bytes[i * 64 + j * 4] << 24) |
        (_bytes[i * 64 + j * 4 + 1] << 16) |
        (_bytes[i * 64 + j * 4 + 2] << 8) |
        _bytes[i * 64 + j * 4 + 3];
    }

    M[i] = arr;
  }

  M[N - 1][14] = ((_bytes.length - 1) * 8) / 2 ** 32;
  M[N - 1][14] = Math.floor(M[N - 1][14]);
  M[N - 1][15] = ((_bytes.length - 1) * 8) & 0xff_ff_ff_ff;

  for (let i = 0; i < N; ++i) {
    const W = new Uint32Array(80);
    for (let t = 0; t < 16; ++t) {
      W[t] = M[i][t];
    }

    for (let t = 16; t < 80; ++t) {
      W[t] = ROTL(W[t - 3]! ^ W[t - 8]! ^ W[t - 14]! ^ W[t - 16]!, 1);
    }

    let a = H[0] as number;
    let b = H[1] as number;
    let c = H[2] as number;
    let d = H[3] as number;
    let e = H[4] as number;

    for (let t = 0; t < 80; ++t) {
      const s = Math.floor(t / 20);
      const T = (ROTL(a, 5) + f(s, b, c, d) + e + K[s]! + W[t]!) >>> 0;
      e = d;
      d = c;

      c = ROTL(b!, 30) >>> 0;
      b = a;
      a = T;
    }

    H[0] = (H[0]! + a!) >>> 0;
    H[1] = (H[1]! + b!) >>> 0;
    H[2] = (H[2]! + c!) >>> 0;
    H[3] = (H[3]! + d!) >>> 0;
    H[4] = (H[4]! + e!) >>> 0;
  }

  return Uint8Array.from([
    (H[0]! >> 24) & 0xff,
    (H[0]! >> 16) & 0xff,
    (H[0]! >> 8) & 0xff,
    H[0]! & 0xff,
    (H[1]! >> 24) & 0xff,
    (H[1]! >> 16) & 0xff,
    (H[1]! >> 8) & 0xff,
    H[1]! & 0xff,
    (H[2]! >> 24) & 0xff,
    (H[2]! >> 16) & 0xff,
    (H[2]! >> 8) & 0xff,
    H[2]! & 0xff,
    (H[3]! >> 24) & 0xff,
    (H[3]! >> 16) & 0xff,
    (H[3]! >> 8) & 0xff,
    H[3]! & 0xff,
    (H[4]! >> 24) & 0xff,
    (H[4]! >> 16) & 0xff,
    (H[4]! >> 8) & 0xff,
    H[4]! & 0xff
  ]);
}
