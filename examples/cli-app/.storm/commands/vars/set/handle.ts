/* eslint-disable */
// biome-ignore lint: disable
// prettier-ignore

// Generated by Storm Stack
// Note: Do not edit this file manually - it will be overwritten automatically

import { deserialize,serialize } from "@deepkit/type";
import { colors } from "../../../runtime/cli";
import { StormPayload, StormVariables } from "../../../runtime/payload";

export interface VarsSetPayload {
  /**
   * The name of the variable to set in the variables store.
   */
  name: string;

  /**
   * The value to set for the variable.
   */
  value: any;
}

/**
 * Sets a configuration parameter in the variables store.
 *
 * @param payload - The payload object containing the config key and value to set.
 */
async function handler(payload: StormPayload<VarsSetPayload>) {
  const varsFile = await $storm.storage.getItem(`vars:vars.json`);
  if (varsFile === undefined) {
    console.error(
      ` ${colors.red("✘")} ${colors.redBright(`Variables file was not found`)}`
    );
    return;
  }

  const vars = deserialize<StormVariables>(varsFile);
  vars[payload.data.name] = payload.data.value;

  await $storm.storage.setItem(
    `vars:vars.json`,
    serialize<StormVariables>(vars)
  );

  console.log("");
  console.log(
    colors.dim(
      " > \`${payload.data.name}\` variable set to ${payload.data.value}"
    )
  );
  console.log("");
}

export default handler;
