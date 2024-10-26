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

import { throttle } from "@storm-stack/utilities/helper-fns/throttle";
import { useEffect, useState } from "react";

/**
 * A hook that returns a boolean indicating if the user is idle.
 *
 * @param ms - The number of milliseconds to wait before considering the user as idle
 * @returns A boolean indicating if the user is idle
 */
export const useIdle = (ms = 1000 * 60): boolean => {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    let timeoutId: number = -1;

    const handleTimeout = () => {
      setIdle(true);
    };

    const handleEvent = throttle(() => {
      setIdle(false);

      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(handleTimeout, ms);
    }, 500);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleEvent();
      }
    };

    timeoutId = window.setTimeout(handleTimeout, ms);

    window.addEventListener("mousemove", handleEvent);
    window.addEventListener("mousedown", handleEvent);
    window.addEventListener("resize", handleEvent);
    window.addEventListener("keydown", handleEvent);
    window.addEventListener("touchstart", handleEvent);
    window.addEventListener("wheel", handleEvent);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("mousemove", handleEvent);
      window.removeEventListener("mousedown", handleEvent);
      window.removeEventListener("resize", handleEvent);
      window.removeEventListener("keydown", handleEvent);
      window.removeEventListener("touchstart", handleEvent);
      window.removeEventListener("wheel", handleEvent);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearTimeout(timeoutId);
    };
  }, [ms]);

  return idle;
};
