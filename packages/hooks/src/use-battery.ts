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
import { BatteryManager } from "@storm-stack/types/utility-types/navigator";
import React from "react";

const defaultBatteryManagerState = {
  supported: true,
  loading: true,
  level: null,
  charging: null,
  chargingTime: null,
  dischargingTime: null
};

/**
 * Listens for updates to the mobile/desktop battery status
 */
export function useBattery() {
  const [state, setState] = React.useState<
    Omit<BatteryManager, "addEventListener" | "removeEventListener">
  >(defaultBatteryManagerState);

  const key = "getBattery" as keyof typeof navigator;
  const getBattery = navigator[key] as () => Promise<BatteryManager>;

  React.useEffect(() => {
    if (!isFunction(getBattery)) {
      setState(s => ({
        ...s,
        supported: false,
        loading: false
      }));
      return;
    }

    let battery = null as BatteryManager | null;

    const handleChange = () => {
      setState({
        ...defaultBatteryManagerState,
        supported: true,
        loading: false,
        ...battery
      });
    };

    getBattery().then(b => {
      battery = b;
      handleChange();

      b?.addEventListener("levelchange", handleChange);
      b?.addEventListener("chargingchange", handleChange);
      b?.addEventListener("chargingtimechange", handleChange);
      b?.addEventListener("dischargingtimechange", handleChange);
    });

    return () => {
      if (battery) {
        battery.removeEventListener("levelchange", handleChange);
        battery.removeEventListener("chargingchange", handleChange);
        battery.removeEventListener("chargingtimechange", handleChange);
        battery.removeEventListener("dischargingtimechange", handleChange);
      }
    };
  }, []);

  return state;
}
