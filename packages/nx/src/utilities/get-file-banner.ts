export const getFileBanner = (name: string, commentStart = "//") => {
  let padding = "";
  while (name.length + padding.length < 18) {
    padding += " ";
  }

  return `

${commentStart} -------------------------------------------------------------------
${commentStart}
${commentStart}                         ${padding}Storm Software
${commentStart}                 ⚡ Storm-Stack - ${name}
${commentStart}
${commentStart} This code was released as part of the Storm-Stack project. Storm-Stack
${commentStart} is maintained by Storm Software under the Apache License 2.0, and is
${commentStart} free for commercial and private use. For more information, please visit
${commentStart} our licensing page.
${commentStart}
${commentStart}    Website: https://stormsoftware.org
${commentStart}    Repository: https://github.com/storm-software/storm-stack
${commentStart}    Documentation: https://stormsoftware.org/docs/storm-stack
${commentStart}    Contact: https://stormsoftware.org/contact
${commentStart}    Licensing: https://stormsoftware.org/licensing
${commentStart}
${commentStart} -------------------------------------------------------------------


`;
};
