/*-------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 License, and is
 free for commercial and private use. For more information, please visit
 our licensing page.

 Website:         https://stormsoftware.com
 Repository:      https://github.com/storm-software/storm-stack
 Documentation:   https://stormsoftware.com/projects/storm-stack/docs
 Contact:         https://stormsoftware.com/contact
 License:         https://stormsoftware.com/projects/storm-stack/license

 -------------------------------------------------------------------*/

import { isFunction } from "@storm-stack/types/type-checks/is-function";
import * as React from "react";

const emptyFn = () => {};
const emptyFnFn = () => emptyFn;

export function useDidFinishSSR<A = boolean>(
  value?: A,
  options?: {
    sync?: boolean;
  }
): A | false {
  if (process.env.TAMAGUI_TARGET === "native") {
    return (value ?? true) as false | A;
  }

  if (options?.sync) {
    return React.useSyncExternalStore(
      emptyFnFn,
      () => value ?? true,
      () => false as any
    );
  }

  const [cur, setCur] = React.useState<any>(value);
  React.useEffect(() => {
    setCur(value ?? true);
  }, []);
  return cur ?? false;
}

export function useDidFinishSSRSync<A = boolean>(value?: A): A | false {
  return useDidFinishSSR(value, {
    sync: true
  });
}

type FunctionOrValue<Value> = Value extends () => infer X ? X : Value;

export function useClientValue<Value>(
  value?: Value
): FunctionOrValue<Value> | undefined {
  const done = useDidFinishSSR();
  return done ? (isFunction(value) ? value() : value) : undefined;
}
