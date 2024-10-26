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

import { useCallback, useRef, useState } from "react";
import { ReactRef, setRef } from "./use-compose-refs";

/**
 * A hook that returns tuple containing a ref and a boolean indicating if the element (referenced by the ref) is being hovered.
 *
 * @param forwardedRef - An optional ref to be composed with the hover ref
 * @returns A tuple containing a ref and a boolean indicating if the element is being hovered
 */
export const useHover = (
  forwardedRef?: ReactRef<HTMLElement>
): [(node: HTMLElement) => void, boolean] => {
  const [hovering, setHovering] = useState(false);
  const previousNode = useRef<HTMLElement | null>(null);

  const handleMouseEnter = useCallback(() => {
    setHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovering(false);
  }, []);

  const customRef = useCallback(
    (node: HTMLElement) => {
      if (previousNode.current?.nodeType === Node.ELEMENT_NODE) {
        previousNode.current.removeEventListener(
          "mouseenter",
          handleMouseEnter
        );
        previousNode.current.removeEventListener(
          "mouseleave",
          handleMouseLeave
        );
      }

      if (node?.nodeType === Node.ELEMENT_NODE) {
        node.addEventListener("mouseenter", handleMouseEnter);
        node.addEventListener("mouseleave", handleMouseLeave);
      }

      setRef(forwardedRef, node);
      setRef(previousNode, node);
    },
    [handleMouseEnter, handleMouseLeave]
  );

  return [customRef, hovering];
};
