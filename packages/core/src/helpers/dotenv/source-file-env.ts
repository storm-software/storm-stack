/* -------------------------------------------------------------------

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

 ------------------------------------------------------------------- */

import type { DotenvParseOutput } from "@stryke/env/types";
import { ENV_PREFIXES } from "@stryke/env/types";
import { camelCase } from "@stryke/string-format/camel-case";
import { isString } from "@stryke/type-checks/is-string";

type TReturned<TEnv> = TEnv extends string ? string : DotenvParseOutput;
export const removeEnvPrefix = <TEnv extends DotenvParseOutput | string>(
  env: TEnv
): TReturned<TEnv> => {
  if (isString(env)) {
    let name: string = ENV_PREFIXES.reduce((ret, prefix) => {
      if (ret.startsWith(prefix)) {
        ret = ret.slice(prefix.length);
      }

      return ret;
    }, env.toUpperCase());

    while (name.startsWith("_")) {
      name = name.slice(1);
    }

    return name as TReturned<TEnv>;
  }

  return Object.keys(env).reduce((ret, key) => {
    const name = removeEnvPrefix(key);
    if (name) {
      ret[name] = env[key];
    }

    return ret;
  }, {} as TReturned<TEnv>);
};

export const formatEnvField = (key: string): string => {
  return camelCase(removeEnvPrefix(key));
};
