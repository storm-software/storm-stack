import { formatDate } from "@storm-software/date-time";
import { EMPTY_STRING } from "@storm-software/utilities";
import { join } from "node:path";
import pino from "pino";

export const createFileTransport = (
  logPath: string,
  logFilePrefix: string,
  logFileExtension: string
) => {
  return pino.transport({
    target: "pino/file",
    options: {
      destination: pino.destination({
        dest: join(
          logPath,
          formatDate().replaceAll("/", "-"),
          `${
            logFilePrefix ? logFilePrefix + "-" : EMPTY_STRING
          }${formatDate()}.${logFileExtension.replaceAll(".", EMPTY_STRING)}}`
        ),
        minLength: 4096,
        sync: false
      })
    }
  });
};
