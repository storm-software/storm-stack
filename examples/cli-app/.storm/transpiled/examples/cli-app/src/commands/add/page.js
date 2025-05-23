var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// examples/cli-app/src/types.ts
var __\u03A9AddPayload = ["file", "The file to add to the file system.", '"server.ts"', "type", "The type of the file.", '"server"', "AddPayload", `P&4!?">#&4$?%>&Mw'y`];
var __\u03A9AddPagePayload = ["file", "The file to add to the file system.", '"page.ts"', "AddPagePayload", 'P&4!?">#Mw$y'];

// examples/cli-app/src/commands/add/index.ts
import { StormPayload } from "examples/cli-app/.storm/runtime/payload";
import { useStorm } from "examples/cli-app/.storm/runtime/context";
function handler(event) {
  const payload = event.data;
  useStorm().log.info(`Adding ${payload.type} to file system on ${payload.file}`);
}
__name(handler, "handler");
handler.__type = [() => __\u03A9AddPayload, () => StormPayload, "event", "handler", "Add an item to the file system", 'PPn!7"2#"/$?%'];
var index_default = handler;

// examples/cli-app/src/commands/add/page.ts
import { StormPayload as StormPayload2 } from "examples/cli-app/.storm/runtime/payload";
function handler2(event) {
  index_default({
    ...event,
    data: {
      ...event.data,
      type: "page"
    }
  });
}
__name(handler2, "handler");
handler2.__type = [() => __\u03A9AddPagePayload, () => StormPayload2, "event", "handler", "Add a page to the file system", 'PPn!7"2#"/$?%'];
var page_default = handler2;
export {
  page_default as default
};
