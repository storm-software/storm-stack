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

import { EMPTY_STRING } from "@storm-stack/types/utility-types/base";
import { useCallback, useState } from "react";

function oldSchoolCopy(text: string) {
  const tempTextArea = document.createElement("textarea");
  tempTextArea.value = text;
  document.body.appendChild(tempTextArea);
  tempTextArea.select();
  document.execCommand("copy");
  document.body.removeChild(tempTextArea);
}

/**
 * Copies a value to the clipboard
 *
 * @returns A tuple with the copied value and a function to copy a value to the clipboard
 */
export function useCopyToClipboard() {
  const [state, setState] = useState<string | null>(null);

  const copyToClipboard = useCallback((value: string | null) => {
    const handleCopy = async () => {
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(value ?? EMPTY_STRING);
          setState(value ?? EMPTY_STRING);
        } else {
          throw new Error("writeText not supported");
        }
      } catch (e) {
        oldSchoolCopy(value ?? EMPTY_STRING);
        setState(value ?? EMPTY_STRING);
      }
    };

    handleCopy();
  }, []);

  return [state, copyToClipboard];
}
