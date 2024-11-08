import { titleCase } from "@storm-stack/string-fns/title-case";
import chalk from "chalk";
import { text } from "figlet";
import { CLITitle } from "../types";

export const writeBanner = (
  bannerOpts: CLITitle,
  byOpts: CLITitle,
  color?: string
) => {
  if (bannerOpts?.hide !== true) {
    text(
      titleCase(bannerOpts?.name ?? "Storm CLI")!,
      bannerOpts?.options ?? {
        font: bannerOpts?.font ?? "Larry 3D"
      },
      (err, data) => {
        if (err) {
          return;
        }

        console.log(chalk.hex(color || "#FFF")(data));
      }
    );

    if (byOpts?.hide !== true) {
      text(
        `by ${titleCase(byOpts?.name ?? "Storm")}`,
        byOpts?.options ?? { font: byOpts?.font ?? "Doom" },
        (err, data) => {
          if (err) {
            return;
          }
          console.log(chalk.hex(color || "#adbac7")(data));
        }
      );
    }
  }
};
