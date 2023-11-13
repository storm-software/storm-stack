import { isBuffer } from "./is-buffer";

const globalObject = (Obj => {
  if (typeof globalThis === "object") {
    return globalThis; // eslint-disable-line
  }
  Object.defineProperty(Obj, "typeDetectGlobalObject", {
    get() {
      return this;
    },
    configurable: true
  });
  // @ts-ignore
  const global = typeDetectGlobalObject; // eslint-disable-line
  // @ts-ignore
  delete Obj.typeDetectGlobalObject;
  return global;
})(Object.prototype);

export function typeDetect(obj: unknown): string {
  // NOTE: isBuffer must execute before type-detect,
  // because type-detect returns 'Uint8Array'.
  if (isBuffer(obj)) {
    return "Buffer";
  }

  const typeofObj = typeof obj;
  if (typeofObj !== "object") {
    return typeofObj;
  }

  if (obj === null) {
    return "null";
  }

  if (obj === globalObject) {
    return "global";
  }

  if (
    Array.isArray(obj) &&
    (typeof Symbol.toStringTag === "undefined" || !(Symbol.toStringTag in obj))
  ) {
    return "Array";
  }

  // https://html.spec.whatwg.org/multipage/browsers.html#location
  if (typeof window === "object" && window !== null) {
    if (
      typeof (window as any).location === "object" &&
      obj === (window as any).location
    ) {
      return "Location";
    }

    // https://html.spec.whatwg.org/#document
    if (
      typeof (window as any).document === "object" &&
      obj === (window as any).document
    ) {
      return "Document";
    }

    // https://html.spec.whatwg.org/multipage/webappapis.html#mimetypearray
    if (typeof (window as any).navigator === "object") {
      if (
        typeof (window as any).navigator.mimeTypes === "object" &&
        obj === (window as any).navigator.mimeTypes
      ) {
        return "MimeTypeArray";
      }

      // https://html.spec.whatwg.org/multipage/webappapis.html#pluginarray
      if (
        typeof (window as any).navigator.plugins === "object" &&
        obj === (window as any).navigator.plugins
      ) {
        return "PluginArray";
      }
    }

    // https://html.spec.whatwg.org/multipage/webappapis.html#pluginarray
    if (
      (typeof (window as any).HTMLElement === "function" ||
        typeof (window as any).HTMLElement === "object") &&
      obj instanceof (window as any).HTMLElement
    ) {
      if ((obj as any).tagName === "BLOCKQUOTE") {
        return "HTMLQuoteElement";
      }

      // https://html.spec.whatwg.org/#htmltabledatacellelement
      if ((obj as any).tagName === "TD") {
        return "HTMLTableDataCellElement";
      }

      // https://html.spec.whatwg.org/#htmltableheadercellelement
      if ((obj as any).tagName === "TH") {
        return "HTMLTableHeaderCellElement";
      }
    }
  }

  const stringTag =
    typeof Symbol.toStringTag !== "undefined" &&
    (obj as any)[Symbol.toStringTag];
  if (typeof stringTag === "string") {
    return stringTag;
  }

  const objPrototype = Object.getPrototypeOf(obj);
  if (objPrototype === RegExp.prototype) {
    return "RegExp";
  }

  if (objPrototype === Date.prototype) {
    return "Date";
  }

  // http://www.ecma-international.org/ecma-262/6.0/index.html#sec-promise.prototype-@@tostringtag
  if (typeof Promise !== "undefined" && objPrototype === Promise.prototype) {
    return "Promise";
  }

  if (typeof Set !== "undefined" && objPrototype === Set.prototype) {
    return "Set";
  }

  if (typeof Map !== "undefined" && objPrototype === Map.prototype) {
    return "Map";
  }

  if (typeof WeakSet !== "undefined" && objPrototype === WeakSet.prototype) {
    return "WeakSet";
  }

  if (typeof WeakMap !== "undefined" && objPrototype === WeakMap.prototype) {
    return "WeakMap";
  }

  // http://www.ecma-international.org/ecma-262/6.0/index.html#sec-dataview.prototype-@@tostringtag
  if (typeof DataView !== "undefined" && objPrototype === DataView.prototype) {
    return "DataView";
  }

  // http://www.ecma-international.org/ecma-262/6.0/index.html#sec-%mapiteratorprototype%-@@tostringtag
  if (
    typeof Map !== "undefined" &&
    objPrototype === Object.getPrototypeOf(new Map().entries())
  ) {
    return "Map Iterator";
  }

  // http://www.ecma-international.org/ecma-262/6.0/index.html#sec-%setiteratorprototype%-@@tostringtag
  if (
    typeof Set !== "undefined" &&
    objPrototype === Object.getPrototypeOf(new Set().entries())
  ) {
    return "Set Iterator";
  }

  // http://www.ecma-international.org/ecma-262/6.0/index.html#sec-%arrayiteratorprototype%-@@tostringtag
  if (
    typeof Array.prototype[Symbol.iterator] === "function" &&
    objPrototype === Object.getPrototypeOf([][Symbol.iterator]())
  ) {
    return "Array Iterator";
  }

  // http://www.ecma-international.org/ecma-262/6.0/index.html#sec-%stringiteratorprototype%-@@tostringtag
  if (
    typeof Symbol.iterator !== "undefined" &&
    typeof String.prototype[Symbol.iterator] === "function" &&
    Object.getPrototypeOf(""[Symbol.iterator]()) &&
    objPrototype === Object.getPrototypeOf(""[Symbol.iterator]())
  ) {
    return "String Iterator";
  }

  if (objPrototype === null) {
    return "Object";
  }

  return Object.prototype.toString.call(obj).slice(8, -1);
}
