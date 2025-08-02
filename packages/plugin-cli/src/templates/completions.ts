/* -------------------------------------------------------------------

                  ⚡ Storm Software - Storm Stack

 This code was released as part of the Storm Stack project. Storm Stack
 is maintained by Storm Software under the Apache-2.0 license, and is
 free for commercial and private use. For more information, please visit
 our licensing page at https://stormsoftware.com/licenses/projects/storm-stack.

 Website:                  https://stormsoftware.com
 Repository:               https://github.com/storm-software/storm-stack
 Documentation:            https://docs.stormsoftware.com/projects/storm-stack
 Contact:                  https://stormsoftware.com/contact

 SPDX-License-Identifier:  Apache-2.0

 ------------------------------------------------------------------- */

import { getFileHeader } from "@storm-stack/core/lib/utilities/file-header";
import { kebabCase } from "@stryke/string-format/kebab-case";
import { titleCase } from "@stryke/string-format/title-case";
import { isSetString } from "@stryke/type-checks/is-set-string";
import { CLIPluginConfig, CLIPluginContext } from "../types/config";

export function writeCompletionsBash(
  context: CLIPluginContext,
  config: CLIPluginConfig
) {
  const bin =
    kebabCase(
      config.bin &&
        (isSetString(config.bin) ||
          (Array.isArray(config.bin) && config.bin.length > 0 && config.bin[0]))
        ? isSetString(config.bin)
          ? config.bin
          : config.bin[0]
        : context.options.name || context.packageJson?.name
    ) || "storm";

  return `${getFileHeader()}

import { colors, stripAnsi } from "storm:cli";
import { StormPayload } from "storm:payload";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import os from "node:os";

const homedir = os.homedir();

export interface CompletionsBashPayload {
  /**
   * The path to write the completion script to.
   *
   * @remarks
   * If no extension is provided, the \`.bash\` extension will be used.
   */
  script?: string | true;

  /**
   * The configuration file to append the completion script to.
   *
   * @remarks
   * The generated completion script will be appended to the specified configuration file. Possible values for the configuration file include:
   * - \`~/.bashrc\`
   * - \`~/.bash_profile\`
   */
  config?: string | true;
}

/**
 * Generates a Bash shell completion script for the ${titleCase(context.options.name)} CLI application.
 *
 * @param payload - The payload object optionally containing a script output file or a config file.
 */
async function handler(payload: StormPayload<CompletionsBashPayload>) {
  const executablePath = process.argv[1] || "${bin}";
  const script = colors.white(\`
\${colors.dim("###-begin-${bin}-completions-###")}

\${colors.dim(\`# \${colors.bold("${titleCase(context.options.name)} Bash CLI command completion script")}
#
# \${colors.bold("Installation:")} \${executablePath} completions bash --config ~/.bashrc or \${executablePath} completions bash --script or  \${executablePath} completions bash >> ~/.bashrc or \${executablePath} completions bash >> ~/.bash_profile on OSX. \`)}
\${colors.bold("_${bin}_completions()")}
{
    local cur_word args type_list

    cur_word="\\\${COMP_WORDS[COMP_CWORD]}"
    args=("\\\${COMP_WORDS[@]}")

    \${colors.dim("# Ask ${titleCase(context.options.name)} CLI to generate completions.")}
    mapfile -t type_list < <(\${executablePath} --get-completions "\\\${args[@]}")
    mapfile -t COMPREPLY < <(compgen -W "$( printf '%q ' "\\\${type_list[@]}" )" -- "\\\${cur_word}" |
        awk '/ / { print "\\\\""$0"\\\\"" } /^[^ ]+$/ { print $0 }')

    \${colors.dim("# if no match was found, fall back to filename completion")}
    if [ \\\${#COMPREPLY[@]} -eq 0 ]; then
      COMPREPLY=()
    fi

    return 0
}
complete -o bashdefault -o default -F _${bin}_completions ${bin}

\${colors.dim("###-end-${bin}-completions-###")}
\`);

  console.log("");
  if (payload.data.config) {
    let configFile = payload.data.config === true
      ? "~/.bashrc"
      : payload.data.config;
    if (configFile.startsWith("~")) {
      configFile = join(homedir, configFile.replace("~", ""));
    }

    let configFileContent = "";
    if (existsSync(configFile)) {
      configFileContent = await readFile(
        configFile,
        "utf8"
      );
    }

    await writeFile(
      configFile,
      configFileContent + "\\n\\n" + stripAnsi(script),
      "utf8"
    );

    console.log(colors.dim(\` > Bash completion script appended to \${configFile} configuration\`));
  } else if (payload.data.script) {
    const scriptFile = typeof payload.data.script === "string"
      ? payload.data.script
      : "${bin}-completions.sh";
    await writeFile(
      scriptFile,
      stripAnsi(script),
      "utf8"
    );

    console.log(colors.dim(\` > Bash completion script written to \${scriptFile}\`));
  } else {
    console.log(script);
  }

  console.log("");
}

export default handler;

`;
}

export function writeCompletionsZsh(
  context: CLIPluginContext,
  config: CLIPluginConfig
) {
  const bin =
    kebabCase(
      config.bin &&
        (isSetString(config.bin) ||
          (Array.isArray(config.bin) && config.bin.length > 0 && config.bin[0]))
        ? isSetString(config.bin)
          ? config.bin
          : config.bin[0]
        : context.options.name || context.packageJson?.name
    ) || "storm";

  return `${getFileHeader()}
import { colors, stripAnsi } from "storm:cli";
import { StormPayload } from "storm:payload";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import os from "node:os";

const homedir = os.homedir();

export interface CompletionsZshPayload {
  /**
   * The path to write the completion script to.
   *
   * @remarks
   * If no extension is provided, the \`.zsh\` extension will be used.
   */
  script?: string | true;

  /**
   * The configuration file to append the completion script to.
   *
   * @remarks
   * The generated completion script will be appended to the specified configuration file. Possible values for the configuration file include:
   * - \`~/.zshrc\`
   * - \`~/.zprofile\`
   */
  config?: string | true;
}

/**
 * Generates a Zsh shell completion script for the ${titleCase(context.options.name)} CLI application.
 *
 * @param payload - The payload object optionally containing a script output file or a config file.
 */
async function handler(payload: StormPayload<CompletionsZshPayload>) {
  const executablePath = process.argv[1] || "${bin}";
  const script = colors.white(\`
\${colors.dim("#compdef")} \${colors.bold("${bin}")}
\${colors.dim("###-begin-${bin}-completions-###")}

\${colors.dim(\`# \${colors.bold("${titleCase(context.options.name)} Zsh CLI command completion script")}
#
# \${colors.bold("Installation:")} \${executablePath} completions zsh --config ~/.zshrc or \${executablePath} completions zsh --script or \${executablePath} completions zsh >> ~/.zshrc or \${executablePath} completions zsh >> ~/.zprofile on OSX. \`)}
\${colors.bold("_${bin}_completions()")}
{
  local reply
  local si=$IFS
  IFS=$'\\n' reply=($(COMP_CWORD="$((CURRENT-1))" COMP_LINE="$BUFFER" COMP_POINT="$CURSOR" \${executablePath} --get-completions "\\\${words[@]}"))
  IFS=$si
  if [[ \\\${#reply} -gt 0 ]]; then
    _describe 'values' reply
  else
    _default
  fi
}

if [[ "'\\\${zsh_eval_context[-1]}" == "loadautofunc" ]]; then
  _${bin}_completions "$@"
else
  compdef _${bin}_completions ${bin}
fi
complete -o bashdefault -o default -F _${bin}_completions ${bin}

\${colors.dim("###-end-${bin}-completions-###")}
\`);

  console.log("");
  if (payload.data.config) {
    let configFile = payload.data.config === true
      ? "~/.zshrc"
      : payload.data.config;
    if (configFile.startsWith("~")) {
      configFile = join(homedir, configFile.replace("~", ""));
    }

    let configFileContent = "";
    if (existsSync(configFile)) {
      configFileContent = await readFile(
        configFile,
        "utf8"
      );
    }

    await writeFile(
      configFile,
      configFileContent + "\\n\\n" + stripAnsi(script),
      "utf8"
    );

    console.log(colors.dim(\` > Zsh completion script added to \${configFile}\`));
  } else if (payload.data.script) {
    const scriptFile = typeof payload.data.script === "string"
      ? payload.data.script
      : "${bin}-completions.zsh";
    await writeFile(
      scriptFile,
      stripAnsi(script),
      "utf8"
    );

    console.log(colors.dim(\` > Zsh completion script written to \${scriptFile}\`));
  } else {
    console.log(script);
  }

  console.log("");
}

export default handler;

  `;
}
