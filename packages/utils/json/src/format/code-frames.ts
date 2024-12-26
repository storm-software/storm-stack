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

type Location = {
  column: number;
  line: number;
};

type NodeLocation = {
  end?: Location;
  start?: Location;
};

// Adapted from https://raw.githubusercontent.com/babel/babel/4108524/packages/babel-code-frame/src/index.js

/**
 * RegExp to test for newlines in terminal.
 */
const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

/**
 * Extract what lines should be marked and highlighted.
 */
function getMarkerLines(
  loc: NodeLocation,
  source: string[],
  opts: { linesAbove?: number; linesBelow?: number } = {}
): {
  start: number;
  end: number;
  markerLines: Record<number, boolean | [number, number]>;
} {
  const startLoc: Location = {
    column: 0,
    line: -1,
    ...loc.start
  };
  const endLoc: Location = {
    ...startLoc,
    ...loc.end
  };
  const { linesAbove = 2, linesBelow = 3 } = opts || {};
  const startLine = startLoc.line;
  const startColumn = startLoc.column;
  const endLine = endLoc.line;
  const endColumn = endLoc.column;

  let start = Math.max(startLine - (linesAbove + 1), 0);
  let end = Math.min(source.length, endLine + linesBelow);

  if (startLine === -1) {
    start = 0;
  }

  if (endLine === -1) {
    end = source.length;
  }

  const lineDiff = endLine - startLine;
  const markerLines = {} as Record<number, boolean | [number, number]>;

  if (lineDiff) {
    for (let i = 0; i <= lineDiff; i++) {
      const lineNumber = i + startLine;

      if (!startColumn) {
        markerLines[lineNumber] = true;
      } else if (i === 0) {
        const sourceLength = source[lineNumber - 1]?.length ?? 0;

        markerLines[lineNumber] = [startColumn, sourceLength - startColumn + 1];
      } else if (i === lineDiff) {
        markerLines[lineNumber] = [0, endColumn];
      } else {
        const sourceLength = source[lineNumber - i]?.length ?? 0;

        markerLines[lineNumber] = [0, sourceLength];
      }
    }
  } else if (startColumn === endColumn) {
    markerLines[startLine] = startColumn ? [startColumn, 0] : true;
  } else {
    markerLines[startLine] = [startColumn, endColumn - startColumn];
  }

  return { start, end, markerLines };
}

export function codeFrameColumns(
  rawLines: string,
  loc: NodeLocation,
  opts: {
    linesAbove?: number;
    linesBelow?: number;
    highlight?: (rawLines: string) => string;
  } = {}
): string {
  const lines = rawLines.split(NEWLINE);
  const { start, end, markerLines } = getMarkerLines(loc, lines, opts);

  const numberMaxWidth = String(end).length;
  const highlightedLines = opts.highlight ? opts.highlight(rawLines) : rawLines;

  let frame = highlightedLines
    .split(NEWLINE)
    .slice(start, end)
    .map((line, index) => {
      const number = start + 1 + index;
      const paddedNumber = ` ${number}`.slice(-numberMaxWidth);
      const gutter = ` ${paddedNumber} | `;
      const hasMarker = Boolean(markerLines[number] ?? false);
      if (hasMarker) {
        let markerLine = "";
        if (Array.isArray(hasMarker)) {
          const markerSpacing = line
            .slice(0, Math.max(hasMarker[0] - 1, 0))
            .replace(/[^\t]/g, " ");
          const numberOfMarkers = hasMarker[1] || 1;

          markerLine = [
            "\n ",
            gutter.replace(/\d/g, " "),
            markerSpacing,
            "^".repeat(numberOfMarkers)
          ].join("");
        }
        return [">", gutter, line, markerLine].join("");
      }
      return ` ${gutter}${line}`;
    })
    .join("\n");

  return frame;
}
